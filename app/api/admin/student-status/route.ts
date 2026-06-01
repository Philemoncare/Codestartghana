import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { createAlert } from '@/lib/alerts';

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    // 1. Update the registration record
    const res = await query(
      `UPDATE registrations
       SET status = $1
       WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if ((res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Registration record not found' }, { status: 404 });
    }

    const registration = res.rows[0];

    await createAlert('warning', `Student status updated: ${registration.full_name} is now ${status}`, 'admin');

    // 2. Synchronize payment status and perform cleanup if rejected
    if (status === 'approved') {
      try {
        await query(
          "UPDATE payments SET payment_status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE registration_id = $1 AND payment_status != 'approved'",
          [id]
        );
      } catch (e) {
        console.warn('[SYSTEM] Payment sync failed (table might be missing):', e);
      }
    } else if (status === 'rejected') {
      console.log(`[SYSTEM] Revoking access and cleaning up records for rejected student ID: ${id}`);

      try {
        // Update associated payments to rejected
        await query(
          "UPDATE payments SET payment_status = 'rejected' WHERE registration_id = $1",
          [id]
        );
      } catch (e) {
        console.warn('[SYSTEM] Payment update failed:', e);
      }

      try {
        // Remove from Attendance Lists
        await query("DELETE FROM attendance WHERE registration_id = $1", [id]);
      } catch (e) {
        console.warn('[SYSTEM] Attendance cleanup failed (table might be missing):', e);
      }

      try {
        // Remove from any other active workflows (e.g., student progress)
        await query("DELETE FROM student_progress WHERE registration_id = $1", [id]);
      } catch (e) {
        console.warn('[SYSTEM] Progress cleanup failed (table might be missing):', e);
      }
    }

    return NextResponse.json(registration);
  } catch (error: any) {
    console.error('Update Student Status Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
