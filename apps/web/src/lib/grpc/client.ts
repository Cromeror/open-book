/**
 * Unified gRPC Client
 *
 * Provides lazy-loaded access to all gRPC services.
 * Each service is only instantiated when first accessed.
 *
 * Usage:
 *   const grpc = getGrpcClient();
 *   await grpc.condominiums.getUserCondominiums(token);
 */

import * as grpc from '@grpc/grpc-js';

import { CondominiumsService, UserStateService } from './services';
import type { GrpcErrorResponse } from './types';

/**
 * Unified gRPC Client
 *
 * Services are lazy-loaded - only instantiated when accessed.
 */
class GrpcClient {
  private _condominiums?: CondominiumsService;
  private _userState?: UserStateService;
  // Add more services here as you create them:
  // private _properties?: PropertiesService;
  // private _goals?: GoalsService;

  /**
   * Condominiums service
   */
  get condominiums(): CondominiumsService {
    if (!this._condominiums) {
      this._condominiums = new CondominiumsService();
    }
    return this._condominiums;
  }

  /**
   * UserState service - manages user preferences and state
   */
  get userState(): UserStateService {
    if (!this._userState) {
      this._userState = new UserStateService();
    }
    return this._userState;
  }

  // Add more service getters here:
  // get properties(): PropertiesService {
  //   if (!this._properties) {
  //     this._properties = new PropertiesService();
  //   }
  //   return this._properties;
  // }

  /**
   * Close all active connections
   */
  close() {
    this._condominiums?.close();
    this._userState?.close();
    // this._properties?.close();
    // this._goals?.close();
  }
}

/**
 * Singleton instance
 */
let clientInstance: GrpcClient | null = null;

/**
 * Get the unified gRPC client
 *
 * @example
 * const grpc = getGrpcClient();
 * const data = await grpc.condominiums.getUserCondominiums(token);
 */
export function getGrpcClient(): GrpcClient {
  if (!clientInstance) {
    clientInstance = new GrpcClient();
  }
  return clientInstance;
}

/**
 * Error handler for gRPC errors
 * Converts gRPC errors to HTTP-friendly format
 */
export function handleGrpcError(error: any): GrpcErrorResponse {
  console.error('gRPC Error:', error);

  // Map gRPC status codes to HTTP status codes
  const statusCodeMap: Record<number, number> = {
    [grpc.status.UNAUTHENTICATED]: 401,
    [grpc.status.PERMISSION_DENIED]: 403,
    [grpc.status.NOT_FOUND]: 404,
    [grpc.status.INVALID_ARGUMENT]: 400,
    [grpc.status.ALREADY_EXISTS]: 409,
    [grpc.status.FAILED_PRECONDITION]: 422,
    [grpc.status.INTERNAL]: 500,
  };

  const httpStatus = statusCodeMap[error.code] || 500;

  return {
    statusCode: httpStatus,
    message: error.details || error.message || 'Internal server error',
    grpcCode: error.code,
  };
}

// ============================================
// Backwards Compatibility
// ============================================
// These exports maintain compatibility with existing code.
// Consider migrating to the unified client: getGrpcClient()

/**
 * @deprecated Use getGrpcClient().condominiums instead
 */
export function getCondominiumsGrpcClient() {
  return getGrpcClient().condominiums;
}

/**
 * @deprecated Use createAuthMetadata from services/base.service
 */
export { createAuthMetadata } from './services/base.service';
