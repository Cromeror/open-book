'use server';

import { cookies } from 'next/headers';

import { requireSuperAdmin } from './permissions.server';
import { publicEnv } from '@/config/env';
import type { Resource } from '@/types/business';
import type { ResourceFormData } from '@/lib/validations/resource.schema';
import type { ActionResult } from './actions.server';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

/**
 * Helper to make authenticated API calls to the backend with audit logging
 */
async function fetchApi(
  token: string,
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const method = options.method || 'GET';
  const url = `${API_BASE_URL}${path}`;

  console.log(`[resource-action] → ${method} ${path}`);
  if (options.body) {
    console.log(`[resource-action]   payload:`, options.body);
  }

  const start = Date.now();
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const duration = Date.now() - start;

  console.log(`[resource-action] ← ${response.status} (${duration}ms)`);

  return response;
}

/**
 * Create a resource with its HTTP methods (Server Action)
 *
 * Orchestrates the two-step API flow:
 * 1. POST /admin/resources — create the resource
 * 2. POST /admin/resources/:code/http-methods — assign each HTTP method
 *
 * Requires SuperAdmin role.
 */
export async function createResourceWithMethods(
  formData: ResourceFormData,
): Promise<ActionResult<Resource>> {
  try {
    // Validate permissions
    await requireSuperAdmin();

    // Get JWT token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return { success: false, error: 'No se encontró token de acceso' };
    }

    // Step 1: Create the resource
    const createResponse = await fetchApi(token, '/admin/resources', {
      method: 'POST',
      body: JSON.stringify({
        code: formData.code,
        name: formData.name,
        scope: formData.scope,
        templateUrl: formData.templateUrl,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json().catch(() => ({}));
      return {
        success: false,
        error: error.message || 'Error al crear el recurso',
      };
    }

    const resource: Resource = await createResponse.json();

    // Step 2: Assign each HTTP method
    const errors: string[] = [];

    for (const hm of formData.httpMethods) {
      const assignResponse = await fetchApi(
        token,
        `/admin/resources/${formData.code}/http-methods`,
        {
          method: 'POST',
          body: JSON.stringify({
            method: hm.method,
            payloadMetadata: hm.payloadMetadata || undefined,
            responseMetadata: hm.responseMetadata || undefined,
          }),
        },
      );

      if (!assignResponse.ok) {
        const error = await assignResponse.json().catch(() => ({}));
        errors.push(
          error.message || `Error al asignar método ${hm.method}`,
        );
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Recurso creado pero hubo errores asignando métodos: ${errors.join(', ')}`,
      };
    }

    return { success: true, data: resource };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al crear el recurso';
    return { success: false, error: message };
  }
}

/**
 * Update a resource and sync its HTTP methods (Server Action)
 *
 * Orchestrates:
 * 1. PATCH /admin/resources/:code — update resource fields
 * 2. DELETE removed methods, POST (upsert) current methods
 *
 * Requires SuperAdmin role.
 */
export async function updateResourceWithMethods(
  code: string,
  formData: ResourceFormData,
  previousMethods: string[],
): Promise<ActionResult<Resource>> {
  try {
    await requireSuperAdmin();

    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return { success: false, error: 'No se encontró token de acceso' };
    }

    // Step 1: Update resource fields
    const updateResponse = await fetchApi(token, `/admin/resources/${code}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.name,
        scope: formData.scope,
        templateUrl: formData.templateUrl,
      }),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json().catch(() => ({}));
      return {
        success: false,
        error: error.message || 'Error al actualizar el recurso',
      };
    }

    const resource: Resource = await updateResponse.json();

    // Step 2: Sync HTTP methods
    const errors: string[] = [];
    const newMethods: string[] = formData.httpMethods.map((hm) => hm.method);

    // Remove methods no longer present
    for (const method of previousMethods) {
      if (!newMethods.includes(method)) {
        const deleteResponse = await fetchApi(
          token,
          `/admin/resources/${code}/http-methods/${method}`,
          { method: 'DELETE' },
        );
        if (!deleteResponse.ok) {
          errors.push(`Error al eliminar método ${method}`);
        }
      }
    }

    // Assign/update current methods
    for (const hm of formData.httpMethods) {
      const assignResponse = await fetchApi(
        token,
        `/admin/resources/${code}/http-methods`,
        {
          method: 'POST',
          body: JSON.stringify({
            method: hm.method,
            payloadMetadata: hm.payloadMetadata || undefined,
            responseMetadata: hm.responseMetadata || undefined,
          }),
        },
      );
      if (!assignResponse.ok) {
        const error = await assignResponse.json().catch(() => ({}));
        errors.push(error.message || `Error al asignar método ${hm.method}`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: `Recurso actualizado pero hubo errores con métodos: ${errors.join(', ')}`,
      };
    }

    return { success: true, data: resource };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al actualizar el recurso';
    return { success: false, error: message };
  }
}
