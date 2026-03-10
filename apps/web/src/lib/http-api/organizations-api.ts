import type { Organization } from '@/types/business/organization.types';

export interface ExternalCredentials {
  email: string;
  password: string;
}

export interface CreateOrganizationDto {
  code: string;
  name: string;
  description?: string | null;
  externalId?: string | null;
  integrationId?: string | null;
  credentials?: ExternalCredentials;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string | null;
  externalId?: string | null;
  integrationId?: string | null;
  credentials?: ExternalCredentials;
  isActive?: boolean;
}

export interface FindOrganizationsOptions {
  isActive?: boolean;
  integrationId?: string;
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

export async function getAllOrganizations(
  options?: FindOrganizationsOptions,
): Promise<PaginatedResponse<Organization>> {
  const params = new URLSearchParams();

  if (options?.isActive !== undefined) params.append('isActive', String(options.isActive));
  if (options?.integrationId) params.append('integrationId', options.integrationId);
  if (options?.search) params.append('search', options.search);
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));
  if (options?.orderBy) params.append('orderBy', options.orderBy);
  if (options?.order) params.append('order', options.order);

  const queryString = params.toString();
  const url = queryString ? `/api/admin/organizations?${queryString}` : '/api/admin/organizations';

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch organizations');
  }

  return response.json();
}

export async function getOrganizationByCode(code: string): Promise<Organization> {
  const response = await fetch(`/api/admin/organizations/${code}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch organization');
  }

  return response.json();
}

export async function createOrganization(data: CreateOrganizationDto): Promise<Organization> {
  const response = await fetch('/api/admin/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create organization');
  }

  return response.json();
}

export async function updateOrganization(
  code: string,
  data: UpdateOrganizationDto,
): Promise<Organization> {
  const response = await fetch(`/api/admin/organizations/${code}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update organization');
  }

  return response.json();
}

export async function deleteOrganization(code: string): Promise<void> {
  const response = await fetch(`/api/admin/organizations/${code}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete organization');
  }
}

export async function toggleOrganizationStatus(code: string): Promise<Organization> {
  const response = await fetch(`/api/admin/organizations/${code}/toggle`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle organization status');
  }

  return response.json();
}
