import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function POST() {
  try {
    const admin = await verifyAdmin();
    const adminId = admin.id;

    // Delete all sessions for this admin
    await query('DELETE FROM admin_sessions WHERE admin_id = $1', [adminId]);

    const response = NextResponse.json({ success: true });
    response.cookies.delete('admin_session');
    response.cookies.delete('admin_session_token');

    return response;
  } catch (error) {
    console.error('LOGOUT ALL ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
