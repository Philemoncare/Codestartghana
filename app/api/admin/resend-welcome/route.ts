import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendApprovalEmail } from '@/lib/mail';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const sessionToken = cookies().get('admin_session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    const regRes = await query('SELECT email, full_name, status FROM registrations WHERE id = $1', [registrationId]);

    if ((regRes.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const student = regRes.rows[0];

    if (student.status !== 'approved') {
      return NextResponse.json({ error: 'Student must be approved before sending onboarding email' }, { status: 400 });
    }

    console.log(`[RESEND] Manually resending onboarding email to ${student.email}`);
    const emailResult = await sendApprovalEmail(student.email, student.full_name);

    if (emailResult.success) {
      await query(
        'UPDATE registrations SET approval_email_sent = TRUE, approval_email_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
        [registrationId]
      );
      return NextResponse.json({ success: true, message: 'Onboarding email resent successfully' });
    } else {
      return NextResponse.json({ error: emailResult.error || 'Failed to send email' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Resend Onboarding Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
