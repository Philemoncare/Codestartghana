import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  const studentEmail = cookies().get('student_email')?.value;
  if (!studentEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const res = await query('SELECT id, full_name, email, whatsapp, school, experience, motivation, status, profile_photo_url, created_at FROM registrations WHERE email = $1', [studentEmail]);
    if (res.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    return NextResponse.json(res.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const studentEmail = cookies().get('student_email')?.value;
  if (!studentEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { full_name, whatsapp, school, current_password, new_password, profile_photo_url } = await req.json();

    // Verify student exists
    const studentRes = await query('SELECT id, password_hash FROM registrations WHERE email = $1', [studentEmail]);
    if (studentRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    const student = studentRes.rows[0];

    let passwordHash = student.password_hash;

    // Handle password change if requested
    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ error: 'Current password is required to set a new one' }, { status: 400 });
      }
      const isMatch = await bcrypt.compare(current_password, student.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
      }
      passwordHash = await bcrypt.hash(new_password, 10);
    }

    const res = await query(
      `UPDATE registrations
       SET full_name = COALESCE($1, full_name),
           whatsapp = COALESCE($2, whatsapp),
           school = COALESCE($3, school),
           password_hash = $4,
           profile_photo_url = COALESCE($5, profile_photo_url)
       WHERE email = $6
       RETURNING id, full_name, email, whatsapp, school, profile_photo_url`,
      [full_name, whatsapp, school, passwordHash, profile_photo_url, studentEmail]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: res.rows[0]
    });
  } catch (error: any) {
    console.error('PROFILE UPDATE ERROR:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
