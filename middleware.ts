import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session');
  const pendingAdminId = request.cookies.get('pending_admin_id');
  const studentSession = request.cookies.get('student_email');
  const { pathname } = request.nextUrl;

  // 1. STUDENT PORTAL PROTECTION & REDIRECTION
  const isStudentPortalRoute = pathname.startsWith('/student/dashboard') || pathname.startsWith('/student/profile');
  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/enroll' || pathname === '/forgot-password' || pathname === '/reset-password';

  // If logged in as a student
  if (studentSession) {
    // If trying to access public landing pages or registration
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  } else {
    // If NOT logged in as a student but trying to access student portal
    if (isStudentPortalRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. ADMIN PROTECTION
  if (pathname.startsWith('/admin')) {
    // Allow login page
    if (pathname === '/admin/login') {
      if (adminSession && adminSession.value === 'active') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Allow verification page if pending
    if (pathname === '/admin/verify') {
      if (adminSession && adminSession.value === 'active') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (!pendingAdminId) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      return NextResponse.next();
    }

    // Handle root /admin
    if (pathname === '/admin') {
      if (adminSession && adminSession.value === 'active') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    // Protect all other /admin routes
    if (!adminSession || adminSession.value !== 'active') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Handle old paths
  if (pathname === '/student/login' || pathname === '/login/student') {
     return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/enroll',
    '/forgot-password',
    '/reset-password',
    '/admin',
    '/admin/:path*',
    '/student/:path*'
  ],
};
