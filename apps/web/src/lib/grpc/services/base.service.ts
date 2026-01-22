/**
 * Base gRPC Service
 *
 * Provides common functionality for all gRPC service clients.
 * Extend this class to create service-specific clients.
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

import {
  GRPC_SERVER_URL,
  PROTO_LOADER_OPTIONS,
  loadCertificates,
} from '../config';

/**
 * Create SSL credentials for mTLS connection
 * Cached to avoid reloading certificates on every call
 */
let cachedCredentials: grpc.ChannelCredentials | null = null;

export function getCredentials(): grpc.ChannelCredentials {
  if (!cachedCredentials) {
    const certs = loadCertificates();
    cachedCredentials = grpc.credentials.createSsl(
      certs.caCert,
      certs.clientKey,
      certs.clientCert
    );
  }
  return cachedCredentials;
}

/**
 * Create metadata with JWT token for authentication
 */
export function createAuthMetadata(jwtToken: string): grpc.Metadata {
  const metadata = new grpc.Metadata();
  metadata.add('authorization', `Bearer ${jwtToken}`);
  return metadata;
}

/**
 * Load proto definition
 */
export function loadProto(protoFile: string) {
  const packageDefinition = protoLoader.loadSync(protoFile, PROTO_LOADER_OPTIONS);
  return grpc.loadPackageDefinition(packageDefinition);
}

/**
 * Base class for gRPC services
 *
 * Provides common functionality like creating clients and making calls.
 */
export abstract class BaseGrpcService {
  protected client: any;
  protected credentials: grpc.ChannelCredentials;

  constructor(protoFile: string, packagePath: string, serviceName: string) {
    const proto = loadProto(protoFile);

    // Navigate to the service (e.g., proto.openbook.condominiums.CondominiumsService)
    const parts = packagePath.split('.');
    let service: any = proto;
    for (const part of parts) {
      service = service[part];
      if (!service) {
        throw new Error(`Package path not found: ${packagePath}`);
      }
    }

    const ServiceClass = service[serviceName];
    if (!ServiceClass) {
      throw new Error(`Service not found: ${serviceName} in ${packagePath}`);
    }

    this.credentials = getCredentials();
    this.client = new ServiceClass(GRPC_SERVER_URL, this.credentials);
  }

  /**
   * Make a unary gRPC call
   *
   * @param method - Method name on the client
   * @param request - Request payload
   * @param token - JWT token for authentication
   * @returns Promise with response
   */
  protected call<TRequest, TResponse>(
    method: string,
    request: TRequest,
    token: string
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const metadata = createAuthMetadata(token);

      if (!this.client[method]) {
        reject(new Error(`Method not found: ${method}`));
        return;
      }

      this.client[method](
        request,
        metadata,
        (error: grpc.ServiceError | null, response: TResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  /**
   * Close the gRPC connection
   */
  close() {
    if (this.client?.close) {
      this.client.close();
    }
  }
}
