import type { Integration } from '@/types/business/integration.types';

export interface CreateIntegrationDto {
  code: string;
  name: string;
  description?: string | null;
  baseUrl: string;
  authType: string;
  authConfig?: Record<string, unknown> | null;
  connectionType?: string;
}

export interface UpdateIntegrationDto {
  name?: string;
  description?: string | null;
  baseUrl?: string;
  authType?: string;
  authConfig?: Record<string, unknown> | null;
  connectionType?: string;
  isActive?: boolean;
}

export interface FindIntegrationsOptions {
  isActive?: boolean;
  connectionType?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'code' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getAllIntegrations(
  options?: FindIntegrationsOptions,
): Promise<PaginatedResponse<Integration>> {
  const params = new URLSearchParams();

  if (options?.isActive !== undefined) params.append('isActive', String(options.isActive));
  if (options?.connectionType) params.append('connectionType', options.connectionType);
  if (options?.search) params.append('search', options.search);
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.orderBy) params.append('orderBy', options.orderBy);
  if (options?.order) params.append('order', options.order);

  const queryString = params.toString();
  const url = queryString ? `/api/admin/integrations?${queryString}` : '/api/admin/integrations';

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch integrations');
  }

  return response.json();
}

export async function getIntegrationByCode(code: string): Promise<Integration> {
  const response = await fetch(`/api/admin/integrations/${code}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch integration');
  }

  return response.json();
}

export async function createIntegration(data: CreateIntegrationDto): Promise<Integration> {
  const response = await fetch('/api/admin/integrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create integration');
  }

  return response.json();
}

export async function updateIntegration(
  code: string,
  data: UpdateIntegrationDto,
): Promise<Integration> {
  const response = await fetch(`/api/admin/integrations/${code}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update integration');
  }

  return response.json();
}

export async function deleteIntegration(code: string): Promise<void> {
  const response = await fetch(`/api/admin/integrations/${code}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete integration');
  }
}

export async function toggleIntegrationStatus(code: string): Promise<Integration> {
  const response = await fetch(`/api/admin/integrations/${code}/toggle`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle integration status');
  }

  return response.json();
}
