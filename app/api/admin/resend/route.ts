import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import { sendVerificationEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const adminIdStr = cookies().get('pending_admin_id')?.value;

    if (!adminIdStr) {
      return NextResponse.json({ error: 'Session expired. Please login again.' }, { status: 400 });
    }

    const adminId = parseInt(adminIdStr);

    const res = await query('SELECT username FROM admins WHERE id = $1', [adminId]);
    if (!res || (res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
    }

    const admin = res.rows[0];

    // 1. Generate new 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

    // 2. Save new code
    await query(
      'INSERT INTO verification_codes (admin_id, code, expires_at) VALUES ($1, $2, $3)',
      [adminId, code, expiresAt]
    );

    // 3. Send Email
    const emailResult = await sendVerificationEmail(admin.username, code);

    if (!emailResult.success) {
      if (process.env.NODE_ENV === 'development') {
        console.log('--- RESENT VERIFICATION CODE (DEV):', code);
      } else {
        return NextResponse.json({ error: 'Could not deliver email.' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('RESEND ERROR:', error);
    return NextResponse.json({ error: 'Internal system error.' }, { status: 500 });
  }
}
