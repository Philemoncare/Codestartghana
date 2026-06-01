import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { sendSMS } from '@/lib/sms';

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    // 1. Fetch the failed log from sms_logs
    const res = await query('SELECT * FROM sms_logs WHERE id = $1', [id]);
    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'SMS log not found' }, { status: 404 });
    }

    const log = res.rows[0];

    // 2. Attempt to resend using Termii
    const result = await sendSMS(log.phone_number, log.message_body, log.student_name);

    if (result.success) {
        return NextResponse.json({ success: true, message: 'Message resent successfully' });
    } else {
        return NextResponse.json({ error: result.error || 'Failed to resend message' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[RETRY SMS ERROR]:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
