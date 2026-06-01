import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await verifyAdmin();
    const res = await query(`
      SELECT r.*,
             (SELECT p.payment_status FROM payments p WHERE p.registration_id = r.id ORDER BY p.created_at DESC LIMIT 1) as payment_status,
             (SELECT p.transaction_id FROM payments p WHERE p.registration_id = r.id ORDER BY p.created_at DESC LIMIT 1) as last_transaction_id
      FROM registrations r
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('FETCH REGISTRATIONS ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Hard delete the registration record (cascade will handle payments/attendance if configured)
    await query('DELETE FROM registrations WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Registration record permanently deleted.' });
  } catch (error: any) {
    console.error('DELETE REGISTRATION ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
