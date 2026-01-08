import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

interface RouteParams {
  params: Promise<{ condominiumId: string }>;
}

/**
 * Proxy helper to forward requests to the backend API
 */
async function proxyRequest(
  request: NextRequest,
  condominiumId: string,
  method: string,
  goalId?: string
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  const url = goalId
    ? `${API_BASE_URL}/condominiums/${condominiumId}/goals/${goalId}`
    : `${API_BASE_URL}/condominiums/${condominiumId}/goals`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  // Add body for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
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
 * GET /api/condominiums/:condominiumId/goals
 * List all goals for a condominium
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { condominiumId } = await params;
  return proxyRequest(request, condominiumId, 'GET');
}

/**
 * POST /api/condominiums/:condominiumId/goals
 * Create a new goal
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { condominiumId } = await params;
  return proxyRequest(request, condominiumId, 'POST');
}
