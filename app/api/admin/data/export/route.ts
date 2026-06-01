import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 0. Auth check
    const sessionToken = cookies().get('admin_session_token')?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch all data
    const registrations = await query('SELECT * FROM registrations ORDER BY id ASC');
    const payments = await query('SELECT * FROM payments ORDER BY id ASC');

    const exportData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      registrations: registrations.rows,
      payments: payments.rows
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="codestart_registry_export_${new Date().getTime()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('EXPORT ERROR:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
