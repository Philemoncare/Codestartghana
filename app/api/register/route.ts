import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendRegistrationReceivedEmail } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    // 1. Parse JSON safely
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { fullName, email, whatsapp, age, school, experience, motivation } = body;

    // 2. Validate mandatory fields
    if (!fullName || !email || !whatsapp) {
      return NextResponse.json({ error: 'Missing required fields: Full Name, Email, and WhatsApp are required.' }, { status: 400 });
    }

    // 3. Database Insertion
    const res = await query(
      `INSERT INTO registrations (full_name, email, whatsapp, age, school, experience, motivation)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        fullName.trim(),
        email.toLowerCase().trim(),
        whatsapp.trim(),
        age ? parseInt(age.toString()) : null,
        school ? school.trim() : 'N/A',
        experience || 'beginner',
        motivation ? motivation.trim() : ''
      ]
    );

    if (!res || !res.rows || res.rows.length === 0) {
      return NextResponse.json({ error: 'Failed to create registration record in database.' }, { status: 500 });
    }

    // 3.5 Send Registration Received Email (Non-blocking)
    sendRegistrationReceivedEmail(email.toLowerCase().trim(), fullName.trim())
      .catch(err => console.error('Failed to send registration email:', err));

    // 4. Return Success JSON
    return NextResponse.json(res.rows[0]);

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
