# OB-014-E: Integracion completa del sistema de permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Permisos y Modulos |
| Status | pending |
| Priority | high |
| Created | 2026-01-05 |
| Updated | 2026-01-06 |
| Labels | story, frontend, permissions, modulos, integration |
| Depends on | OB-014-A, OB-014-D, OB-002-C |

## User Story

**Como** desarrollador del proyecto
**Quiero** un sistema de permisos completo integrado entre frontend y backend
**Para** garantizar que la UI refleje correctamente los permisos definidos en OB-002-C

## Descripcion

Esta story implementa la integracion completa del sistema de permisos por modulos entre el frontend y el backend. Sincroniza los tipos, asegura que el endpoint `/api/auth/me` retorne los permisos correctamente, y verifica que toda la UI respete los permisos.

**IMPORTANTE**: Este sistema reemplaza completamente los roles predefinidos (admin/resident):
- **SuperAdmin**: Usuario unico con acceso total (`isSuperAdmin: true` en JWT)
- **Modulos**: Unidades funcionales del sistema
- **Permisos Granulares**: Acciones especificas dentro de modulos (create, read, update, delete)
- **Scopes**: Alcance del permiso (own, copropiedad, all)

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-014-E-001](./OB-014-E-001.md) | Sincronizar tipos de permisos frontend/backend | pending |
| [OB-014-E-002](./OB-014-E-002.md) | Implementar endpoint /api/auth/me con permisos | pending |
| [OB-014-E-003](./OB-014-E-003.md) | Crear tests de integracion de permisos | pending |
| [OB-014-E-004](./OB-014-E-004.md) | Implementar cache de permisos en frontend | pending |
| [OB-014-E-005](./OB-014-E-005.md) | Documentar sistema de permisos | pending |

## Criterios de Aceptacion

- [ ] Tipos de permisos sincronizados entre frontend y backend
- [ ] GET /api/auth/me retorna user, modules, permissions
- [ ] Cache de permisos en cliente con invalidacion
- [ ] Tests de integracion para flujo completo de permisos
- [ ] SuperAdmin bypasea todas las verificaciones en frontend
- [ ] Scopes (own, copropiedad, all) respetados en UI
- [ ] Documentacion completa del sistema

## Arquitectura de Integracion

### Flujo de Permisos

```
┌─────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /api/auth/login                                     │
│     └─> Retorna: { accessToken, refreshToken }              │
│     └─> accessToken contiene: userId, isSuperAdmin          │
│                                                              │
│  2. GET /api/auth/me (con accessToken)                      │
│     └─> Backend carga permisos del usuario                  │
│     └─> Retorna:                                            │
│         {                                                    │
│           user: { id, email, firstName, isSuperAdmin },     │
│           modules: ['objetivos', 'aportes', 'pqr'],         │
│           permissions: [                                     │
│             { module: 'objetivos', action: 'read', scope: 'copropiedad', scopeId: '...' },
│             { module: 'objetivos', action: 'create', scope: 'copropiedad', scopeId: '...' },
│             { module: 'aportes', action: 'read', scope: 'own' },
│           ]                                                  │
│         }                                                    │
│                                                              │
│  3. Frontend cachea permisos en PermissionsContext          │
│                                                              │
│  4. usePermissions() verifica acceso:                       │
│     - hasModule('objetivos') → true                         │
│     - can('objetivos:create', { copropiedadId }) → true     │
│     - can('aportes:create') → false                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Tipos Compartidos

```typescript
// libs/shared/src/types/permissions.ts
// (Compartido entre frontend y backend)

export type ModuleCode =
  | 'users'
  | 'copropiedades'
  | 'apartamentos'
  | 'objetivos'
  | 'actividades'
  | 'compromisos'
  | 'aportes'
  | 'pqr'
  | 'reportes'
  | 'auditoria'
  | 'notificaciones'
  | 'configuracion';

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'manage';

export type PermissionScope = 'own' | 'copropiedad' | 'all';

export interface UserPermission {
  module: ModuleCode;
  action: PermissionAction;
  scope: PermissionScope;
  scopeId?: string;
}

export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: ModuleCode[];
  permissions: UserPermission[];
}

// Helper type para permisos en formato string
export type PermissionString = `${ModuleCode}:${PermissionAction}`;
```

### Endpoint /api/auth/me

```typescript
// apps/api/src/modules/auth/auth.controller.ts
@Get('me')
@UseGuards(JwtAuthGuard)
async getMe(@CurrentUser() user: User): Promise<AuthMeResponse> {
  // SuperAdmin tiene acceso total
  if (user.isSuperAdmin) {
    return {
      user: this.mapUser(user),
      modules: ALL_MODULES,
      permissions: [], // No necesita permisos, tiene acceso total
    };
  }

  // Usuario regular: cargar permisos efectivos
  const { modules, permissions } = await this.permissionsService.getEffectivePermissions(user.id);

  return {
    user: this.mapUser(user),
    modules,
    permissions,
  };
}
```

### Cache de Permisos

```typescript
// apps/web/src/lib/permissions-cache.ts
const CACHE_KEY = 'user_permissions';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

interface CachedPermissions {
  modules: string[];
  permissions: UserPermission[];
  timestamp: number;
}

export function getCachedPermissions(): CachedPermissions | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const data = JSON.parse(cached) as CachedPermissions;
  if (Date.now() - data.timestamp > CACHE_TTL) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  return data;
}

export function setCachedPermissions(modules: string[], permissions: UserPermission[]): void {
  const data: CachedPermissions = {
    modules,
    permissions,
    timestamp: Date.now(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

export function invalidatePermissionsCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
```

## Modulos del Sistema

| Codigo | Permisos Disponibles | Descripcion |
|--------|---------------------|-------------|
| `users` | read, update | Gestion de usuarios |
| `copropiedades` | read, update | Copropiedades |
| `apartamentos` | create, read, update, delete | Apartamentos |
| `objetivos` | create, read, update, delete | Objetivos de recaudo |
| `actividades` | create, read, update, delete | Actividades de recaudo |
| `compromisos` | create, read, update | Compromisos |
| `aportes` | create, read, update | Aportes reales |
| `pqr` | create, read, manage | PQR |
| `reportes` | read, export | Reportes |
| `auditoria` | read | Auditoria |
| `notificaciones` | read, create | Notificaciones |
| `configuracion` | read, update | Configuracion |

## Testing de Integracion

```typescript
// tests/permissions.integration.spec.ts
describe('Permissions Integration', () => {
  it('should load user permissions correctly', async () => {
    // Login como usuario con permisos limitados
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    // Obtener permisos
    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

    expect(meResponse.body.user.isSuperAdmin).toBe(false);
    expect(meResponse.body.modules).toContain('objetivos');
    expect(meResponse.body.permissions).toContainEqual({
      module: 'objetivos',
      action: 'read',
      scope: 'copropiedad',
      scopeId: expect.any(String),
    });
  });

  it('SuperAdmin should have empty permissions array', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'superadmin@example.com', password: 'password' });

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

    expect(meResponse.body.user.isSuperAdmin).toBe(true);
    expect(meResponse.body.permissions).toEqual([]);
  });
});
```

## Notas Tecnicas

- Los tipos deben estar en `libs/shared` para compartir entre apps
- Cache de permisos usa localStorage con TTL de 5 minutos
- Invalidar cache al cambiar permisos o hacer logout
- SuperAdmin no necesita permisos cargados - siempre pasa
- Scopes se verifican tanto en frontend como backend (defense in depth)
- El frontend solo oculta UI - la seguridad real esta en backend
