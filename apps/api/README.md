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

## Session Context

The `SessionContextModule` assembles and caches the user session context consumed by the frontend via gRPC.

The core method is `SessionContextService.resolveContext(userId)` — the single source of truth for building a healthy session context. It gathers data from three sources:

1. **User** (`UsersService.findById`) — identity, email, role (`isSuperAdmin`)
2. **UserState** (`UserStateService.getOrCreate`) — preferences (theme, language, sidebar) and `selectedCondominiumId`
3. **Condominium** (`CondominiumsService.findOne`) — resolves the selected condominium name and validates user access

If any source fails or is missing, the context degrades gracefully (empty strings / defaults) instead of throwing.

### Data flow

```
getContext(userId)
  ├── cache hit? → return cached
  └── cache miss? → resolveContext(userId)
                      ├── UsersService.findById(userId)
                      ├── UserStateService.getOrCreate(userId)
                      └── CondominiumsService.findOne(selectedCondominiumId, userId)
                            └── userHasAccess(userId, condominiumId)
                                  ├── checks condominium_managers
                                  └── checks property_residents → properties
```

### Caching

- Results are cached per-user with a configurable TTL (`SESSION_CONTEXT_CACHE_TTL_MS`, default 5 min).
- Call `invalidateContext(userId)` when user data, preferences, or condominium selection changes.
- Metadata (field names/types) is cached globally since the schema is static.

### ResolvedSessionContext fields

| Field | Source | Description |
|-------|--------|-------------|
| `userId` | User | User UUID |
| `userEmail` | User | Email address |
| `userFirstName` | User | First name |
| `userLastName` | User | Last name |
| `isSuperAdmin` | User | SuperAdmin flag |
| `condominiumId` | UserState + Condominium | Selected condominium UUID |
| `condominiumName` | Condominium | Selected condominium name |
| `userStateTheme` | UserState | UI theme preference |
| `userStateLanguage` | UserState | Language preference |
| `userStateSidebarCollapsed` | UserState | Sidebar state |

## Module & Resource Configuration

This section documents the permission, resource, and UI configuration system used to control what each user can see and do in each module.

---

### Key Concepts

#### `module_permissions`

Each module has a set of named permissions stored in the `module_permissions` table.

```
module_permissions
  module_id  → FK to modules
  code       → 'read' | 'create' | 'update' | 'delete' (or custom)
  name       → human-readable label
```

A user gets access to a module by being granted one or more of its permissions, either directly (`user_permissions`) or through a pool (`pool_permissions` → `user_pool_members`).

**Access is inferred** — there is no "module access" row. If a user has at least one `module_permission` for a module, the module appears in their session.

---

#### `resources` and `resource_http_methods`

A resource represents an API endpoint (`templateUrl`). Each resource can have one or more HTTP methods registered.

```
resources
  code         → e.g. 'goals', 'goals-detail'
  template_url → e.g. '/api/condominiums/{session:condominiumId}/goals'

resource_http_methods
  resource_id  → FK to resources
  http_method  → GET | POST | PATCH | DELETE
  is_active    → controls visibility
```

`{session:condominiumId}` placeholders are resolved at runtime from the user's session context before the URL is sent to the frontend.

---

#### `module_resources`

Join table that associates resources to a module. A module can have multiple resources (e.g. a list endpoint and a detail endpoint).

```
module_resources
  module_id   → FK to modules
  resource_id → FK to resources
  role        → 'primary' | 'detail' | 'related' (optional label)
```

---

#### `actionsConfig` (JSONB column on `modules`)

The `actions_config` column is a JSONB array of `ModuleActionConfig` objects. It defines which HTTP methods have UI configuration, and maps them to module permissions.

**Structure:**

