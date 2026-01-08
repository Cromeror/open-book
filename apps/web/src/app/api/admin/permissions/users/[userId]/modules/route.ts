import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

interface RouteParams {
  params: Promise<{ userId: string }>;
}

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

/**
 * GET /api/admin/permissions/users/:userId/modules
 * Get modules a user has access to
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const token = await getToken();
  const { userId } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/permissions/users/${userId}/modules`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/permissions/users/:userId/modules
 * Grant module access to a user
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const token = await getToken();
  const { userId } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  const body = await request.json();

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/permissions/users/${userId}/modules`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}
