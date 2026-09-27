import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'meghsetu_admin_session';

export function getExpectedAdminToken(): string {
  return process.env.ADMIN_TOKEN || 'meghsetu-admin-secret-key-2026';
}

/**
 * Server-side check for admin session cookie.
 * Ensures the request is authenticated before rendering Server Component data.
 */
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return false;
  }
  return sessionCookie.value === getExpectedAdminToken();
}

/**
 * Returns the admin token if valid session exists, for inclusion in X-Admin-Token header.
 */
export async function getAdminTokenForApi(): Promise<string | null> {
  const isValid = await verifyAdminSession();
  if (!isValid) return null;
  return getExpectedAdminToken();
}
