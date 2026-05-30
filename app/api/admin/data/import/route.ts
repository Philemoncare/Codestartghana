import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 0. Auth check
    const sessionToken = cookies().get('admin_session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { registrations, payments } = await req.json();

    if (!Array.isArray(registrations)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    console.log(`[IMPORT] Starting import of ${registrations.length} registrations and ${payments?.length || 0} payments...`);

    // 1. Clear existing data to avoid conflicts (Standard for full restore)
    await query('TRUNCATE TABLE payments CASCADE');
    await query('TRUNCATE TABLE registrations RESTART IDENTITY CASCADE');

    // 2. Import Registrations
    for (const reg of registrations) {
      await query(
        `INSERT INTO registrations (
          id, full_name, email, whatsapp, age, school, experience, motivation, status,
          approval_email_sent, approval_email_sent_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          reg.id, reg.full_name, reg.email, reg.whatsapp, reg.age, reg.school,
          reg.experience, reg.motivation, reg.status,
          reg.approval_email_sent, reg.approval_email_sent_at, reg.created_at
        ]
      );
    }

    // 3. Import Payments if they exist
    if (Array.isArray(payments)) {
      for (const pay of payments) {
        await query(
          `INSERT INTO payments (
            id, registration_id, student_name, transaction_id, sender_number,
            payment_status, screenshot_url, approved_at, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            pay.id, pay.registration_id, pay.student_name, pay.transaction_id,
            pay.sender_number, pay.payment_status, pay.screenshot_url,
            pay.approved_at, pay.created_at
          ]
        );
      }
    }

    // 4. Reset sequences to prevent next manual insert from failing
    await query("SELECT setval('registrations_id_seq', (SELECT MAX(id) FROM registrations))");
    await query("SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments))");

    console.log('[IMPORT] Import completed successfully.');
    return NextResponse.json({ success: true, message: 'Data imported successfully' });
  } catch (error: any) {
    console.error('IMPORT ERROR:', error);
    return NextResponse.json({ error: error.message || 'Import failed' }, { status: 500 });
  }
}
