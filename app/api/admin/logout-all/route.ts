import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const sessionToken = cookies().get('admin_session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the admin_id for the current session
    const res = await query('SELECT admin_id FROM admin_sessions WHERE session_token = $1', [sessionToken]);

    if (res && (res.rowCount ?? 0) > 0) {
      const adminId = res.rows[0].admin_id;
      // Delete all sessions for this admin
      await query('DELETE FROM admin_sessions WHERE admin_id = $1', [adminId]);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');
    response.cookies.delete('admin_session_token');

    return response;
  } catch (error) {
    console.error('LOGOUT ALL ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
