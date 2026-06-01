import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await verifyAdmin();

    // Fetch from the fixed production schema
    const res = await query(
      `SELECT
        id,
        student_name,
        phone_number as recipient,
        message_body as message,
        'sms' as type,
        status,
        provider_response,
        created_at
       FROM sms_logs
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('[FETCH SMS LOGS ERROR]:', error.message);

    // Check for common schema errors to provide better debugging info
    if (error.message.includes('relation "sms_logs" does not exist')) {
      return NextResponse.json({
        error: 'Database table "sms_logs" is missing. Please run the Admin Setup migration.'
      }, { status: 500 });
    }

    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
