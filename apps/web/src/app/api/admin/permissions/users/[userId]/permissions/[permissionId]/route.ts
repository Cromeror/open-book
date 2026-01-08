import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

interface RouteParams {
  params: Promise<{ userId: string; permissionId: string }>;
}

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

/**
 * DELETE /api/admin/permissions/users/:userId/permissions/:permissionId
 * Revoke a granular permission from a user
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const token = await getToken();
  const { userId, permissionId } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/permissions/users/${userId}/permissions/${permissionId}`,
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
