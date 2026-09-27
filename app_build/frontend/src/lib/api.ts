const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  (typeof window !== 'undefined' && (window as any).WEATHER_API_BASE) ||
  'http://127.0.0.1:8000';

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
  adminToken?: string
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (adminToken) {
    headers.set('X-Admin-Token', adminToken);
  }

  const res = await fetch(url, {
    ...options,
    headers,
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
