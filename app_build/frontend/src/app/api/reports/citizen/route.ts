import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = getBackendUrl();
    const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (forwardedFor) {
      headers['X-Forwarded-For'] = forwardedFor;
    }

    const response = await fetch(`${backendUrl}/api/reports/citizen`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit citizen report' },
      { status: 502 }
    );
  }
}
