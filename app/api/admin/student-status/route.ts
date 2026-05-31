import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

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

    // 2. Synchronize payment status if a payment exists
    if (status === 'approved') {
      await query(
        "UPDATE payments SET payment_status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE registration_id = $1 AND payment_status != 'approved'",
        [id]
      );
    } else if (status === 'rejected') {
      await query(
        "UPDATE payments SET payment_status = 'rejected' WHERE registration_id = $1",
        [id]
      );
    }

    return NextResponse.json(registration);
  } catch (error: any) {
    console.error('Update Student Status Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
