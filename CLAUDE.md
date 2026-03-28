# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GDOM** (Goal-Driven Operations Manager) is an enterprise software facade — an intelligent orchestration layer that converts business vision into operational reality. It sits between frontends and any existing backend (ERP, CRM, legacy systems) adding Zero Trust security, HATEOAS-driven dynamic UI, granular permissions, and full traceability without requiring migration or reconstruction of existing systems.

Key product characteristics:
- **Universal Facade**: Works with any backend infrastructure via REST or gRPC
- **Day-Zero Operability**: Ready-to-operate web interface requiring zero frontend construction — auto-generates forms from `payloadMetadata` schemas
- **Zero Trust Security**: mTLS mutual authentication, AES-256-GCM encryption at rest, invisible sessions (no browser token storage)
- **5 Auth Strategies**: Bearer, Basic, API Key, OAuth, Devise Token Auth
- **HATEOAS Standard**: Dynamic interface that shows only relevant actions per user based on permissions

Core platform concepts:

**Users & Auth:**
- **User**: Core identity entity with credentials, profile, `isSuperAdmin` flag for full bypass, Habeas Data consent tracking
- **UserState**: Per-user UI preferences (theme, language, sidebar state) persisted across sessions
- **RefreshToken**: Hashed refresh tokens for rotation, revocation, and theft detection
- **AuthLog**: Immutable audit trail for all auth events (LOGIN, LOGOUT, REFRESH, PASSWORD_RESET)

**Permissions & Access Control:**
- **Module**: Functional section with `code`, `type` (`crud`/`specialized`), `navConfig`, `componentConfig`, optional widget. Drives navigation, permissions, and widget rendering
- **ModulePermission**: Action within a module (format: `module:action`, e.g., `goals:create`). `rels` field gates HATEOAS link visibility
- **UserPermission**: Direct grant of a ModulePermission to a User, with optional expiration
- **UserPool**: Named permission group (role). Deactivating a pool revokes all inherited permissions immediately
- **UserPoolMember** / **PoolPermission**: Pool membership and pool-level permission grants
- **UserResourceAccess** / **PoolResourceAccess**: Resource-level access grants (direct or via pool) with optional `responseFilter` (JSONB) and expiration

**Resources & HATEOAS:**
- **Resource**: Registered REST endpoint with `code`, `templateUrl` (supports `{condominiumId}`, `{id}` placeholders), scope, optional link to Integration
- **ResourceHttpMethod**: HTTP method on a resource with `payloadMetadata` (OpenAPI-like schema for auto-generated forms) and `responseMetadata`
- **ResourceHttpMethodLink**: HATEOAS `_links` config — source→target method with `rel` and `paramMappings` for URL resolution
- **ModuleResource**: Join between Module and Resource with `role` (`primary`, `detail`, `related`). Drives action inference from HTTP methods
- **CapabilityPreset** *(beta)*: Predefined HATEOAS capability templates (e.g., `crud`, `readOnly`) for quick admin configuration
- **HttpMethod**: Catalog of REST verbs (GET, POST, PUT, PATCH, DELETE)

**External Integrations:**
- **Integration**: External system connection with `baseUrl`, `authType` (none/bearer/basic/api_key/devise_token_auth), `connectionType`, `managesUsers`, `internalPermissions` flags
- **ExternalUser**: Shadow record for users authenticating via external system, scoped per integration
- **ExternalUserPermission** / **ExternalUserResourceAccess** / **ExternalPoolMember**: Permission model mirroring internal users — direct grants, resource access, and pool membership for external users

**Client-specific (not core, exists for current integrations):**
- **Organization**: Client tenant in an external system with `externalId` and `encryptedCredentials` (AES-256-GCM)

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Monorepo | Nx | ^22.x |
| Package Manager | pnpm | ^8.x |
| Backend | NestJS | ^11.x |
| Frontend | Next.js | ^16.x |
| Landing | Astro | latest |
| Database | PostgreSQL | 16 |
| ORM | TypeORM | ^0.3.x |
| Runtime | Node.js | ^20.x |
| Language | TypeScript | ^5.9.x |
| Forms | React Hook Form | ^7.x |
| Validation | Zod | ^4.x |
| Styling | Tailwind CSS | ^4.x |
| HTTP Client | Axios | ^1.x |
| Testing | Vitest | ^4.x |
| E2E Testing | Playwright | ^1.x |

## Coding Conventions

### Language in Source Code
**All source code must be in English**. This includes:
- Module, class, and function names
- Variable and constant names
- File and folder names
- Code comments
- API routes and endpoints

