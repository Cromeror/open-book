/**
 * Frontend types for HATEOAS resource configuration
 * Mirrors backend types from apps/api/src/types/resource.types.ts
 */

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
export type ResourceScope = 'global' | 'condominium';

/**
 * Resource capability definition
 * Template for generating HATEOAS links
 */
export interface ResourceCapability {
  name: string;
  method: HttpMethod;
  urlPattern: string;
  permission?: string;
}

/**
 * Resource entity
 */
export interface Resource {
  id: string;
  code: string;
  name: string;
  scope: ResourceScope;
  baseUrl: string;
  capabilities: ResourceCapability[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new resource
 */
export interface CreateResourceDto {
  code: string;
  name: string;
  scope: ResourceScope;
  baseUrl: string;
  capabilities: ResourceCapability[];
}

/**
 * DTO for updating a resource
 */
export interface UpdateResourceDto {
  name?: string;
  scope?: ResourceScope;
  baseUrl?: string;
  capabilities?: ResourceCapability[];
  isActive?: boolean;
}

/**
 * Query options for listing resources
 */
export interface FindResourcesOptions {
  scope?: ResourceScope;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'code' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
