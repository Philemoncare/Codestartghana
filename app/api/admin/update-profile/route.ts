import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const admin = await verifyAdmin();
    const adminId = admin.id;

    // 2. Update profile
    await query(
      'UPDATE admins SET username = $1 WHERE id = $2',
      [email.toLowerCase().trim(), adminId]
    );

    return NextResponse.json({ success: true, message: 'Profile updated successfully.' });

  } catch (error: any) {
    console.error('UPDATE PROFILE ERROR:', error);
    if (error.code === '23505') {
       return NextResponse.json({ error: 'Email address is already in use by another admin.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal system error.' }, { status: 500 });
  }
}
