import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

/**
 * GET /api/admin/property-residents
 * List all property-resident associations (SuperAdmin only)
 *
 * Query params:
 * - propertyId: Filter by property
 * - userId: Filter by user
 * - condominiumId: Filter by condominium
 * - status: Filter by status (PENDING, ACTIVE, INACTIVE, REJECTED)
 * - relationType: Filter by relation type (OWNER, TENANT, OTHER)
 * - page: Page number (default 1)
 * - limit: Items per page (default 50)
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
    const apiUrl = `${API_BASE_URL}/admin/property-residents${queryString ? `?${queryString}` : ''}`;

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
