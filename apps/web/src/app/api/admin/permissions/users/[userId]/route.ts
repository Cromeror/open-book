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
 * GET /api/admin/permissions/users/:userId
 * Get user permissions or modules based on query param
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const token = await getToken();
  const { userId } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'permissions';

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/permissions/users/${userId}/${type}`,
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
 * POST /api/admin/permissions/users/:userId
 * Grant module or permission to user based on type query param
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

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'modules';
  const body = await request.json();

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/permissions/users/${userId}/${type}`,
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

/**
 * DELETE /api/admin/permissions/users/:userId
 * Revoke module or permission from user
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const token = await getToken();
  const { userId } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'modules';
  const targetId = searchParams.get('targetId');

  if (!targetId) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'targetId is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/permissions/users/${userId}/${type}/${targetId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

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