GDOM platform concepts mapping (Spanish → English code):
| Spanish | English | Table |
|---------|---------|-------|
| Usuario | User | `users` |
| Estado de Usuario | UserState | `user_states` |
| Token de Refresco | RefreshToken | `refresh_tokens` |
| Registro de Auth | AuthLog | `auth_logs` |
| Módulo | Module | `modules` |
| Permiso de Módulo | ModulePermission | `module_permissions` |
| Permiso de Usuario | UserPermission | `user_permissions` |
| Grupo de Usuarios | UserPool | `user_pools` |
| Miembro de Grupo | UserPoolMember | `user_pool_members` |
| Permiso de Grupo | PoolPermission | `pool_permissions` |
| Acceso a Recurso (usuario) | UserResourceAccess | `user_resource_access` |
| Acceso a Recurso (grupo) | PoolResourceAccess | `pool_resource_access` |
| Recurso | Resource | `resources` |
| Método HTTP de Recurso | ResourceHttpMethod | `resource_http_methods` |
| Enlace HATEOAS | ResourceHttpMethodLink | `resource_http_method_links` |
| Recurso de Módulo | ModuleResource | `module_resources` |
| Preset de Capacidad *(beta)* | CapabilityPreset | `capability_presets` |
| Método HTTP | HttpMethod | `http_methods` |
| Integración | Integration | `integrations` |
| Usuario Externo | ExternalUser | `external_users` |
| Permiso de Usuario Externo | ExternalUserPermission | `external_user_permissions` |
| Acceso a Recurso Externo | ExternalUserResourceAccess | `external_user_resource_access` |
| Miembro Externo de Grupo | ExternalPoolMember | `external_pool_members` |

**Note**: Some legacy code may still use Spanish names (e.g., `objetivos` module). New code should use English naming.

### Components Location
All React components must be in `src/components/`. Do NOT create `_components/` folders inside route directories.

## Architecture: Core Platform vs. Domain Layer

### The integration model

GDOM API acts as an **integration layer** between the frontend and external systems:

```
Frontend (Next.js)
      ↓  HTTP
GDOM API (NestJS)   ← integration layer: auth, permissions, HATEOAS, business rules
      ↓  HTTP / gRPC / SDK
External System (ERP, accounting, property management, etc.)
```

Today there is no external system — the domain logic lives directly in the API (goals, condominiums, etc.). But the architecture anticipates that in the future, domain data would come from an external system and the API would act as the facade: consuming the external, applying permissions and HATEOAS, and responding to the frontend.

**The `resources` registry is our configuration** — we define how the external system's responses are exposed to the frontend (which endpoints exist, what their URLs are, what HATEOAS links they produce). The external system does not know about this registry.

### Two distinct layers

**Core Platform (domain-agnostic, reusable across clients)**
- **Resources** (`resources`, `resource_http_methods`, `resource_http_method_links`) — catalog of exposed endpoints and their HATEOAS link configurations
- **HATEOAS** (`HateoasModule`, `HateoasInterceptor`, `HateoasService`, `@HateoasResource`) — enriches responses with `_links` automatically
- **Permissions** (`modules`, `module_permissions`, `user_permissions`, `pool_permissions`) — granular permission system with direct and pool-based assignment
- **Users, Auth, Pools** — authentication and user grouping

**Domain Layer (client-specific, configured per integration)**
- Domain modules are registered dynamically via the admin API — not hardcoded
- Each integration defines its own resources, modules, and permissions

### How to implement a new endpoint

**Always follow this order:**

1. **Register the resource in BD** via the admin API:
   ```
   POST /admin/resources  → declare the endpoint with its templateUrl
   POST /admin/resources/:code/http-methods  → assign HTTP methods
   ```

2. **Configure HATEOAS links** (optional but recommended):
   ```
   PUT /admin/resources/:code/http-methods/:methodId/links  → define outbound links
   ```

3. **Implement the controller** — consume domain logic or call the external system, then decorate:
   ```typescript
   @UseGuards(JwtAuthGuard, CondominiumMemberGuard, PermissionsGuard)
   export class GoalsController {
     @Get()
     @HateoasResource('goals', 'GET')      // ← matches resource code in BD
     @RequirePermission('goals:read')       // ← matches module_permission code in BD
     async findAll(...) {
       // today: calls GoalsService (local DB)
       // future: calls ExternalERP.getGoals(condominiumId)
     }
   }
   ```

The controller is the integration point: it receives the frontend request, applies auth/permissions, calls the data source (local or external), and returns the enriched response. The core platform handles auth, permissions, and HATEOAS transparently — the same regardless of whether the data source is local or external.

## Platform Principles

All implementations must follow:
- **Trazabilidad** (Traceability): Every operation logged with date and responsible party
- **Inmutabilidad** (Immutability): Critical records cannot be deleted, only corrected with justification
- **Auditoría** (Audit): Complete change history
- **Acceso controlado** (Controlled access): Role-based information access via permissions and pools
