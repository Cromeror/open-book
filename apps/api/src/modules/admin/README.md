# Admin Module

This module groups all administrative endpoints under the `/admin` prefix using NestJS RouterModule.

## Purpose

The admin module provides **elevated access** for SuperAdmin users and administrators with specific permissions. These endpoints offer full CRUD operations and management capabilities that are **not available to regular users**.

## Access Control

| Role | Access Level |
|------|--------------|
| SuperAdmin | Full access to all `/admin/*` endpoints |
| Admin | Access based on granular permissions |
| User/Resident | No access (403 Forbidden) |

## Endpoint Structure

```
/admin
├── /users              - User management (CRUD, role assignment)
├── /condominiums       - Condominium management (TODO)
│   ├── /:id/towers     - Tower management (TODO)
│   ├── /:id/apartments - Apartment management (TODO)
│   └── /:id/admins     - Administrator assignment (TODO)
└── /permissions        - Permission management (TODO)
```

## Usage

To add a new admin module:

1. Create your module in `apps/api/src/modules/admin/your-module/`
2. Import it in `admin.module.ts`
3. Register the route in RouterModule

```typescript
// admin.module.ts
@Module({
  imports: [
    UsersModule,
    YourNewModule, // 1. Import
    RouterModule.register([
      {
        path: 'admin',
        children: [
          { path: 'users', module: UsersModule },
          { path: 'your-route', module: YourNewModule }, // 2. Register route
        ],
      },
    ]),
  ],
})
export class AdminModule {}
```

## Security Notes

- All endpoints require JWT authentication (`JwtAuthGuard`)
- Endpoints use `PermissionsGuard` with `@RequirePermission()` decorator
- SuperAdmin bypasses permission checks (handled in `PermissionsGuard`)
- Regular users should never access these endpoints

## Difference from Regular Endpoints

| Aspect | `/admin/*` | Regular endpoints |
|--------|------------|-------------------|
| Access | SuperAdmin + Admins with permissions | All authenticated users |
| Scope | Global (all condominiums) | Scoped to user's condominium/apartment |
| Operations | Full CRUD, bulk operations | Limited read, scoped write |
| Example | `GET /admin/condominiums` (all) | `GET /condominiums/:id/goals` (scoped) |
