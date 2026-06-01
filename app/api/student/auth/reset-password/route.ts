import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, code, newPassword } = await req.json();
    const headerList = headers();
    const ip = headerList.get('x-forwarded-for') || 'unknown';
    const ua = headerList.get('user-agent') || 'unknown';

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: 'Email, code, and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
       return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find student and valid reset code
    const resetRes = await query(
      `SELECT r.id, pr.id as reset_id, r.password_hash as current_hash
       FROM registrations r
       JOIN student_password_resets pr ON r.id = pr.registration_id
       WHERE r.email = $1
         AND pr.code = $2
         AND pr.used = FALSE
         AND pr.expires_at > CURRENT_TIMESTAMP
       ORDER BY pr.created_at DESC
       LIMIT 1`,
      [normalizedEmail, code]
    );

    if (resetRes.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset code.' }, { status: 400 });
    }

    const { id: registrationId, reset_id, current_hash } = resetRes.rows[0];

    // 1.5 Prevent password reuse
    if (current_hash) {
       const isSame = await bcrypt.compare(newPassword, current_hash);
       if (isSame) {
          return NextResponse.json({ error: 'New password cannot be the same as your old password.' }, { status: 400 });
       }
    }

    // 2. Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // 3. Update password, mark code as used, and log activity
    await query('BEGIN');
    try {
      await query(
        'UPDATE registrations SET password_hash = $1 WHERE id = $2',
        [passwordHash, registrationId]
      );
      await query(
        'UPDATE student_password_resets SET used = TRUE WHERE id = $1',
        [reset_id]
      );

      // LOG ACTIVITY
      await query(
        'INSERT INTO activity_logs (registration_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
        [registrationId, 'PASSWORD_RESET', ip, ua]
      );

      await query('COMMIT');
    } catch (e) {
      await query('ROLLBACK');
      throw e;
    }

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error: any) {
    console.error('RESET PASSWORD ERROR:', error);
    return NextResponse.json({ error: 'Internal system error' }, { status: 500 });
  }
}
