import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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

    // 3. File System Operations
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err: any) {
      if (err.code !== 'EEXIST') {
        console.error('Directory Creation Error:', err);
        return NextResponse.json({ error: 'Server could not prepare storage for screenshot.' }, { status: 500 });
      }
    }

    let screenshotUrl = '';
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = join(uploadDir, safeFileName);

      await writeFile(filePath, buffer);
      screenshotUrl = `/uploads/${safeFileName}`;
    } catch (fileError) {
      console.error('File Write Error:', fileError);
      return NextResponse.json({ error: 'Failed to save the uploaded screenshot.' }, { status: 500 });
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

    // 5. Update Registration status to 'awaiting_verification' (optional but good practice)
    await query('UPDATE registrations SET status = $1 WHERE id = $2', ['awaiting_verification', regId]);

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
