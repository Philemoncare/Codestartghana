import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createAlert } from '@/lib/alerts';

export async function POST(req: Request) {
  try {
    // 1. Parse FormData safely
    let formData;
    try {
      formData = await req.formData();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const registrationId = formData.get('registrationId');
    const studentName = formData.get('studentName') as string;
    const transactionId = formData.get('transactionId') as string;
    const senderNumber = formData.get('senderNumber') as string;
    const file = formData.get('file') as File | null;

    // 2. Validate all required fields
    if (!registrationId || !transactionId || !senderNumber || !studentName || !file) {
      console.error('Payment Validation Failed:', { registrationId, transactionId, senderNumber, studentName, hasFile: !!file });
      return NextResponse.json({ error: 'All payment details and a screenshot are required to proceed.' }, { status: 400 });
    }

    const regId = parseInt(registrationId as string, 10);
    if (isNaN(regId)) {
      return NextResponse.json({ error: 'Invalid registration session. Please restart the process.' }, { status: 400 });
    }

    // 3. Convert Image to Base64 (Serverless Compatible)
    let screenshotUrl = '';
    try {
      // Check file size (optional but recommended for DB storage)
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        return NextResponse.json({ error: 'Screenshot is too large. Please upload a file smaller than 2MB.' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString('base64');
      screenshotUrl = `data:${file.type};base64,${base64Image}`;
    } catch (fileError) {
      console.error('Base64 Conversion Error:', fileError);
      return NextResponse.json({ error: 'Failed to process the uploaded screenshot.' }, { status: 500 });
    }

    // 4. Database Insertion
    const res = await query(
      `INSERT INTO payments (registration_id, student_name, transaction_id, sender_number, screenshot_url, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [regId, studentName.trim(), transactionId.trim().toUpperCase(), senderNumber.trim(), screenshotUrl, 'pending']
    );

    if (!res || !res.rows || res.rows.length === 0) {
      throw new Error('Database failed to confirm payment record creation.');
    }

    // 5. Update Registration status to 'awaiting_verification'
    await query('UPDATE registrations SET status = $1 WHERE id = $2', ['awaiting_verification', regId]);

    await createAlert('warning', `Payment submitted by ${studentName.trim()} (Trans ID: ${transactionId.trim().toUpperCase()})`, 'student');

    // 6. Return Success JSON
    return NextResponse.json(res.rows[0]);

  } catch (error: any) {
    console.error('CRITICAL PAYMENT API ERROR:', error);

    // Duplicate Transaction ID
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This Transaction ID has already been submitted.' }, { status: 400 });
    }

    // Generic error fallback (MUST BE JSON)
    return NextResponse.json({
      error: 'An internal error occurred while processing your payment verification.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
