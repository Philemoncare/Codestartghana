import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const adminIdStr = cookies().get('pending_admin_id')?.value;

    if (!adminIdStr || !code) {
      return NextResponse.json({ error: 'Session expired or missing code.' }, { status: 400 });
    }

    const adminId = parseInt(adminIdStr);

    // 1. Validate the code
    const res = await query(
      `SELECT * FROM verification_codes
       WHERE admin_id = $1 AND code = $2 AND verified = FALSE AND expires_at > CURRENT_TIMESTAMP
       ORDER BY created_at DESC LIMIT 1`,
      [adminId, code]
    );

    if (!res || (res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    const verification = res.rows[0];

    // 2. Mark as verified
    await query('UPDATE verification_codes SET verified = TRUE WHERE id = $1', [verification.id]);

    // 3. Create a production-grade session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await query(
      `INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, sessionToken, expiresAt, ip, userAgent]
    );

    // 4. Final response and cookie management
    const response = NextResponse.json({ success: true });

    // Clear pending ID
    response.cookies.delete('pending_admin_id');

    // Set permanent session cookie
    response.cookies.set('admin_session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/'
    });

    // Mark as active for backward compatibility with existing layout logic
    response.cookies.set('admin_session', 'active', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('VERIFICATION ERROR:', error);
    return NextResponse.json({ error: 'System error during verification.' }, { status: 500 });
  }
}
