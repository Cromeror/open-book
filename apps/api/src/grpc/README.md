# gRPC Server for OpenBook API

This directory contains the gRPC server implementation with mTLS authentication.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Transport Layer                         │
├──────────────────────┬──────────────────────────────────────┤
│   HTTP Controller    │     gRPC Controller                   │
│   *.controller.ts    │     *.grpc-controller.ts              │
├──────────────────────┴──────────────────────────────────────┤
│             Shared Authentication & Authorization            │
│   JwtAuthGuard, PermissionsGuard, TokenService              │
├──────────────────────────────────────────────────────────────┤
│               Shared Business Logic Layer                    │
│   *.service.ts (CondominiumsService, etc.)                  │
├──────────────────────────────────────────────────────────────┤
│                    Data Access Layer                         │
│   TypeORM entities and repositories                          │
└──────────────────────────────────────────────────────────────┘
```

**Key Design Principle**: Maximum code reuse. gRPC controllers are thin wrappers that use the exact same services, guards, and business logic as HTTP endpoints.

## Quick Start

### 1. Generate Certificates

```bash
cd apps/api
./scripts/generate-dev-certs.sh
```

### 2. Start Server

```bash
pnpm dev
```

You should see:
```
🔐 gRPC server is running on: 0.0.0.0:50051
   ✓ mTLS enabled (client certificate required)
   ✓ JWT authentication enabled
🚀 HTTP server is running on: http://localhost:3001/api
```

## Authentication Flow

```
1. Login via HTTP
   POST /api/auth/login
   → Returns: { accessToken: "eyJ..." }

2. Connect gRPC client with mTLS
   - Load client certificate (certs/client-cert.pem)
   - Load client key (certs/client-key.pem)
   - Load CA certificate (certs/ca-cert.pem)

3. Make gRPC call with JWT in metadata
   metadata: { authorization: "Bearer eyJ..." }

4. Server validates:
   ✓ Client certificate (mTLS)
   ✓ JWT token (application layer)
   ✓ User permissions (RBAC)

5. Controller executes business logic
   → Same service methods as HTTP
```

## Testing with grpcurl

Install grpcurl:
```bash
# macOS
brew install grpcurl

# Linux
sudo snap install grpcurl
```

### Example: GetUserCondominiums

```bash
# 1. Login via HTTP to get JWT token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.accessToken')

# 2. Call gRPC endpoint
grpcurl \
  -cert apps/api/certs/client-cert.pem \
  -key apps/api/certs/client-key.pem \
  -cacert apps/api/certs/ca-cert.pem \
  -H "authorization: Bearer $TOKEN" \
  -d '{}' \
  localhost:50051 \
  openbook.condominiums.CondominiumsService/GetUserCondominiums
```

### List Available Services

```bash
grpcurl \
  -cert apps/api/certs/client-cert.pem \
  -key apps/api/certs/client-key.pem \
  -cacert apps/api/certs/ca-cert.pem \
  -plaintext \
  localhost:50051 \
  list
```

## Directory Structure

```
grpc/
├── proto/                              # Protocol buffer definitions
│   ├── common.proto                    # Common types (pagination, errors)
│   ├── condominiums.proto              # Condominiums service
│   └── index.ts                        # Proto file exports
├── controllers/                        # gRPC controllers (thin wrappers)
│   └── condominiums.grpc-controller.ts # Example controller
├── guards/                             # Authentication & authorization adapters
│   ├── grpc-jwt-auth.guard.ts          # JWT validation from metadata
│   └── grpc-permissions.guard.ts       # RBAC validation
├── decorators/                         # gRPC-specific decorators
│   └── grpc-user.decorator.ts          # @GrpcCurrentUser()
├── filters/                            # Exception handling
│   └── grpc-exception.filter.ts        # Convert NestJS → gRPC errors
├── grpc.module.ts                      # gRPC module configuration
├── grpc-server.options.ts              # Server options (mTLS, proto)
└── README.md                           # This file
```

## Adding New gRPC Services

### 1. Define Proto File

Create `proto/your-service.proto`:

```protobuf
syntax = "proto3";
package openbook.yourservice;

service YourService {
  rpc YourMethod(YourRequest) returns (YourResponse);
}

