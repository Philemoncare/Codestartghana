import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const studentEmail = cookies().get('student_email')?.value;
  if (!studentEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Use ORDER BY created_at DESC, id DESC to ensure we get the latest application if multiple exist (due to re-application)
    const res = await query(
      'SELECT id, full_name, email, whatsapp, school, experience, motivation, status, profile_photo_url, created_at FROM registrations WHERE email = $1 ORDER BY created_at DESC, id DESC LIMIT 1',
      [studentEmail]
    );

    if (res.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const student = res.rows[0];
    return NextResponse.json({
      ...student,
      fullName: student.full_name,
      profilePhotoUrl: student.profile_photo_url
    });
  } catch (error: any) {
    console.error('FETCH PROFILE ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const studentEmail = cookies().get('student_email')?.value;
  if (!studentEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const headerList = headers();
  const ip = headerList.get('x-forwarded-for') || 'unknown';
  const ua = headerList.get('user-agent') || 'unknown';

  try {
    const { full_name, whatsapp, school, current_password, new_password, profile_photo_url } = await req.json();

    // Verify student exists - Get the most recent registration
    const studentRes = await query(
      'SELECT id, password_hash, full_name, whatsapp, school, profile_photo_url FROM registrations WHERE email = $1 ORDER BY created_at DESC, id DESC LIMIT 1',
      [studentEmail]
    );

    if (studentRes.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    const student = studentRes.rows[0];

    // Use passed values if they are non-empty strings, else keep existing DB values
    const finalFullName = (full_name && full_name.trim()) ? full_name.trim() : student.full_name;
    const finalWhatsApp = (whatsapp && whatsapp.trim()) ? whatsapp.trim() : student.whatsapp;
    const finalSchool = (school && school.trim()) ? school.trim() : student.school;
    const finalPhoto = (profile_photo_url && profile_photo_url.trim()) ? profile_photo_url : student.profile_photo_url;

    let passwordHash = student.password_hash;
    let passwordChanged = false;

    // Handle password change if requested
    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ error: 'Current password is required to set a new one' }, { status: 400 });
      }

      const isMatch = await bcrypt.compare(current_password, student.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
      }

      // Prevent password reuse
      const isSame = await bcrypt.compare(new_password, student.password_hash);
      if (isSame) {
        return NextResponse.json({ error: 'New password cannot be the same as your old password.' }, { status: 400 });
      }

      passwordHash = await bcrypt.hash(new_password, 10);
      passwordChanged = true;
    }

    await query('BEGIN');
    try {
      const res = await query(
        `UPDATE registrations
         SET full_name = $1,
             whatsapp = $2,
             school = $3,
             password_hash = $4,
             profile_photo_url = $5
         WHERE id = $6
         RETURNING id, full_name, email, whatsapp, school, profile_photo_url`,
        [finalFullName, finalWhatsApp, finalSchool, passwordHash, finalPhoto, student.id]
      );

      if (passwordChanged) {
        await query(
          'INSERT INTO activity_logs (registration_id, action, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
          [student.id, 'PASSWORD_CHANGE_MANUAL', ip, ua]
        );
      }

      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        data: res.rows[0]
      });
    } catch (dbError) {
      await query('ROLLBACK');
      throw dbError;
    }
  } catch (error: any) {
    console.error('PROFILE UPDATE ERROR:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
