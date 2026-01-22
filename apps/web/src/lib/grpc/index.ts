/**
 * gRPC Client Module
 *
 * Main entry point for gRPC functionality.
 *
 * @example
 * import { getGrpcClient, getAuthTokenOrNull } from '@/lib/grpc';
 *
 * const token = await getAuthTokenOrNull();
 * if (token) {
 *   const grpc = getGrpcClient();
 *   const data = await grpc.condominiums.getUserCondominiums(token);
 * }
 */

// Main client
export { getGrpcClient, handleGrpcError } from './client';

// Helpers
export { getAuthToken, getAuthTokenOrNull } from './helpers';

// Types (re-export commonly used types)
export type {
  Condominium,
  CondominiumListResponse,
  CreateCondominiumInput,
  UpdateCondominiumInput,
  ListCondominiumsOptions,
  Manager,
  ManagerListResponse,
  AssignManagerInput,
  UpdateManagerInput,
  PaginationRequest,
  PaginationMeta,
  GrpcErrorResponse,
} from './types';

// Services (for advanced use cases)
export { CondominiumsService } from './services';

// Backwards compatibility - deprecated exports
export {
  getCondominiumsGrpcClient,
  createAuthMetadata,
} from './client';
