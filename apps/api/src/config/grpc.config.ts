/* eslint-disable no-console -- Console output is intentional for env validation errors */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { z } from 'zod';

/**
 * Schema for gRPC environment variables validation using Zod
 * This ensures all required gRPC configuration is present and properly typed
 */
const grpcEnvSchema = z.object({
  // gRPC Server Configuration
  GRPC_PORT: z.coerce.number().positive().default(50051),
  GRPC_HOST: z.string().default('0.0.0.0'),

  // mTLS Certificate Paths
  GRPC_SERVER_CERT_PATH: z.string().optional(),
  GRPC_SERVER_KEY_PATH: z.string().optional(),
  GRPC_CA_CERT_PATH: z.string().optional(),

  // Security
  GRPC_REQUIRE_CLIENT_CERT: z
    .enum(['true', 'false'])
    .default('true')
    .transform((val) => val === 'true'),
});

export type GrpcConfig = z.infer<typeof grpcEnvSchema>;

/**
 * Certificate data for mTLS
 */
export interface GrpcCertificates {
  serverCert: Buffer;
  serverKey: Buffer;
  caCert: Buffer;
}

/**
 * Validates gRPC environment variables and returns typed configuration
 */
export function validateGrpcEnv(): GrpcConfig {
  const result = grpcEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );

    console.error('\n========================================');
    console.error('gRPC configuration validation failed!');
    console.error('========================================');
    console.error('Missing or invalid gRPC environment variables:\n');
    console.error(errors.join('\n'));
    console.error(
      '\nPlease check your .env file for gRPC configuration variables.'
    );
    console.error('See .env.example for required variables.\n');

    process.exit(1);
  }

  return result.data;
}

/**
 * Loads mTLS certificates from file system
 * @returns Certificate buffers for gRPC server configuration
 * @throws Error if certificates cannot be loaded
 */
export function loadGrpcCertificates(): GrpcCertificates {
  const config = validateGrpcEnv();

  // Validate that certificate paths are provided
  if (
    !config.GRPC_SERVER_CERT_PATH ||
    !config.GRPC_SERVER_KEY_PATH ||
    !config.GRPC_CA_CERT_PATH
  ) {
    console.error('\n========================================');
    console.error('gRPC mTLS configuration error!');
    console.error('========================================');
    console.error('GRPC_ENABLED is true, but certificate paths are missing.');
    console.error('Required environment variables:');
    console.error('  - GRPC_SERVER_CERT_PATH');
    console.error('  - GRPC_SERVER_KEY_PATH');
    console.error('  - GRPC_CA_CERT_PATH\n');
    process.exit(1);
  }

  try {
    // Resolve paths relative to process.cwd() (monorepo root when running via nx)
    // For development, this is /home/user/project
    // Certificate paths in .env should be relative to apps/api (e.g., ./certs/server-cert.pem)
    const apiDir = resolve(process.cwd(), 'apps/api');
    const serverCert = readFileSync(resolve(apiDir, config.GRPC_SERVER_CERT_PATH));
    const serverKey = readFileSync(resolve(apiDir, config.GRPC_SERVER_KEY_PATH));
    const caCert = readFileSync(resolve(apiDir, config.GRPC_CA_CERT_PATH));

    console.log('✅ gRPC mTLS certificates loaded successfully');

    return {
      serverCert,
      serverKey,
      caCert,
    };
  } catch (error) {
    console.error('\n========================================');
    console.error('Failed to load gRPC certificates!');
    console.error('========================================');
    console.error('Error:', error instanceof Error ? error.message : error);
    console.error('\nPlease ensure certificate files exist and are readable:');
    console.error(`  - ${config.GRPC_SERVER_CERT_PATH}`);
    console.error(`  - ${config.GRPC_SERVER_KEY_PATH}`);
    console.error(`  - ${config.GRPC_CA_CERT_PATH}`);
    console.error('\nTo generate development certificates, run:');
    console.error('  cd apps/api && ./scripts/generate-dev-certs.sh\n');
    process.exit(1);
  }
}

/**
 * Pre-validated gRPC configuration
 * Import this to access typed gRPC configuration
 */
function getGrpcConfig(): GrpcConfig {
  // Skip strict validation in test mode
  if (process.env.NODE_ENV === 'test') {
    return grpcEnvSchema.parse({
      GRPC_PORT: 50051,
      GRPC_HOST: '0.0.0.0',
      GRPC_REQUIRE_CLIENT_CERT: 'true',
    });
  }

  return validateGrpcEnv();
}

export const grpcConfig = getGrpcConfig();
