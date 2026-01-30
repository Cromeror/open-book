# OpenBook Architecture

This document describes the type architecture and data flow patterns used in OpenBook.

## Overview

OpenBook uses a layered architecture where **API and Web applications maintain their own type definitions**. There is no shared types library - each application owns its types independently.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            apps/api (NestJS)                                │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │   entities/*.ts      │  │   types/*.ts         │  │ grpc/proto/*.proto│  │
│  │   (TypeORM)          │  │   (API Types)        │  │ (gRPC Contracts) │  │
│  │                      │  │                      │  │                  │  │
│  │ @Entity, @Column     │  │ ModuleWithActions    │  │ Service defs     │  │
│  │ Database models      │  │ ActionSettings       │  │ Message formats  │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                       modules/**/dto/ (Validation)                    │  │
│  │                                                                       │  │
│  │  Zod schemas (createUserSchema)  │  Response DTOs (UserResponse)     │  │
│  │  Constants (MODULE_TYPES)        │  Mapper functions (toResponse)    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           apps/web (Next.js)                                │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ types/business/      │  │ types/api.types.ts   │  │ lib/grpc/types.ts│  │
│  │ (Business Domain)    │  │ (HTTP Transport)     │  │ (gRPC Transport) │  │
│  │                      │  │                      │  │                  │  │
│  │ User, Resource       │  │ PaginatedResponse<T> │  │ @internal        │  │
│  │ CapabilityPreset     │  │ ApiError             │  │ GrpcXxxResponse  │  │
│  │ ModuleWithActions    │  │ QueryParams          │  │ Proto messages   │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    lib/grpc/services/ (Service Layer)                 │  │
│  │                                                                       │  │
│  │  Maps GrpcXxxResponse → Business types  │  Handles transport details │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        components/ (UI Layer)                         │  │
│  │                                                                       │  │
│  │  Uses types from @/types/business  │  Never uses transport types     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. No Shared Types Library

API and Web applications maintain their own types independently:

- **API**: Owns entities (TypeORM), DTOs (Zod), and API-specific types
- **Web**: Owns business types, transport types, and UI-specific types

This avoids tight coupling and allows each application to evolve independently.

### 2. Separation of Concerns

| Layer | Location | Purpose |
|-------|----------|---------|
| Business Types | `web/types/business/` | Pure domain concepts |
| Transport Types | `web/types/api.types.ts`, `web/lib/grpc/types.ts` | Wire formats |
| Entities | `api/entities/` | Database models |
| DTOs | `api/modules/**/dto/` | Input validation & output shaping |

### 3. Transport Types are Internal

gRPC types are marked `@internal` and should never leak into components:

```typescript
// lib/grpc/types.ts
/** @internal - Do not use in components */
export interface GrpcResourceResponse {
  code: string;
  // ...proto fields
}

// lib/grpc/services/resources.service.ts
import type { Resource } from '@/types/business';

export function mapToResource(grpc: GrpcResourceResponse): Resource {
  return { /* mapping */ };
}
```

---

## API Layer (`apps/api/`)

### Entities (`src/entities/`)

TypeORM entities define database models with decorators:

```typescript
// entities/user.entity.ts
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### DTOs (`src/modules/**/dto/`)

DTOs are colocated with their modules following the **proximity principle**:

```
modules/
├── auth/
│   └── dto/
│       ├── login.dto.ts
│       └── register.dto.ts
├── goals/
│   └── dto/
│       ├── create-goal.dto.ts
│       ├── update-goal.dto.ts
│       └── goal.response.ts
└── permissions/
    └── dto/
        ├── create-module.dto.ts    # Contains MODULE_TYPES constant
        └── update-module.dto.ts
```

#### Input DTO Pattern (Zod)

```typescript
// modules/goals/dto/create-goal.dto.ts
import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name required').max(200),
  targetAmount: z.number().positive('Must be positive'),
  deadline: z.string().datetime(),
});

export type CreateGoalDto = z.infer<typeof createGoalSchema>;

export function validateCreateGoalDto(data: unknown): CreateGoalDto {
  return createGoalSchema.parse(data);
}
```

#### Output DTO Pattern (Response)

```typescript
// modules/goals/dto/goal.response.ts
import { GoalEntity } from '../../../entities/goal.entity';

export interface GoalResponse {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;  // Computed field
  status: string;
  createdAt: string;
}

