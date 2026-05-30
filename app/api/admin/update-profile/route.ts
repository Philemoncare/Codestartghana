import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { fullName, email, phone } = await req.json();
    const sessionToken = cookies().get('admin_session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get current admin
    const adminRes = await query(
      `SELECT admin_id FROM admin_sessions WHERE session_token = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [sessionToken]
    );

    if (!adminRes || (adminRes.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = adminRes.rows[0].admin_id;

    // 2. Update profile (assuming columns exist or using placeholders)
    // Note: If you don't have fullName/phone columns in admins table yet, we should add them.
    // Let's check schema.sql again.
    await query(
      'UPDATE admins SET username = $1 WHERE id = $2',
      [email.toLowerCase().trim(), adminId]
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully.' });

  } catch (error: any) {
    console.error('UPDATE PROFILE ERROR:', error);
    if (error.code === '23505') {
       return NextResponse.json({ error: 'Email address is already in use by another admin.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal system error.' }, { status: 500 });
  }
}
