import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await verifyAdmin();
    const res = await query(`
      SELECT p.*, r.approval_email_sent, r.approval_email_sent_at
      FROM payments p
      LEFT JOIN registrations r ON p.registration_id = r.id
      ORDER BY p.created_at DESC
    `);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('Fetch Payments Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
