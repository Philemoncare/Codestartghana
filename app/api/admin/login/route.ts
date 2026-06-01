import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/mail';
import { createAlert } from '@/lib/alerts';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Identification and security key required' }, { status: 400 });
    }

    const res = await query('SELECT * FROM admins WHERE username = $1', [email.toLowerCase().trim()]);

    if (!res || (res.rowCount ?? 0) === 0) {
      // Security: Use same error message for non-existent user to prevent enumeration
      await createAlert('critical', `Unauthorized access attempt: Username '${email}' not found.`, 'system');
      return NextResponse.json({ error: 'Access Denied: Invalid credentials' }, { status: 401 });
    }

    const admin = res.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      await createAlert('critical', `Failed login attempt for admin: ${admin.username}`, 'system');
      return NextResponse.json({ error: 'Access Denied: Invalid credentials' }, { status: 401 });
    }

    // 1. Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    // 2. Save code to database with security metadata
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await query(
      'INSERT INTO verification_codes (admin_id, code, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [admin.id, code, expiresAt, ip, userAgent]
    );

    // 3. Send Email
    const emailResult = await sendVerificationEmail(admin.username, code);

    if (!emailResult.success) {
       return NextResponse.json({
         error: `Security system could not deliver verification email. Please contact support.`,
       }, { status: 500 });
    }

    // 4. Set temporary cookie to track verification state
    const response = NextResponse.json({
      success: true,
      requiresVerification: true,
      email: String(admin.username)
    });

    try {
      response.cookies.set('pending_admin_id', String(admin.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10,
        path: '/'
      });
    } catch (cookieError) {
      console.error('Cookie Set Error:', cookieError);
    }

    return response;
  } catch (error: any) {
    console.error('CRITICAL ADMIN LOGIN ERROR:', error);
    return NextResponse.json({ error: 'Internal system error during authentication.' }, { status: 500 });
  }
}
