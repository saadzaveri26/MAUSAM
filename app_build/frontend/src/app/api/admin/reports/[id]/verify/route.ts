import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminTokenForApi } from '@/lib/auth';
import { getBackendUrl } from '@/lib/config';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized operator session' }, { status: 401 });
  }

  const adminToken = await getAdminTokenForApi();
  if (!adminToken) {
    return NextResponse.json({ error: 'Admin token unavailable' }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const backendUrl = getBackendUrl();
    const res = await fetch(`${backendUrl}/api/reports/${id}/verify`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Token': adminToken,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update verification status' },
      { status: 502 }
    );
  }
}
