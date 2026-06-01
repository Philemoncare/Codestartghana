import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendRegistrationReceivedEmail, sendDetailedOnboardingEmail } from '@/lib/mail';
import { sendRegistrationConfirmationSMS } from '@/lib/sms';
import bcrypt from 'bcryptjs';
import { createAlert } from '@/lib/alerts';

export async function POST(req: Request) {
  try {
    // 1. Parse JSON safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { fullName, email, password, whatsapp, age, school, experience, motivation } = body;

    // 2. Validate mandatory fields
    if (!fullName || !email || !password || !whatsapp) {
      return NextResponse.json({ error: 'Missing required fields: Full Name, Email, Password, and WhatsApp are required.' }, { status: 400 });
    }

    // 2.5 Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const normalizedEmail = email.toLowerCase().trim();

    // 2.6 Check for active registration (Pending or Approved)
    // This allows re-application if previous attempts were 'rejected'
    const activeCheck = await query(
      "SELECT id, status FROM registrations WHERE email = $1 AND status != 'rejected' LIMIT 1",
      [normalizedEmail]
    );

    if ((activeCheck.rowCount ?? 0) > 0) {
      return NextResponse.json({
        error: 'This email address is already registered.',
        details: 'An active application already exists for this email.'
      }, { status: 400 });
    }

    // 3. Database Insertion
    let res;
    try {
      res = await query(
        `INSERT INTO registrations (full_name, email, password_hash, whatsapp, age, school, experience, motivation, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          fullName.trim(),
          normalizedEmail,
          passwordHash,
          whatsapp.trim(),
          age ? parseInt(age.toString()) : null,
          school ? school.trim() : 'N/A',
          experience || 'beginner',
          motivation ? motivation.trim() : '',
          'pending'
        ]
      );
    } catch (dbError: any) {
      console.error('DB INSERT ERROR:', dbError);

      const errorMessage = dbError.message || '';
      // If error is about missing columns, provide a specific error message
      if (errorMessage.includes('column') || errorMessage.includes('does not exist') || errorMessage.includes('password_hash')) {
        return NextResponse.json({
          error: 'Database schema is outdated (missing columns). Please run the admin setup fix to update tables.',
          code: 'SCHEMA_OUTDATED',
          details: errorMessage
        }, { status: 500 });
      }
      throw dbError; // Rethrow for general handler
    }

    if (!res || !res.rows || res.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to create registration record in database.' }, { status: 500 });
    }

    await createAlert('warning', `New student registration: ${fullName.trim()} (${normalizedEmail})`, 'student');

    // 3.5 Trigger Communications (Non-blocking)
    const studentData = res.rows[0];

    // 1. Send SMS
    sendRegistrationConfirmationSMS(whatsapp.trim(), fullName.trim())
      .catch(err => console.error('Failed to send registration SMS:', err));

    // 2. Send Detailed Onboarding Email
    sendDetailedOnboardingEmail(normalizedEmail, studentData)
      .catch(err => console.error('Failed to send detailed onboarding email:', err));

    // 4. Return Success JSON
    return NextResponse.json(studentData);

  } catch (error: any) {
    console.error('CRITICAL REGISTRATION API ERROR:', error);

    // Specific error for unique constraint (email)
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This email address is already registered.' }, { status: 400 });
    }

    // Generic error fallback (MUST BE JSON)
    return NextResponse.json({
      error: 'A server-side error occurred while processing your registration.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
