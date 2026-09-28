import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, getExpectedAdminToken, createSessionCookieValue } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const expectedToken = getExpectedAdminToken();

    if (token.trim() !== expectedToken.trim()) {
      return NextResponse.json({ error: 'Invalid admin token' }, { status: 401 });
    }

    const sessionCookieValue = await createSessionCookieValue();
    const response = NextResponse.json({ success: true, message: 'Authenticated' });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: sessionCookieValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Server error processing token' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