```jsonc
[
  {
    "code": "read",        // action identifier (see dual role below)
    "httpMethod": "GET",   // HTTP verb that executes this action
    "label": "Ver",        // display label shown to the user
    "uiConfig": {          // opaque to the API, owned by the frontend
      "component": "list",
      "columns": [...],
      "filters": [...],
      "defaultSort": { "field": "deadline", "order": "asc" }
    }
  },
  {
    "code": "create",
    "httpMethod": "POST",
    "label": "Crear",
    "uiConfig": {
      "component": "form",
      "fields": [...]
    }
  }
]
```

**The dual role of `code`:**

The `code` field serves two purposes simultaneously:

1. **Permission identifier** — it matches `module_permissions.code`. The system uses it to check whether the user has access to this action (e.g. `goals:read`, `goals:create`).
2. **HATEOAS `rel` name** — when the backend returns HATEOAS `_links` on a resource response, the `rel` value must match the `code` of the corresponding action. This is how the frontend knows which link triggers which action.

This is important for non-CRUD actions: a module could have `code: "approve"` (POST) and `code: "create"` (POST) — both use the same HTTP method, but they are different actions with different permissions and different HATEOAS links.

**Rules:**
- `code` must match an existing `module_permissions.code` for this module.
- `code` must match the HATEOAS `rel` name used in `_links` responses for the corresponding resource.
- `httpMethod` must match an `is_active` method registered on one of the module's resources.
- `uiConfig` is validated by Zod on write (API) but treated as opaque on read — the frontend owns the typed definitions.
- An HTTP method without a matching `actionsConfig` entry is **never shown** to the user, even if it is active on the resource.

---

### How `/api/auth/me` builds the module list

For each module the user has permissions for:

1. Collect all `module_permission.code` values the user has → `permissionCodes`
2. Parse `module.actions_config` → `actionsConfig`
3. Filter: `actionsConfig.filter(a => permissionCodes.has(a.code))` → `allowedActions`
4. For each resource in `module_resources`:
   - Index `allowedActions` by `httpMethod`
   - Keep only `is_active` HTTP methods that have a matching entry in `allowedActions`
   - Each surviving method is paired with its `action` (permission code + uiConfig)
5. Return the module with `resources[].httpMethods[]` containing only the allowed, configured methods

**Two conditions must be met for a method to appear:**
1. The resource HTTP method is `is_active = true`
2. There is an `actionsConfig` entry with `httpMethod` matching it **and** the user has the corresponding permission (`code`)

---

### Adding a new endpoint to a module

