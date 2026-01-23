import {
  Resource,
  CreateResourceDto,
  UpdateResourceDto,
  FindResourcesOptions,
  PaginatedResponse,
} from '@/types/resources';

/**
 * Client-side API wrapper for resource management
 * Calls Next.js API routes which proxy to the backend API
 */

/**
 * Get all resources
 */
export async function getAllResources(
  options?: FindResourcesOptions,
): Promise<PaginatedResponse<Resource>> {
  const params = new URLSearchParams();

  if (options?.scope) params.append('scope', options.scope);
  if (options?.isActive !== undefined) params.append('isActive', String(options.isActive));
  if (options?.search) params.append('search', options.search);
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.orderBy) params.append('orderBy', options.orderBy);
  if (options?.order) params.append('order', options.order);

  const queryString = params.toString();
  const url = queryString ? `/api/admin/resources?${queryString}` : '/api/admin/resources';

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch resources');
  }

  return response.json();
}

/**
 * Get a resource by code
 */
export async function getResourceByCode(code: string): Promise<Resource> {
  const response = await fetch(`/api/admin/resources/${code}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch resource');
  }

  return response.json();
}

/**
 * Create a new resource
 */
export async function createResource(data: CreateResourceDto): Promise<Resource> {
  const response = await fetch('/api/admin/resources', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create resource');
  }

  return response.json();
}

/**
 * Update a resource by code
 */
export async function updateResource(
  code: string,
  data: UpdateResourceDto,
): Promise<Resource> {
  const response = await fetch(`/api/admin/resources/${code}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update resource');
  }

  return response.json();
}

/**
 * Delete a resource by code
 */
export async function deleteResource(code: string): Promise<void> {
  const response = await fetch(`/api/admin/resources/${code}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete resource');
  }
}

/**
 * Toggle resource active status
 */
export async function toggleResourceStatus(code: string): Promise<Resource> {
  const response = await fetch(`/api/admin/resources/${code}/toggle`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle resource status');
  }

  return response.json();
}
