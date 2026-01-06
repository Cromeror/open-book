# OB-014-E: Sistema de permisos granulares

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Rol y Sistema de Permisos Granulares |
| Status | pending |
| Priority | high |
| Created | 2026-01-05 |
| Updated | 2026-01-05 |
| Labels | story, frontend, permissions, rbac, security |
| Depends on | OB-014-A |

## User Story

**Como** desarrollador del proyecto
**Quiero** un sistema de permisos granulares basado en recursos y acciones
**Para** controlar el acceso fino a funcionalidades especificas mas alla del simple rol

## Descripcion

Esta story implementa un sistema completo de permisos granulares (RBAC) que permite controlar el acceso a nivel de recurso y accion. El sistema define permisos usando el patron `recurso:accion` y provee hooks y componentes para verificacion declarativa de permisos en el frontend.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-014-E-001](./OB-014-E-001.md) | Definir tipos y constantes de permisos | pending |
| [OB-014-E-002](./OB-014-E-002.md) | Implementar hook usePermissions | pending |
| [OB-014-E-003](./OB-014-E-003.md) | Crear componentes Can, CanAny, CanAll | pending |
| [OB-014-E-004](./OB-014-E-004.md) | Implementar PermissionGuard para rutas | pending |
| [OB-014-E-005](./OB-014-E-005.md) | Integrar permisos en navegacion | pending |

## Criterios de Aceptacion

- [ ] Tipos de permisos definidos y sincronizados con backend
- [ ] Hook usePermissions disponible con metodos can, canAny, canAll
- [ ] Componente Can renderiza contenido condicionalmente
- [ ] Componente CanAny verifica cualquier permiso de lista
- [ ] Componente CanAll verifica todos los permisos de lista
- [ ] PermissionGuard protege rutas por permiso especifico
- [ ] Navegacion filtra items segun permisos del usuario
- [ ] Permisos se cargan desde JWT o endpoint /api/auth/me
- [ ] Sistema soporta wildcards (ej: `users:*`)

## Arquitectura

### Tipos de Permisos

```typescript
// lib/permissions.types.ts
export type Resource =
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
  | 'configuracion';

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'export'
  | 'manage'
  | '*';  // Wildcard para todos

export type Permission = `${Resource}:${Action}`;
```

### Hook usePermissions

```typescript
// hooks/usePermissions.ts
interface UsePermissionsReturn {
  permissions: Permission[];
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  loading: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();

  const can = useCallback((permission: Permission) => {
    if (!user?.permissions) return false;

    const [resource, action] = permission.split(':');

    // Check exact match
    if (user.permissions.includes(permission)) return true;

    // Check wildcard
    if (user.permissions.includes(`${resource}:*`)) return true;

    return false;
  }, [user?.permissions]);

  // ...
}
```

### Componentes de Permisos

```typescript
// components/permissions/Can.tsx
interface CanProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { can, loading } = usePermissions();

  if (loading) return null;
  if (!can(permission)) return fallback;

  return <>{children}</>;
}
```

## Notas Tecnicas

- Los permisos se almacenan en el JWT o se obtienen de /api/auth/me
- El frontend solo oculta elementos de UI, la seguridad real esta en backend
- Usar memoizacion para evitar recalculos innecesarios
- Considerar cache de permisos para reducir llamadas
- Los wildcards (`*`) simplifican la asignacion de permisos a admins

## Testing

- [ ] usePermissions retorna permisos correctos
- [ ] can() verifica permisos exactos
- [ ] can() soporta wildcards
- [ ] canAny() retorna true si tiene alguno
- [ ] canAll() retorna true si tiene todos
- [ ] Can renderiza solo con permiso
- [ ] PermissionGuard redirige sin permiso
