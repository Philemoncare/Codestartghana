import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const timetableId = searchParams.get('timetableId');
    const registrationId = searchParams.get('registrationId');

    if (timetableId) {
      // Get all students who attended a specific class
      const res = await query(
        `SELECT a.*, r.full_name, r.email
         FROM attendance a
         JOIN registrations r ON a.registration_id = r.id
         WHERE a.timetable_id = $1`,
        [timetableId]
      );
      return NextResponse.json(res.rows);
    }

    if (registrationId) {
      // Get attendance history for a specific student
      const res = await query(
        `SELECT a.*, t.topic, t.day, t.time
         FROM attendance a
         JOIN timetable t ON a.timetable_id = t.id
         WHERE a.registration_id = $1`,
        [registrationId]
      );
      return NextResponse.json(res.rows);
    }

    // Default: Get all attendance records
    const res = await query('SELECT * FROM attendance ORDER BY attended_at DESC');
    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await verifyAdmin();
    const { registrationId, timetableId } = await req.json();

    if (!registrationId || !timetableId) {
      return NextResponse.json({ error: 'registrationId and timetableId required' }, { status: 400 });
    }

    // Prevent duplicate attendance for the same session
    const check = await query(
      'SELECT id FROM attendance WHERE registration_id = $1 AND timetable_id = $2',
      [registrationId, timetableId]
    );

    if (check.rowCount > 0) {
      return NextResponse.json({ error: 'Attendance already marked' }, { status: 400 });
    }

    const res = await query(
      'INSERT INTO attendance (registration_id, timetable_id) VALUES ($1, $2) RETURNING *',
      [registrationId, timetableId]
    );

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await verifyAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await query('DELETE FROM attendance WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