1. **Register the resource** (if it doesn't exist):
   ```
   POST /admin/resources        → { code, templateUrl }
   POST /admin/resources/:code/http-methods → { method: 'GET' }
   ```

2. **Associate the resource to the module**:
   ```
   PATCH /admin/modules/:id     → { resourceCodes: ['my-resource'] }
   ```

3. **Add an actionsConfig entry** on the module with the new `code` + `httpMethod` + `uiConfig`.

4. **Create a migration** to persist the changes to `actions_config` (see `1740500000000-UpdateGoalsActionsConfig.ts` as reference).

---

### `uiConfig` types (frontend-owned)

The API validates `uiConfig` structure on write using Zod schemas in `dto/create-module.dto.ts` and `dto/update-module.dto.ts`. The discriminator is `uiConfig.component`:

| `component`  | Used for           | Key fields                              |
|--------------|--------------------|-----------------------------------------|
| `list`       | List/table views   | `columns`, `filters`, `defaultSort`, `search`, `pagination` |
| `detail`     | Detail views       | `fields` (with `field`, `label`, `format`) |
| `form`       | Create/edit forms  | `fields`, `submitLabel`, `layout`, `readOnlyFields` |
| `confirm`    | Confirmation dialogs | `message`, `variant`, `icon`          |
| `modal-form` | Modal forms        | `fields`, `submitLabel`                 |

The frontend TypeScript definitions live in `apps/web/src/types/business/module.types.ts`.

---

## External User Permissions

The system supports a parallel permission model for external users (users from external integrations like Captudata). External users are identified by a generic string ID from the external system and can be granted the same permission levels as internal users.

### Data Model

```
                         ┌─────────────────┐
                         │  integrations   │
                         └────────┬────────┘
                                  │
                         ┌────────▼────────┐
                         │ external_users  │
                         │                 │
                         │ external_id     │ ← ID from the external system
                         │ integration_id  │ ← scoped to one integration
                         │ name, email     │ ← optional, for admin reference
                         └──┬──────┬───┬───┘
                            │      │   │
              ┌─────────────┘      │   └──────────────┐
              ▼                    ▼                   ▼
┌─────────────────────┐  ┌────────────────┐  ┌────────────────────────┐
│ external_user_      │  │ external_pool_ │  │ external_user_         │
│ permissions         │  │ members        │  │ resource_access        │
│                     │  │                │  │                        │
│ module_permission → │  │ pool_id ──────►│  │ resource_id            │
│ module_permissions  │  │ user_pools     │  │ resource_http_method_id│
│                     │  └───────┬────────┘  │ response_filter (JSONB)│
│ expires_at, isActive│          │           │ expires_at, isActive   │
└─────────────────────┘          ▼           └────────────────────────┘
                        ┌────────────────┐
                        │   user_pools   │ ← SAME pools as internal users
                        │                │
                        ├────────────────┤
                        │ pool_permissions│ ← inherited by external members
                        ├────────────────┤
                        │ pool_resource_ │ ← inherited by external members
                        │ access         │
                        └────────────────┘
```

### Key Design Decisions

- **Shared pools**: External users are added to the same `user_pools` as internal users via `external_pool_members`. They inherit `pool_permissions` and `pool_resource_access` — no duplicate pool tables.
- **`external_users` table**: Instead of scattering `external_user_id` (varchar) across multiple tables, a central `external_users` record maps `(external_id, integration_id)` to a UUID. All other tables FK to `external_users.id`.
- **No SuperAdmin concept**: All external permissions are explicit — there is no implicit full-access role.
- **Response filters**: Both direct (`external_user_resource_access`) and pool-level (`pool_resource_access`) grants support a JSONB `response_filter` to restrict visible items (include/exclude by field value).

### Three Permission Levels

| Level | Description | Direct table | Pool table |
|-------|-------------|--------------|------------|
| **Module access** | Has at least one permission for a module | `external_user_permissions` | `pool_permissions` |
| **Granular action** | Specific `module:action` (e.g. `goals:read`) | `external_user_permissions` | `pool_permissions` |
| **Resource access** | Specific resource + HTTP method (with optional filter) | `external_user_resource_access` | `pool_resource_access` |

### ExternalAuthGuard Flow

The `ExternalAuthGuard` runs on all `/ext/*` proxy routes and follows this decision chain:

1. Match request path to a resource → no match? **allow** (proxy service will 404)
2. `resource.requiresExternalAuth = false` → **allow**
3. `resource.integration` is null → **allow**
4. `integration.managesUsers = false` → **allow**
5. `integration.internalPermissions = false` → **allow**
6. Read `x-external-user-id` header → **403** if missing
7. Check resource-level access via `ExternalPermissionsService` → **allow** if granted (attach `responseFilter`)
8. Fall back to module-level access → **allow** if granted
9. **Deny** (403)

### Guard & Proxy Pipeline

```
Request to /ext/*
    │
    ▼
ExternalAuthGuard            ← matches resource, checks permissions, sets req.resourceMatch
    │
    ▼
ExternalProxyController      ← delegates to ExternalProxyService
    │
    ▼
ExternalProxyService         ← reads req.resourceMatch, authenticates, forwards,
                               applies req.responseFilter to response
```

---

## Related Documentation

- [Architecture Overview](../../docs/ARCHITECTURE.md)
- [HATEOAS Configuration](./HATEOAS.md)
