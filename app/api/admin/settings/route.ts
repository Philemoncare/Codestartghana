import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import { verifyAdmin, getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function ensureSettingsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(255) PRIMARY KEY,
      value TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    const studentAccessKeys = ['timetable_image'];
    const isAdmin = await getAdminSession();
    const studentEmail = cookies().get('student_email')?.value;

    if (!isAdmin && !studentEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (key && !studentAccessKeys.includes(key) && !isAdmin) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
      if (key) {
        const res = await query('SELECT value FROM settings WHERE key = $1', [key]);
        return NextResponse.json({ value: res.rows[0]?.value || null });
      }

      if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const res = await query('SELECT * FROM settings');
      return NextResponse.json(res.rows);
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        await ensureSettingsTable();
        return NextResponse.json(key ? { value: null } : []);
      }
      throw dbError;
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const { key, value } = await req.json();

    if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 });

    try {
      await query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      );
    } catch (dbError: any) {
      if (dbError.code === '42P01') {
        await ensureSettingsTable();
        await query(
          `INSERT INTO settings (key, value, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE
           SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
          [key, value]
        );
      } else {
        throw dbError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