export function toGoalResponse(entity: GoalEntity): GoalResponse {
  return {
    id: entity.id,
    name: entity.name,
    targetAmount: entity.targetAmount,
    currentAmount: entity.currentAmount,
    progress: (entity.currentAmount / entity.targetAmount) * 100,
    status: entity.status,
    createdAt: entity.createdAt.toISOString(),
  };
}
```

### Types (`src/types/`)

API-specific shared types:

```typescript
// types/module-actions.types.ts
export interface ModuleWithActions {
  code: string;
  label: string;
  type: 'crud' | 'specialized';
  actions: ModuleAction[];
  // ...
}

export interface ModuleAction {
  code: string;
  label: string;
  settings: ActionSettings;
}
```

---

## Web Layer (`apps/web/`)

### Business Types (`src/types/business/`)

Pure domain types - no ORM, no transport concerns:

```typescript
// types/business/user.types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export type PublicUser = Omit<User, 'isSuperAdmin'>;
```

Structure:
```
types/business/
├── index.ts                    # Main exports
├── user.types.ts               # User domain
├── resource.types.ts           # HATEOAS resources
├── capability-preset.types.ts  # Preset configs
├── permission.types.ts         # Permission system
├── module.types.ts             # Module configs
└── README.md                   # Guidelines
```

### Transport Types (`src/types/api.types.ts`)

HTTP response wrappers:

```typescript
// types/api.types.ts
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
```

### gRPC Types (`src/lib/grpc/types.ts`)

Internal transport types from proto definitions:

```typescript
// lib/grpc/types.ts

/**
 * @internal - Do not use directly in components
 * Use the mapped business types instead
 */
export interface GrpcResourceResponse {
  code: string;
  name: string;
  endpoint: string;
  capabilities: GrpcCapability[];
}

/** @internal */
export interface GrpcCapability {
  name: string;
  method: string;
  urlPattern: string;
}
```

### Service Layer (`src/lib/grpc/services/`)

Maps transport types to business types:

```typescript
// lib/grpc/services/resources.service.ts
import type { Resource } from '@/types/business';
import type { GrpcResourceResponse } from '../types';

export function mapToResource(grpc: GrpcResourceResponse): Resource {
  return {
    code: grpc.code,
    name: grpc.name,
    endpoint: grpc.endpoint,
    capabilities: grpc.capabilities.map(c => ({
      name: c.name,
      method: c.method as HttpMethod,
      urlPattern: c.urlPattern,
    })),
  };
}
```

### Components

Use only business types:

```typescript
// components/resources/ResourceCard.tsx
import type { Resource } from '@/types/business';

interface ResourceCardProps {
  resource: Resource;
  onEdit: () => void;
}

export function ResourceCard({ resource, onEdit }: ResourceCardProps) {
  // Component implementation
}
```

---

## Data Flow

### API Request Flow

```
Client Request
      │
      ▼
┌─────────────────┐
│  Input DTO      │ ← Zod validates request body
│  (validation)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service        │ ← Business logic
│  Layer          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TypeORM        │ ← Database operations
│  Entity         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Output DTO     │ ← Maps entity → response
│  (response)     │
└────────┬────────┘
         │
         ▼
  JSON/gRPC Response
```

### Web Data Flow

```
gRPC/HTTP Response
        │
        ▼
┌─────────────────┐
│  Transport      │ ← GrpcXxxResponse types
│  Types          │
└────────┬────────┘
         │
         │ Service layer mapping
         ▼
┌─────────────────┐
│  Business       │ ← @/types/business types
│  Types          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React          │ ← UI components
│  Components     │
└─────────────────┘
```

---

## Best Practices

### DO

- Use `@/types/business` for domain types in components
- Create explicit mapper functions between layers
- Mark transport types as `@internal`
- Validate all input at API boundary with Zod
- Add computed fields in output DTOs
- Colocate DTOs with their modules

### DON'T

- Share types between API and Web via a library
- Use transport types (`GrpcXxx`) in components
- Mix ORM decorators with business types
- Expose internal IDs or implementation details
- Skip validation on API input
- Create generic shared utilities

---

## Related Documentation

- [API README](../apps/api/README.md)
- [Business Types README](../apps/web/src/types/business/README.md)
- [Project Overview](../SUMMARY.md)
