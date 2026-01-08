import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

interface RouteParams {
  params: Promise<{ condominiumId: string; goalId: string }>;
}

/**
 * Proxy helper to forward requests to the backend API
 */
async function proxyRequest(
  request: NextRequest,
  condominiumId: string,
  goalId: string,
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

  const url = `${API_BASE_URL}/condominiums/${condominiumId}/goals/${goalId}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  // Add body for PUT/PATCH requests
  if (['PUT', 'PATCH'].includes(method)) {
    const body = await request.json();
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 204 No Content (common for DELETE)
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

/**
 * GET /api/condominiums/:condominiumId/goals/:goalId
 * Get a specific goal
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { condominiumId, goalId } = await params;
  return proxyRequest(request, condominiumId, goalId, 'GET');
}

/**
 * PUT /api/condominiums/:condominiumId/goals/:goalId
 * Update a goal (full update)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { condominiumId, goalId } = await params;
  return proxyRequest(request, condominiumId, goalId, 'PUT');
}

/**
 * PATCH /api/condominiums/:condominiumId/goals/:goalId
 * Update a goal (partial update)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { condominiumId, goalId } = await params;
  return proxyRequest(request, condominiumId, goalId, 'PATCH');
}

/**
 * DELETE /api/condominiums/:condominiumId/goals/:goalId
 * Delete a goal
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { condominiumId, goalId } = await params;
  return proxyRequest(request, condominiumId, goalId, 'DELETE');
}
