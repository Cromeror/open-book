# gRPC Client for Next.js

This directory contains the gRPC client configuration for consuming the OpenBook gRPC API from the Next.js server.

## Architecture

```
┌─────────────────┐
│   Browser       │
│   (Frontend)    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Next.js       │
│   Server        │  ◄── gRPC client runs here
│   (RSC/Actions) │
└────────┬────────┘
         │ gRPC + mTLS
         ▼
┌─────────────────┐
│   NestJS API    │
│   gRPC Server   │
│   (Port 50051)  │
└─────────────────┘
```

## Directory Structure

```
apps/web/src/lib/grpc/
├── index.ts              # Main exports
├── client.ts             # Unified client with lazy-loaded services
├── config.ts             # Configuration (paths, certs, proto options)
├── types.ts              # Shared TypeScript types
├── helpers.ts            # Auth token helpers
└── services/
    ├── index.ts          # Service exports
    ├── base.service.ts   # Base class with common gRPC logic
    └── condominiums.service.ts
```

## Security

### Two-Layer Authentication

1. **Transport Layer (mTLS)**
   - Client certificate: `apps/api/certs/client-cert.pem`
   - Client key: `apps/api/certs/client-key.pem`
   - CA certificate: `apps/api/certs/ca-cert.pem`
   - Validates that the client is authorized to connect

2. **Application Layer (JWT)**
   - JWT token passed in gRPC metadata header
   - Same JWT tokens used for HTTP API
   - Validates user identity and permissions

### Where You Can Use gRPC

- Server Components
- Server Actions (`'use server'`)

### Where You Cannot Use gRPC

- Client Components (`'use client'`) - no access to Node.js or certificates
- Code that runs in the browser

## Usage

### Server Component

```typescript
import { getGrpcClient, getAuthTokenOrNull } from '@/lib/grpc';
import { redirect } from 'next/navigation';
import { getServerPermissions } from '@/lib/permissions.server';

export default async function CondominiumsPage() {
  // 1. Verify permissions
  const permissions = await getServerPermissions();

  if (!permissions.isAuthenticated) {
    redirect('/login');
  }

  // 2. Get token from cookie
  const token = await getAuthTokenOrNull();

  if (!token) {
    redirect('/login');
  }

  // 3. Call gRPC via unified client
  const grpc = getGrpcClient();
  const { condominiums } = await grpc.condominiums.getUserCondominiums(token);

  // 4. Render
  return (
    <div>
      {condominiums.map(c => (
        <CondominiumCard key={c.id} condominium={c} />
      ))}
    </div>
  );
}
```

### Server Action

```typescript
'use server';

import { getGrpcClient, getAuthTokenOrNull } from '@/lib/grpc';
import { revalidatePath } from 'next/cache';

export async function createCondominium(formData: FormData) {
  const token = await getAuthTokenOrNull();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const grpc = getGrpcClient();
  await grpc.condominiums.createCondominium(token, {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    city: formData.get('city') as string,
  });

  revalidatePath('/condominiums');
}
```

### With Suspense

```typescript
import { Suspense } from 'react';
import { getGrpcClient, getAuthTokenOrNull } from '@/lib/grpc';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <CondominiumsData />
    </Suspense>
  );
}

async function CondominiumsData() {
  const token = await getAuthTokenOrNull();
  const grpc = getGrpcClient();
  const { condominiums } = await grpc.condominiums.getUserCondominiums(token!);

  return <List items={condominiums} />;
}
```

## Available Services

### Condominiums Service

```typescript
const grpc = getGrpcClient();

// Get all user condominiums
await grpc.condominiums.getUserCondominiums(token);

// Get specific condominium
await grpc.condominiums.getCondominium(token, condominiumId);

// Get primary condominium
await grpc.condominiums.getPrimaryCondominium(token);

// Create condominium
await grpc.condominiums.createCondominium(token, { name, address, city });

// Update condominium
await grpc.condominiums.updateCondominium(token, id, { name });

// List with filters
await grpc.condominiums.listCondominiums(token, {
  search: 'Torres',
  isActive: true,
  page: 1,
  limit: 10,
});

// Manager operations
await grpc.condominiums.getCondominiumManagers(token, condominiumId);
await grpc.condominiums.assignManager(token, { condominiumId, userId, isPrimary });
await grpc.condominiums.updateManager(token, managerId, { isPrimary });
await grpc.condominiums.removeManager(token, managerId);
```

## Error Handling

```typescript
import { getGrpcClient, handleGrpcError } from '@/lib/grpc';

try {
  const grpc = getGrpcClient();
  const response = await grpc.condominiums.getUserCondominiums(token);
  return response;
} catch (error) {
  const errorResponse = handleGrpcError(error);
  // errorResponse contains: { statusCode, message, grpcCode }
  console.error(errorResponse.message);
  throw new Error(errorResponse.message);
}
```

## Configuration

Environment variables (`.env.local`):

```env
GRPC_HOST=localhost
GRPC_PORT=50051
```

Certificates are automatically resolved from: `../../apps/api/certs/`

## Adding New Services

To add a new gRPC service (e.g., Properties):

1. **Create proto file** in API: `apps/api/src/grpc/proto/properties.proto`

2. **Create gRPC controller** in API: `apps/api/src/grpc/controllers/properties.grpc-controller.ts`

3. **Add proto path** to `config.ts`:
   ```typescript
   export const PROTO_FILES = {
     // ...existing
     properties: resolve(PROTO_DIR, 'properties.proto'),
   };
   ```

4. **Add types** to `types.ts`:
   ```typescript
   export interface Property {
     id: string;
     name: string;
     // ...
   }
   ```

5. **Create service** in `services/properties.service.ts`:
   ```typescript
   import { BaseGrpcService } from './base.service';
   import { PROTO_FILES } from '../config';
   import type { Property } from '../types';

   export class PropertiesService extends BaseGrpcService {
     constructor() {
       super(PROTO_FILES.properties, 'openbook.properties.PropertiesService');
     }

     async getProperty(token: string, id: string): Promise<Property> {
       return this.call('GetProperty', { id }, token);
     }
   }
   ```

6. **Export service** in `services/index.ts`:
   ```typescript
   export { PropertiesService } from './properties.service';
   ```

7. **Add to unified client** in `client.ts`:
   ```typescript
   class GrpcClient {
     private _properties?: PropertiesService;

     get properties(): PropertiesService {
       if (!this._properties) {
         this._properties = new PropertiesService();
       }
       return this._properties;
     }

     close() {
       this._condominiums?.close();
       this._properties?.close();
     }
   }
   ```

8. **Use in code**:
   ```typescript
   const grpc = getGrpcClient();
   const property = await grpc.properties.getProperty(token, id);
   ```

## Troubleshooting

### "Certificate not found"
```bash
cd apps/api
./scripts/generate-dev-certs.sh
```

### "Connection refused"
```bash
# Check gRPC server is running
lsof -i:50051

# Start API server
pnpm dev:api
```

### "Unauthenticated"
- Make sure you're logged in
- Verify the `access_token` cookie exists
- Check token is not expired

## Testing with grpcurl

```bash
grpcurl \
  -cert apps/api/certs/client-cert.pem \
  -key apps/api/certs/client-key.pem \
  -cacert apps/api/certs/ca-cert.pem \
  -H "authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}' \
  localhost:50051 \
  openbook.condominiums.CondominiumsService/GetUserCondominiums
```

## Related Files

- API proto definitions: `apps/api/src/grpc/proto/`
- API gRPC controllers: `apps/api/src/grpc/controllers/`
- API gRPC server config: `apps/api/src/grpc/grpc-server.options.ts`
