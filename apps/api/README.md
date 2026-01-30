# OpenBook API

NestJS backend service for the OpenBook financial management system.

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL 16 with TypeORM
- **Validation**: Zod
- **Communication**: REST + gRPC
- **Authentication**: JWT

## Project Structure

```
src/
├── entities/           # TypeORM entities (database models)
├── modules/            # Feature modules
│   ├── auth/
│   │   ├── dto/        # DTOs for auth (login, register, etc.)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── goals/
│   │   ├── dto/        # DTOs for goals
│   │   └── ...
│   └── ...
├── grpc/               # gRPC controllers and proto files
├── types/              # Shared types (resource.types.ts, etc.)
└── migrations/         # Database migrations
```

## DTOs (Data Transfer Objects)

DTOs are colocated with their modules following the **proximity principle**:

```
modules/
├── goals/
│   └── dto/
│       ├── create-goal.dto.ts   # Input validation
│       ├── update-goal.dto.ts
│       ├── query-goals.dto.ts   # Query parameters
│       └── index.ts
└── auth/
    └── dto/
        ├── login.dto.ts
        ├── register.dto.ts
        └── index.ts
```

### DTO Types

| Type | Purpose | Naming |
|------|---------|--------|
| Input DTO | Validate request body | `Create{Entity}Dto`, `Update{Entity}Dto` |
| Query DTO | Validate query params | `Query{Entity}sDto` |
| Output DTO | Shape response | `{Entity}Response` |

### Input DTO Pattern (with Zod)

```typescript
import { z } from 'zod';

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  targetAmount: z.number().positive('Must be positive'),
  deadline: z.string().datetime(),
});

export type CreateGoalDto = z.infer<typeof createGoalSchema>;

export function validateCreateGoalDto(data: unknown): CreateGoalDto {
  return createGoalSchema.parse(data);
}
```

### Output DTO Pattern (Response)

```typescript
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

export function toGoalResponse(goal: GoalEntity): GoalResponse {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    progress: (goal.currentAmount / goal.targetAmount) * 100,
    status: goal.status,
    createdAt: goal.createdAt.toISOString(),
  };
}
```

## Architecture

```
┌────────────────────────────────────────────┐
│              apps/api/src                   │
└────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────────┐   ┌───────────────────┐
│ entities/*.ts     │   │ modules/**/dto/   │
│ (TypeORM)         │   │ (Validation)      │
│                   │   │                   │
│ @Entity, @Column  │   │ CreateGoalDto     │
│ Database models   │   │ GoalResponse      │
└───────────────────┘   └───────────────────┘
        │                       │
        └───────────┬───────────┘
                    ▼
        ┌───────────────────────┐
        │    types/*.ts         │
        │  (API shared types)   │
        │                       │
        │  ModuleWithActions    │
        │  ResourceCapability   │
        └───────────────────────┘
```

### Entity Implementation

```typescript
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // TypeORM-specific fields
  @DeleteDateColumn()
  deletedAt: Date | null;
}
```

## Best Practices

### DTOs
- Always validate input with Zod schemas
- Never expose internal fields in responses
- Add computed fields in response DTOs
- Create explicit mapper functions (`toXxxResponse`)

### Entities
- Define all business fields in entity files
- Keep TypeORM decorators only in entity files
- Use soft delete where appropriate

### General
- Keep DTOs close to their modules
- Document with JSDoc
- Use types from `src/types/` for shared API types

## Commands

```bash
# Development
pnpm nx serve api

# Build
pnpm nx build api

# Run migrations
pnpm nx run api:migration:run

# Generate migration
pnpm nx run api:migration:generate
```

## Related Documentation

- [Architecture Overview](../../docs/ARCHITECTURE.md)
- [HATEOAS Configuration](./HATEOAS.md)
