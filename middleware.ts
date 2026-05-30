import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session');
  const pendingSession = request.cookies.get('pending_admin_id');
  const { pathname } = request.nextUrl;

  // STRICT ADMIN PROTECTION
  if (pathname.startsWith('/admin')) {
    // 1. Allow access to the login page
    if (pathname === '/admin/login') {
      if (session && session.value === 'active') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // 2. Allow access to the verification page ONLY if there's a pending session
    if (pathname === '/admin/verify') {
      if (session && session.value === 'active') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      if (!pendingSession) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      return NextResponse.next();
    }

    // 3. Handle root /admin
    if (pathname === '/admin') {
      if (session && session.value === 'active') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    // 4. Protect all other /admin routes
    if (!session || session.value !== 'active') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Handle old login path if it still exists
  if (pathname === '/login') {
     return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/login'],
};
