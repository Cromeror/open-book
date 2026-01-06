'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:3001';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
}

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function login(
  credentials: LoginCredentials
): Promise<ActionResult<{ user: LoginResponse['user'] }>> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.message || 'Credenciales inválidas. Verifica tu email y contraseña.';
      return { success: false, error: message };
    }

    const data: LoginResponse = await response.json();

    // Set cookies for authentication
    const cookieStore = await cookies();

    cookieStore.set('access_token', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15 minutes
      path: '/',
    });

    cookieStore.set('refresh_token', data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return {
      success: true,
      data: { user: data.user },
    };
  } catch {
    return {
      success: false,
      error: 'No se pudo conectar con el servidor. Intenta más tarde.',
    };
  }
}

export async function logout(): Promise<ActionResult<null>> {
  try {
    const cookieStore = await cookies();

    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return { success: true, data: null };
  } catch {
    return { success: false, error: 'Error al cerrar sesión' };
  }
}
