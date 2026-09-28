import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'meghsetu_admin_session';

async function createHash(expiry: number, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`meghsetu:${expiry}:${secret}`);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function isAuth(cookieVal?: string): Promise<boolean> {
  if (!cookieVal) return false;
  const parts = cookieVal.split('.');
  if (parts.length !== 2) return false;
  const [expiryStr, hash] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;
  const secret = process.env.ADMIN_TOKEN || 'meghsetu-admin-secret-key-2026';
  const expected = await createHash(expiry, secret);
  if (hash.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
    const authenticated = await isAuth(sessionCookie?.value);

    if (pathname === '/admin/login') {
      if (authenticated) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!authenticated) {
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
