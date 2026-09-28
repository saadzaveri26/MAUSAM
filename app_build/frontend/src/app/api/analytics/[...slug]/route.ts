import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/config';
import { verifyAdminSession, getAdminTokenForApi } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    const slugPath = slug.join('/');
    const search = request.nextUrl.search;
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/analytics/${slugPath}${search}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (slugPath === 'sources') {
      const isAuth = await verifyAdminSession();
      if (!isAuth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const token = await getAdminTokenForApi();
      if (token) {
        headers['X-Admin-Token'] = token;
      }
    }

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 0 },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics data' },
      { status: 502 }
    );
  }
}
