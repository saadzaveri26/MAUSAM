import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'meghsetu_admin_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const expectedToken = process.env.ADMIN_TOKEN || 'meghsetu-admin-secret-key-2026';

  // Only handle /admin routes
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    const isAuthenticated = sessionCookie && sessionCookie.value === expectedToken;

    // If navigating to /admin/login while already authenticated, go to /admin
    if (pathname === '/admin/login') {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // For all other /admin routes, require authenticated session
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
