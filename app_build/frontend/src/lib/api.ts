import { getBackendUrl } from './config';

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  adminToken?: string
): Promise<T> {
  const base = getBackendUrl();
  const url = `${base}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (adminToken) {
    headers.set('X-Admin-Token', adminToken);
  }

  const signal = options.signal || AbortSignal.timeout(15000);

  const res = await fetch(url, {
    ...options,
    headers,
    signal,
  });

  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.detail) errorDetail = errorJson.detail;
      else if (errorJson.message) errorDetail = errorJson.message;
    } catch {
      // Use fallback errorDetail
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export function apiGet<T = any>(endpoint: string, adminToken?: string): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'GET' }, adminToken);
}

export function apiPost<T = any>(endpoint: string, body: any, adminToken?: string): Promise<T> {
  return apiFetch<T>(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    adminToken
  );
}

export function apiPatch<T = any>(endpoint: string, body: any, adminToken?: string): Promise<T> {
  return apiFetch<T>(
    endpoint,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
    adminToken
  );
}
