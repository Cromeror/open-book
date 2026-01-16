import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

interface RouteParams {
  params: Promise<{ propertyId: string }>;
}

/**
 * GET /api/property-residents/property/:propertyId/primary
 * Get primary contact for a property
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const token = await getToken();
  const { propertyId } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/property-residents/property/${propertyId}/primary`,
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
 * PATCH /api/property-residents/property/:propertyId/primary
 * Set primary contact for a property
 *
 * Body: { residentId: string }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const token = await getToken();
  const { propertyId } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const response = await fetch(
      `${API_BASE_URL}/property-residents/property/${propertyId}/primary`,
      {
        method: 'PATCH',
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
