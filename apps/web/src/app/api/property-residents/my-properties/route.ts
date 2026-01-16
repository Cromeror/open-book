import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

/**
 * GET /api/property-residents/my-properties
 * Get current user's property associations
 *
 * Query params:
 * - status: Filter by status (PENDING, ACTIVE, INACTIVE, REJECTED)
 */
export async function GET(request: NextRequest) {
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  try {
    const url = queryString
      ? `${API_BASE_URL}/property-residents/my-properties?${queryString}`
      : `${API_BASE_URL}/property-residents/my-properties`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
