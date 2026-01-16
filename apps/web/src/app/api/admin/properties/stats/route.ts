import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

/**
 * GET /api/admin/properties/stats
 * Get property statistics for a condominium (SuperAdmin only)
 */
export async function GET(request: NextRequest) {
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  try {
    // Forward query params
    const url = new URL(request.url);
    const queryString = url.searchParams.toString();
    const apiUrl = `${API_BASE_URL}/admin/properties/stats${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(apiUrl, {
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
