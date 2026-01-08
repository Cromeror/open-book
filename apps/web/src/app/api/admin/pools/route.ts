import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

/**
 * Proxy helper to forward requests to the backend API
 */
async function proxyRequest(
  request: NextRequest,
  method: string
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  const url = `${API_BASE_URL}/admin/pools`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  // Add body for POST requests
  if (method === 'POST') {
    const body = await request.json();
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
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
 * GET /api/admin/pools
 * List all user pools
 */
export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

/**
 * POST /api/admin/pools
 * Create a new user pool
 */
export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}
