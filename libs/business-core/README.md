# @openbook/business-core

Shared business types and interfaces for the OpenBook application.

## Purpose

This package contains TypeScript type definitions shared between the API and Web applications, ensuring type safety across the entire stack.

## Structure

```
src/
├── modules/          # Module and action type definitions
├── permissions/      # Permission and scope types
├── auth/            # Authentication types
├── entities/        # Entity DTOs (Goals, Users, etc.)
└── common/          # Common API types (pagination, errors, etc.)
```

## Usage

### In API (NestJS)

```typescript
import { ModuleWithActions, Scope } from '@openbook/business-core/modules';
import { GrantPermissionDto } from '@openbook/business-core/permissions';
import { AuthMeResponse } from '@openbook/business-core/auth';
```

### In Web (Next.js)

```typescript
import type { ModuleWithActions, ReadActionSettings } from '@openbook/business-core/modules';
import type { PermissionContext } from '@openbook/business-core/permissions';
import type { AuthUser } from '@openbook/business-core/auth';
```

## Benefits

- **Single Source of Truth**: Types defined once, used everywhere
- **Type Safety**: Compile-time validation of API contracts
- **Refactoring**: Changes propagate automatically
- **Documentation**: Types serve as living documentation

## Adding New Types

1. Create a new file in the appropriate directory
2. Export types from the directory's `index.ts`
3. Types are automatically available to both apps

## Type Conventions

- Use `interface` for object shapes
- Use `enum` for fixed sets of values
- Use `type` for unions and complex types
- Suffix DTOs with `Dto` (e.g., `CreateGoalDto`)
- Suffix responses with `Response` (e.g., `AuthMeResponse`)
