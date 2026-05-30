import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function GET() {
  const sessionToken = cookies().get('admin_session_token')?.value;

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const res = await query(
      `SELECT a.username, a.role
       FROM admin_sessions s
       JOIN admins a ON s.admin_id = a.id
       WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
      [sessionToken]
    );

    if (!res || (res.rowCount ?? 0) === 0) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const admin = res.rows[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        email: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('AUTH ME ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
