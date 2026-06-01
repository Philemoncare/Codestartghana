import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find the student
    const studentRes = await query(
      'SELECT id, full_name, status FROM registrations WHERE email = $1 AND status != \'rejected\' ORDER BY created_at DESC LIMIT 1',
      [normalizedEmail]
    );

    if (studentRes.rowCount === 0) {
      // For security, don't reveal if email exists or not
      return NextResponse.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
    }

    const student = studentRes.rows[0];

    // 2. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60000); // 15 minutes

    // 3. Save to database
    await query(
      'INSERT INTO student_password_resets (registration_id, code, expires_at) VALUES ($1, $2, $3)',
      [student.id, code, expiresAt]
    );

    // 4. Send Email
    const emailResult = await sendPasswordResetEmail(normalizedEmail, student.full_name, code);

    // LOG FOR USER CONSOLE (Since email might be failing)
    console.log('------------------------------------------');
    console.log(`[SECURITY] Password Reset Code for ${normalizedEmail}: ${code}`);
    console.log(`[SECURITY] Email Delivery Status: ${emailResult.success ? 'SUCCESS' : 'FAILED'}`);
    if (!emailResult.success) console.log(`[SECURITY] Error: ${emailResult.error}`);
    console.log('------------------------------------------');

    return NextResponse.json({ success: true, message: 'If an account exists, a reset code has been sent.' });
  } catch (error: any) {
    console.error('RESET REQUEST ERROR:', error);
    return NextResponse.json({ error: 'Internal system error' }, { status: 500 });
  }
}
