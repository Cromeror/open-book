import { resolve } from 'path';

/**
 * Proto file paths for gRPC server configuration
 * These paths are resolved from the project root to the source files
 * (not from dist, as proto files are not copied during build)
 */
export const PROTO_FILES = {
  common: resolve(process.cwd(), 'apps/api/src/grpc/proto/common.proto'),
  condominiums: resolve(process.cwd(), 'apps/api/src/grpc/proto/condominiums.proto'),
  userState: resolve(process.cwd(), 'apps/api/src/grpc/proto/user-state.proto'),
};

/**
 * Package names for each service
 */
export const PROTO_PACKAGES = {
  common: 'openbook.common',
  condominiums: 'openbook.condominiums',
  userState: 'openbook.userstate',
};
