import { Transport, GrpcOptions } from '@nestjs/microservices';
import { ServerCredentials } from '@grpc/grpc-js';

import { grpcConfig, loadGrpcCertificates } from '../config/grpc.config';
import { PROTO_FILES } from './proto';

/**
 * Create gRPC server options with mTLS configuration
 *
 * This factory function creates the MicroserviceOptions for the gRPC server,
 * including:
 * - Transport configuration (gRPC)
 * - Proto file paths
 * - Package names
 * - mTLS credentials (server cert, key, CA cert)
 * - Client certificate requirement
 *
 * The mTLS configuration provides two-layer security:
 * 1. Transport layer: Client must have valid certificate signed by CA
 * 2. Application layer: Client must provide valid JWT token in metadata
 *
 * @returns GrpcOptions configuration for NestFactory.createMicroservice()
 */
export function createGrpcOptions(): GrpcOptions {
  // Load mTLS certificates from file system
  const certificates = loadGrpcCertificates();

  // If gRPC is disabled or certificates failed to load, this won't be called
  // (main.ts checks grpcConfig.GRPC_ENABLED before creating microservice)
  if (!certificates) {
    throw new Error('gRPC certificates not loaded. Cannot create gRPC server.');
  }

  // Create SSL/TLS credentials for mTLS
  const credentials = ServerCredentials.createSsl(
    certificates.caCert, // CA certificate to validate client certificates
    [
      {
        cert_chain: certificates.serverCert, // Server certificate
        private_key: certificates.serverKey, // Server private key
      },
    ],
    grpcConfig.GRPC_REQUIRE_CLIENT_CERT // Require client certificate (mTLS)
  );

  return {
    transport: Transport.GRPC,
    options: {
      // Server binding
      url: `${grpcConfig.GRPC_HOST}:${grpcConfig.GRPC_PORT}`,

      // Proto files configuration
      package: ['openbook.common', 'openbook.condominiums', 'openbook.userstate', 'openbook.capabilitypresets', 'openbook.sessioncontext'],
      protoPath: [PROTO_FILES.common, PROTO_FILES.condominiums, PROTO_FILES.userState, PROTO_FILES.capabilityPresets, PROTO_FILES.sessionContext],

      // Loader options for proto-loader
      loader: {
        keepCase: false, // Convert field names to camelCase
        longs: String, // Convert 64-bit integers to strings
        enums: String, // Convert enums to strings
        defaults: true, // Set default values for missing fields
        oneofs: true, // Set virtual oneof properties to field names
        json: true, // Use toJSON() method for message conversion
        includeDirs: [], // Additional directories for proto imports
      },

      // mTLS credentials
      credentials,
    },
  };
}
