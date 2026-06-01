import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { createAlert } from '@/lib/alerts';

export async function GET() {
  try {
    await verifyAdmin();
    const res = await query('SELECT * FROM timetable ORDER BY id ASC');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('[FETCH TIMETABLE ERROR]:', error.message);
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

    const res = await query(
      'INSERT INTO timetable (day, time, topic, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [day, time, topic, description || null]
    );

    await createAlert('warning', `Timetable update: New topic '${topic}' added for ${day}`, 'admin');

    return NextResponse.json({
      success: true,
      message: 'Timetable entry created successfully',
      data: res.rows[0]
    });
  } catch (error: any) {
    console.error('[CREATE TIMETABLE ERROR]:', error.message);
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

    const res = await query(
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

    await createAlert('warning', `Timetable update: Entry for ${res.rows[0].day} modified`, 'admin');

    return NextResponse.json({
      success: true,
      message: 'Timetable entry updated successfully',
      data: res.rows[0]
    });
  } catch (error: any) {
    console.error('[UPDATE TIMETABLE ERROR]:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to update entry', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    const res = await query('DELETE FROM timetable WHERE id = $1', [id]);

    if (res.rowCount === 0) {
       return NextResponse.json({ success: false, message: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Entry deleted successfully' });
  } catch (error: any) {
    console.error('[DELETE TIMETABLE ERROR]:', error.message);
    return NextResponse.json({ success: false, message: 'Failed to delete entry', error: error.message }, { status: 500 });
  }
}
