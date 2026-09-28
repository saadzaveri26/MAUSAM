import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'meghsetu_admin_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export function getExpectedAdminToken(): string {
  const tok = process.env.ADMIN_TOKEN;
  if (!tok || tok.length < 24) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_TOKEN must be set and at least 24 characters');
    }
    return tok || 'meghsetu-admin-secret-key-2026';
  }
  return tok;
}

export async function createSessionHash(expiry: number, secret: string): Promise<string> {
  const data = new TextEncoder().encode(`meghsetu:${expiry}:${secret}`);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSessionCookieValue(): Promise<string> {
  const secret = getExpectedAdminToken();
  const expiry = Date.now() + SESSION_TTL_MS;
  const hash = await createSessionHash(expiry, secret);
  return `${expiry}.${hash}`;
}

export async function isValidSessionValue(cookieValue?: string): Promise<boolean> {
  if (!cookieValue) return false;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return false;
  const [expiryStr, hash] = parts;
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;
  const secret = getExpectedAdminToken();
  const expectedHash = await createSessionHash(expiry, secret);
  if (hash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) {
    diff |= hash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  return isValidSessionValue(sessionCookie?.value);
}

export async function getAdminTokenForApi(): Promise<string | null> {
  const isValid = await verifyAdminSession();
  if (!isValid) return null;
  return getExpectedAdminToken();
}
