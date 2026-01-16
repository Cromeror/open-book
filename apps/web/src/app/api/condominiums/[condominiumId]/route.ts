import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

async function getToken() {
  const cookieStore = await cookies();
  return cookieStore.get('access_token')?.value;
}

interface RouteParams {
  params: Promise<{ condominiumId: string }>;
}

/**
 * GET /api/condominiums/:condominiumId?condominiumId=<uuid>
 * Get a specific condominium by ID
 *
 * Requires the condominiumId query parameter to validate access.
 * This design ensures explicit intent and prevents accidental cross-condominium access.
 *
 * @throws 400 if condominiumId query param is missing
 * @throws 403 if user doesn't have access to this condominium
 * @throws 404 if condominium doesn't exist
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const token = await getToken();
  const { condominiumId } = await params;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'No access token found' },
      { status: 401 }
    );
  }

  // Get condominiumId from query params
  const { searchParams } = new URL(request.url);
  const condominiumIdQuery = searchParams.get('condominiumId');

  if (!condominiumIdQuery) {
    return NextResponse.json(
      { error: 'Bad Request', message: 'condominiumId query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/condominiums/${condominiumId}?condominiumId=${condominiumIdQuery}`,
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
