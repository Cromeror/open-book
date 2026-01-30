# Business Domain Types

**Pure business domain types for OpenBook frontend.**

## Purpose

This folder is the **source of truth** for business domain types used in the frontend application.

## What Belongs Here

**ONLY pure business types:**

- Domain models representing core business concepts
- Enums and constants defining business rules
- Type utilities for business logic

```typescript
// GOOD - Pure business type
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

// GOOD - Business enum
export enum Scope {
  OWN = 'own',
  COPROPIEDAD = 'copropiedad',
  ALL = 'all',
}
```

## What Does NOT Belong Here

**Transport types (DTOs, responses, requests):**

```typescript
// BAD - This is a transport/response type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
}
// Should be in: @/types/api.types.ts

// BAD - This is a gRPC transport type
export interface GrpcUserResponse {
  id: string;
  email: string;
}
// Should be in: @/lib/grpc/types.ts
```

## Structure

Flat structure - all types at the root level:

```
types/business/
├── index.ts                    # Main export file
├── user.types.ts               # User types
├── resource.types.ts           # HATEOAS resource types
├── capability-preset.types.ts  # Preset configuration types
├── permission.types.ts         # Permission system types
└── module.types.ts             # Module configuration types
```

## Usage

```typescript
// Import from the business folder
import type {
  User,
  Resource,
  CapabilityPreset,
  HttpMethod,
} from '@/types/business';

import { Scope, MODULE_TYPES } from '@/types/business';
```

### In Components

```typescript
import type { Resource, CapabilityPreset } from '@/types/business';

interface ResourceFormProps {
  resource: Resource;
  presets: CapabilityPreset[];
}
```

### In Services

```typescript
import type { User } from '@/types/business';

function mapToUser(response: GrpcUserResponse): User {
  return {
    id: response.id,
    email: response.email,
    // ...
  };
}
```

## Available Types

### User
- `User` - Core user type
- `PublicUser` - User without sensitive fields

### Resources (HATEOAS)
- `Resource` - HATEOAS resource configuration
- `ResourceCapability` - Capability definition
- `ResourceScope` - 'global' | 'condominium'
- `HttpMethod` - 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
- `HateoasLink` - Generated link structure

### Capability Presets
- `CapabilityPreset` - Preset configuration
- `PresetCapability` - Capability within a preset
- `presetToResourceCapabilities()` - Helper function

### Permissions
- `Scope` - Enum: OWN, COPROPIEDAD, ALL
- `Permission` - Permission definition
- `PermissionModule` - Module in permission system
- `PermissionContext` - Context for permission checks

### Modules
- `ModuleType` - 'crud' | 'specialized'
- `ModuleWithActions` - Module with available actions
- `ModuleAction` - Action definition
- `ReadActionSettings` - List view configuration
- `CreateActionSettings` - Create form configuration
- `UpdateActionSettings` - Edit form configuration
- `DeleteActionSettings` - Delete confirmation
- `ExportActionSettings` - Export options
- `MODULE_TYPES` - Constant array

## Adding New Types

1. Create file in this folder (e.g., `goal.types.ts`)
2. Define pure interface (no decorators, no validation)
3. Export from `index.ts`

```typescript
// goal.types.ts
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  status: GoalStatus;
}

export type GoalStatus = 'draft' | 'active' | 'completed' | 'cancelled';
```

```typescript
// index.ts
export type { Goal, GoalStatus } from './goal.types';
```

## Benefits

- **Clear Ownership**: Frontend owns its business types
- **No External Dependencies**: No need to sync with a shared library
- **Framework Agnostic**: Pure TypeScript types
- **Simple Structure**: Flat, easy to navigate
