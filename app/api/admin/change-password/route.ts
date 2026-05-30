import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();
    const sessionToken = cookies().get('admin_session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get current admin from session
    const adminRes = await query(
      `SELECT a.* FROM admins a
       JOIN admin_sessions s ON a.id = s.admin_id
       WHERE s.session_token = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
      [sessionToken]
    );

    if (!adminRes || (adminRes.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 401 });
    }

    const admin = adminRes.rows[0];

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Current security key is incorrect.' }, { status: 400 });
    }

    // 3. Hash new password
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    // 4. Update password
    await query('UPDATE admins SET password_hash = $1 WHERE id = $2', [newHash, admin.id]);

    // 5. Invalidate all sessions for this admin (Security Requirement)
    await query('DELETE FROM admin_sessions WHERE admin_id = $1', [admin.id]);

    // 6. Clear cookies
    const response = NextResponse.json({ success: true, message: 'Security key updated. All sessions invalidated.' });
    response.cookies.delete('admin_session');
    response.cookies.delete('admin_session_token');

    return response;

  } catch (error: any) {
    console.error('CHANGE PASSWORD ERROR:', error);
    return NextResponse.json({ error: 'Internal system error.' }, { status: 500 });
  }
}
