import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, getAdminTokenForApi } from '@/lib/auth';

const BACKEND_URL = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(
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
    const res = await fetch(
      `${BACKEND_URL}/api/analytics/sources/${id}/toggle-blacklist`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to toggle source blacklist' },
      { status: 502 }
    );
  }
}
