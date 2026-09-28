import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminTokenForApi } from '@/lib/auth';
import { getBackendUrl } from '@/lib/config';

export async function POST(request: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized operator session' }, { status: 401 });
  }

  const adminToken = await getAdminTokenForApi();
  if (!adminToken) {
    return NextResponse.json({ error: 'Admin token unavailable' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const count = body.count || 25;
    const backendUrl = getBackendUrl();

    const res = await fetch(`${backendUrl}/api/ingest/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': adminToken,
      },
      body: JSON.stringify({ count }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to trigger batch ingestion' },
      { status: 502 }
    );
  }
}
