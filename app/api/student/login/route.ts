import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { email, password } = body;

    if (!email || !password) {
      console.warn('[LOGIN] Missing fields:', { hasEmail: !!email, hasPassword: !!password });
      return NextResponse.json({
        error: `Authentication incomplete. ${!email ? 'Email' : ''} ${!password ? 'Password' : ''} is required.`.replace('  ', ' '),
        details: { receivedEmail: !!email, receivedPassword: !!password }
      }, { status: 400 });
    }

    const trimmedEmail = email.toLowerCase().trim();
    // Get the most recent registration for this email
    const res = await query(
      `SELECT * FROM registrations WHERE email = $1 ORDER BY created_at DESC, id DESC LIMIT 1`,
      [trimmedEmail]
    );

    if (!res || (res.rowCount ?? 0) === 0) {
      return NextResponse.json({ error: 'No registration found with this email' }, { status: 404 });
    }

    const student = res.rows[0];

    // Check if password_hash exists
    if (!student.password_hash) {
      return NextResponse.json({
        error: 'Your account was created without a password. Please contact admin to reset it.',
        code: 'MISSING_PASSWORD'
      }, { status: 403 });
    }

    // 1. Verify Password
    const isMatch = await bcrypt.compare(password, student.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'The password you entered is incorrect.' }, { status: 401 });
    }

    // 2. Enforce Strict Admin Approval
    if (student.status === 'pending') {
      return NextResponse.json({
        error: 'Your application is still pending approval.',
        status: 'pending'
      }, { status: 403 });
    }

    if (student.status === 'rejected') {
      return NextResponse.json({
        error: 'Your application was not approved. Please contact support.',
        status: 'rejected'
      }, { status: 403 });
    }

    if (student.status !== 'approved') {
        return NextResponse.json({ error: 'Account is not in an active state.' }, { status: 403 });
    }

    const response = NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.full_name,
        status: student.status
      }
    });

    // Set student session cookie
    response.cookies.set('student_email', student.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('STUDENT LOGIN ERROR:', error);
    return NextResponse.json({ error: 'Internal system error', details: error.message }, { status: 500 });
  }
}

