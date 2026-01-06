import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/login',
  '/registro',
  '/recuperar-contrasena',
  '/_next',
  '/api/hello',
  '/favicon.ico',
];

/**
 * Routes that require SuperAdmin access
 */
const SUPERADMIN_ROUTES = ['/admin'];

/**
 * Check if the path matches any public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if the path requires SuperAdmin access
 */
function isSuperAdminRoute(pathname: string): boolean {
  return SUPERADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Build the login redirect URL preserving the intended destination
 */
function buildLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  // Preserve the original URL as redirect parameter
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * Middleware for authentication and route protection
 *
 * Flow:
 * 1. Allow public routes without authentication
 * 2. Check for access_token cookie
 * 3. Validate token by calling backend /api/auth/me
 * 4. Redirect to login if not authenticated
 * 5. Check SuperAdmin for admin routes
 *
 * Note: Full permission verification happens in Server Components,
 * middleware only handles basic authentication.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get the access token from cookies
  const token = request.cookies.get('access_token')?.value;

  // No token - redirect to login
  if (!token) {
    return buildLoginRedirect(request);
  }

  // Validate token by calling backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL not configured');
      return buildLoginRedirect(request);
    }

    const response = await fetch(`${apiUrl}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Token invalid - redirect to login
    if (!response.ok) {
      const res = buildLoginRedirect(request);
      // Clear the invalid token
      res.cookies.delete('access_token');
      return res;
    }

    // Token valid - check SuperAdmin for admin routes
    if (isSuperAdminRoute(pathname)) {
      const data = await response.json();
      if (!data.user?.isSuperAdmin) {
        return NextResponse.redirect(new URL('/acceso-denegado', request.url));
      }
    }

    // Authentication successful
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    // On error, allow request to proceed (Server Components will handle auth)
    return NextResponse.next();
  }
}

/**
 * Configure which routes use this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
