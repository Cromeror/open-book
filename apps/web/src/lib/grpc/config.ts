/**
 * gRPC Client Configuration
 *
 * Centralized configuration for gRPC connections, certificates, and proto files.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Environment variables
export const GRPC_HOST = process.env.GRPC_HOST || 'localhost';
export const GRPC_PORT = process.env.GRPC_PORT || '50051';
export const GRPC_SERVER_URL = `${GRPC_HOST}:${GRPC_PORT}`;

// Paths (relative to monorepo root)
const MONOREPO_ROOT = resolve(process.cwd(), '../..');
export const CERTS_DIR = resolve(MONOREPO_ROOT, 'apps/api/certs');
export const PROTO_DIR = resolve(MONOREPO_ROOT, 'apps/api/src/grpc/proto');

// Proto file paths
export const PROTO_FILES = {
  common: resolve(PROTO_DIR, 'common.proto'),
  condominiums: resolve(PROTO_DIR, 'condominiums.proto'),
  userState: resolve(PROTO_DIR, 'user-state.proto'),
  capabilityPresets: resolve(PROTO_DIR, 'capability-presets.proto'),
} as const;

// Certificate paths
export const CERT_FILES = {
  ca: resolve(CERTS_DIR, 'ca-cert.pem'),
  clientCert: resolve(CERTS_DIR, 'client-cert.pem'),
  clientKey: resolve(CERTS_DIR, 'client-key.pem'),
} as const;

/**
 * Load mTLS certificates for secure connection
 */
export function loadCertificates() {
  try {
    return {
      caCert: readFileSync(CERT_FILES.ca),
      clientCert: readFileSync(CERT_FILES.clientCert),
      clientKey: readFileSync(CERT_FILES.clientKey),
    };
  } catch (error) {
    console.error('Failed to load gRPC certificates:', error);
    throw new Error(
      'gRPC certificates not found. Run: cd apps/api && ./scripts/generate-dev-certs.sh'
    );
  }
}

// Proto loader options
export const PROTO_LOADER_OPTIONS: import('@grpc/proto-loader').Options = {
  keepCase: false, // Convert to camelCase
  longs: String, // Convert longs to strings
  enums: String, // Convert enums to strings
  defaults: true, // Set default values
  oneofs: true, // Set virtual oneof properties
  includeDirs: [PROTO_DIR], // Include directory for imports
};