message YourRequest {
  string field = 1;
}

message YourResponse {
  string result = 1;
}
```

### 2. Create gRPC Controller

Create `controllers/your-service.grpc-controller.ts`:

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { YourService } from '../../modules/your-module/your.service';
import { GrpcJwtAuthGuard } from '../guards/grpc-jwt-auth.guard';
import { GrpcCurrentUser } from '../decorators/grpc-user.decorator';
import { RequestUser } from '../../modules/auth/strategies/jwt.strategy';

@Controller()
@UseGuards(GrpcJwtAuthGuard)
export class YourServiceGrpcController {
  constructor(private readonly yourService: YourService) {}

  @GrpcMethod('YourService', 'YourMethod')
  async yourMethod(
    request: YourRequest,
    metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser
  ): Promise<YourResponse> {
    // Call existing service method
    const result = await this.yourService.yourMethod(request.field, user.id);

    // Transform to proto format
    return { result };
  }
}
```

### 3. Register in GrpcModule

Edit `grpc.module.ts`:

```typescript
@Module({
  imports: [
    AuthModule,
    YourModule, // Add your module
  ],
  controllers: [
    CondominiumsGrpcController,
    YourServiceGrpcController, // Add your controller
  ],
  // ...
})
export class GrpcModule {}
```

### 4. Update Proto Paths

Edit `proto/index.ts`:

```typescript
export const PROTO_FILES = {
  common: join(__dirname, 'common.proto'),
  condominiums: join(__dirname, 'condominiums.proto'),
  yourservice: join(__dirname, 'your-service.proto'), // Add your proto
};
```

Edit `grpc-server.options.ts`:

```typescript
package: ['openbook.common', 'openbook.condominiums', 'openbook.yourservice'],
protoPath: [PROTO_FILES.common, PROTO_FILES.condominiums, PROTO_FILES.yourservice],
```

## Code Reuse

gRPC controllers are designed to maximize code reuse:

### ✅ Reused from HTTP
- `TokenService` - JWT validation
- `JwtStrategy` - User validation
- `PermissionsService` - RBAC logic
- `CondominiumsService` - Business logic
- `@RequireModule()`, `@RequirePermission()` - Decorators
- `RequestUser` type
- All validation logic

### 🆕 New for gRPC (< 10%)
- Guards adapters (extract from gRPC context)
- Controllers (thin wrappers)
- Proto definitions

## Troubleshooting

### Error: "Certificate verify failed"
- Ensure client certificate is signed by the same CA as server
- Check that `ca-cert.pem` matches on client and server

### Error: "Connection refused"
- Check that server is running on configured port
- Ensure no firewall blocking the port

### Error: "Unauthenticated"
- Verify JWT token is valid and not expired
- Check metadata header format: `authorization: Bearer <token>`
- Ensure user exists and is active

### Error: "Permission denied"
- Check user has required module access
- Verify permission scope (OWN, COPROPIEDAD, ALL)
- Confirm user is assigned to the condominium

## Production Deployment

⚠️ **Important**: Development certificates are NOT suitable for production.

For production:

1. **Use Real Certificates**
   - Obtain certificates from a trusted CA (Let's Encrypt, DigiCert, etc.)
   - Store in secure secret manager (AWS Secrets Manager, HashiCorp Vault, etc.)

2. **Certificate Paths**
   - Update `GRPC_SERVER_CERT_PATH`, `GRPC_SERVER_KEY_PATH`, `GRPC_CA_CERT_PATH`
   - Use absolute paths or environment-specific paths

3. **Security**
   - Rotate certificates regularly (e.g., every 90 days)
   - Monitor certificate expiration dates
   - Use strong key sizes (4096-bit RSA or 256-bit ECDSA)
   - Enable certificate revocation checking (CRL/OCSP)

4. **Monitoring**
   - Log all authentication failures
   - Track mTLS handshake errors
   - Monitor certificate expiration
   - Alert on suspicious patterns

## References

- [gRPC Documentation](https://grpc.io/docs/)
- [NestJS Microservices](https://docs.nestjs.com/microservices/grpc)
- [Protocol Buffers](https://protobuf.dev/)
- [grpcurl](https://github.com/fullstorydev/grpcurl)
