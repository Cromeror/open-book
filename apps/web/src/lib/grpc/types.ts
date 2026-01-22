/**
 * gRPC Client Types
 *
 * Shared types for gRPC services.
 */

import type * as grpc from '@grpc/grpc-js';

// ============================================
// Common Types
// ============================================

export interface PaginationRequest {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GrpcErrorResponse {
  statusCode: number;
  message: string;
  grpcCode: grpc.status;
}

// ============================================
// Condominium Types
// ============================================

export interface Condominium {
  id: string;
  name: string;
  nit?: string;
  address: string;
  city: string;
  unitCount: number;
  isActive: boolean;
  isPrimary?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CondominiumListResponse {
  condominiums: Condominium[];
  meta?: PaginationMeta;
}

export interface CreateCondominiumInput {
  name: string;
  nit?: string;
  address: string;
  city: string;
}

export interface UpdateCondominiumInput {
  name?: string;
  nit?: string;
  address?: string;
  city?: string;
  isActive?: boolean;
}

export interface ListCondominiumsOptions {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

// ============================================
// Manager Types
// ============================================

export interface Manager {
  id: string;
  userId: string;
  condominiumId: string;
  isPrimary: boolean;
  isActive: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ManagerListResponse {
  managers: Manager[];
}

export interface AssignManagerInput {
  condominiumId: string;
  userId: string;
  isPrimary: boolean;
}

export interface UpdateManagerInput {
  isPrimary?: boolean;
  isActive?: boolean;
}
