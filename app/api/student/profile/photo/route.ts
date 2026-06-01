import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const studentEmail = cookies().get('student_email')?.value;
    if (!studentEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Convert file to base64 for database storage (simplest for this project structure)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    await query(
      'UPDATE registrations SET profile_photo_url = $1 WHERE email = $2',
      [base64, studentEmail]
    );

    return NextResponse.json({ success: true, url: base64 });
  } catch (error: any) {
    console.error('PHOTO UPLOAD ERROR:', error);
    return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
  }
}
