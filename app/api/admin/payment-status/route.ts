import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendApprovalEmail } from '@/lib/mail';
import { verifyAdmin } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    // 1. Update the payment record
    const payRes = await query(
      `UPDATE payments
       SET payment_status = $1
       WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if ((payRes.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    const payment = payRes.rows[0];

    // 1.1 Update approved_at timestamp
    if (status === 'approved') {
      await query('UPDATE payments SET approved_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    }

    // 2. If approved, update registration and send automated email
    if (status === 'approved' && payment.registration_id) {
      try {
        // Update registration status
        await query(
          'UPDATE registrations SET status = $1 WHERE id = $2',
          ['approved', payment.registration_id]
        );

        // Fetch student email for the welcome message
        const regRes = await query('SELECT email, full_name FROM registrations WHERE id = $1', [payment.registration_id]);

        if ((regRes.rowCount ?? 0) > 0) {
          const student = regRes.rows[0];
          console.log(`[APPROVAL] Triggering onboarding email for ${student.email}`);

          // SEND AUTOMATED APPROVAL EMAIL
          const emailResult = await sendApprovalEmail(student.email, student.full_name);

          if (emailResult.success) {
            // Update email tracking columns in DB
            await query(
              'UPDATE registrations SET approval_email_sent = TRUE, approval_email_sent_at = CURRENT_TIMESTAMP WHERE id = $1',
              [payment.registration_id]
            );
            console.log(`[APPROVAL] Database updated with email success for ${student.email}`);
          }
        }
      } catch (innerError) {
        console.error('[APPROVAL] Secondary process error:', innerError);
      }
    } else if (status === 'rejected' && payment.registration_id) {
        // If payment/application is rejected, update registration and clean up
        await query(
          'UPDATE registrations SET status = $1 WHERE id = $2',
          ['rejected', payment.registration_id]
        );

        // Remove from active lists (Attendance and Progress)
        await query('DELETE FROM attendance WHERE registration_id = $1', [payment.registration_id]);
        await query('DELETE FROM student_progress WHERE registration_id = $1', [payment.registration_id]);
    }

    return NextResponse.json({ ...payment, emailSent: status === 'approved' });
  } catch (error: any) {
    console.error('Update Status Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
