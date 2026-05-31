import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

/**
 * Helper to ensure table exists or handle errors by auto-creating the missing table
 */
async function ensureTableAndQuery(queryText: string, params: any[] = []) {
  try {
    return await query(queryText, params);
  } catch (error: any) {
    // PostgreSQL error code 42P01 is "undefined_table"
    if (error.code === '42P01' || (error.message && error.message.includes('does not exist'))) {
      console.log('[TIMETABLE] Table missing, attempting auto-creation...');
      await query(`
        CREATE TABLE IF NOT EXISTS timetable (
          id SERIAL PRIMARY KEY,
          day VARCHAR(20) NOT NULL,
          time VARCHAR(100) NOT NULL,
          topic VARCHAR(255) NOT NULL,
          description TEXT,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      // Retry the original query after creating the table
      return await query(queryText, params);
    }
    throw error;
  }
}

export async function GET() {
  try {
    await verifyAdmin();
    const res = await ensureTableAndQuery('SELECT * FROM timetable ORDER BY id ASC');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('FETCH TIMETABLE ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const { day, time, topic, description } = await req.json();

    if (!day || !time || !topic) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: Day, Time, and Topic are mandatory.'
      }, { status: 400 });
    }

    const res = await ensureTableAndQuery(
      'INSERT INTO timetable (day, time, topic, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [day, time, topic, description || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Timetable entry created successfully',
      data: res.rows[0]
    });
  } catch (error: any) {
    console.error('CREATE TIMETABLE ERROR:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create timetable entry',
      error: error.message
    }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await verifyAdmin();
    const { id, day, time, topic, description } = await req.json();

    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    const res = await ensureTableAndQuery(
      `UPDATE timetable
       SET day = COALESCE($1, day),
           time = COALESCE($2, time),
           topic = COALESCE($3, topic),
           description = COALESCE($4, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [day, time, topic, description, id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Timetable entry updated successfully',
      data: res.rows[0]
    });
  } catch (error: any) {
    console.error('UPDATE TIMETABLE ERROR:', error);
    return NextResponse.json({ success: false, message: 'Failed to update entry', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    const res = await ensureTableAndQuery('DELETE FROM timetable WHERE id = $1', [id]);

    if (res.rowCount === 0) {
       return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error: any) {
    console.error('DELETE TIMETABLE ERROR:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete entry', error: error.message }, { status: 500 });
  }
}
