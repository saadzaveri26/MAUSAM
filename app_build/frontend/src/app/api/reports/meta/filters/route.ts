import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

export async function GET() {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/reports/meta/filters`, {
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 0 },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch filter metadata' },
      { status: 502 }
    );
  }
}
