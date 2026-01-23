import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

/**
 * GET /api/admin/resources
 * List all resources (SuperAdmin only)
 *
 * Query params:
 * - scope: Filter by scope (global/condominium)
 * - isActive: Filter by active status (true/false)
 * - search: Search by code or name
 * - page: Page number
 * - limit: Items per page
 * - orderBy: Sort field (code/name/createdAt)
 * - order: Sort direction (asc/desc)
 */
export async function GET(request: NextRequest) {
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();

  try {
    const url = queryString
      ? `${API_BASE_URL}/admin/resources?${queryString}`
      : `${API_BASE_URL}/admin/resources`;

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
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/resources
 * Create a new resource (SuperAdmin only)
 */
export async function POST(request: NextRequest) {
  const token = await getToken();

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/admin/resources`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to proxy request' },
      { status: 500 },
    );
  }
}
