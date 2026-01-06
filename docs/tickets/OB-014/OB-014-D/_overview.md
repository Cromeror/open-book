# OB-014-D: Componentes compartidos y utilidades de permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Permisos y Modulos |
| Status | pending |
| Priority | medium |
| Created | 2026-01-05 |
| Updated | 2026-01-06 |
| Labels | story, frontend, components, utilities, permisos |
| Depends on | OB-014-A |

## User Story

**Como** desarrollador del proyecto
**Quiero** componentes reutilizables basados en permisos por modulos
**Para** construir interfaces consistentes y mantener codigo DRY

## Descripcion

Crear componentes UI compartidos que renderizan condicionalmente segun los permisos del usuario, utilidades para manejo de permisos y helpers de renderizado condicional.

**IMPORTANTE**: No existen roles predefinidos (admin/resident). Los componentes:
- Verifican acceso a **modulos** (hasModule)
- Verifican **permisos granulares** (can)
- SuperAdmin bypasea todas las verificaciones

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-014-D-001](./OB-014-D-001.md) | Crear componentes ShowForModule y ShowForPermission | pending |
| [OB-014-D-002](./OB-014-D-002.md) | Implementar HOC withModule y withPermission | pending |
| [OB-014-D-003](./OB-014-D-003.md) | Crear utilidades de permisos para renderizado | pending |

## Criterios de Aceptacion

- [ ] ShowForModule renderiza contenido si tiene acceso al modulo
- [ ] ShowForPermission renderiza contenido si tiene permiso granular
- [ ] ShowForSuperAdmin solo muestra para SuperAdmin
- [ ] withModule HOC para proteger componentes por modulo
- [ ] withPermission HOC para proteger por permiso granular
- [ ] Utilidades para verificar permisos de forma declarativa
- [ ] Componentes documentados con ejemplos

## Componentes de Renderizado Condicional

```typescript
// components/permissions/ShowForModule.tsx
interface ShowForModuleProps {
  module: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza children solo si el usuario tiene acceso al modulo
 *
 * @example
 * ```tsx
 * <ShowForModule module="objetivos">
 *   <ObjetivosSection />
 * </ShowForModule>
 * ```
 */
export function ShowForModule({ module, children, fallback = null }: ShowForModuleProps) {
  const { hasModule, isSuperAdmin, isLoading } = usePermissions();

  if (isLoading) return null;
  if (!isSuperAdmin && !hasModule(module)) return <>{fallback}</>;

  return <>{children}</>;
}

// components/permissions/ShowForPermission.tsx
interface ShowForPermissionProps {
  permission: string;
  context?: PermissionContext;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza children solo si el usuario tiene el permiso granular
 *
 * @example
 * ```tsx
 * <ShowForPermission permission="objetivos:create">
 *   <Button>Crear Objetivo</Button>
 * </ShowForPermission>
 *
 * <ShowForPermission
 *   permission="objetivos:update"
 *   context={{ copropiedadId: objetivo.copropiedadId }}
 * >
 *   <Button>Editar</Button>
 * </ShowForPermission>
 * ```
 */
export function ShowForPermission({
  permission,
  context,
  children,
  fallback = null,
}: ShowForPermissionProps) {
  const { can, isSuperAdmin, isLoading } = usePermissions();

  if (isLoading) return null;
  if (!isSuperAdmin && !can(permission, context)) return <>{fallback}</>;

  return <>{children}</>;
}

// components/permissions/ShowForSuperAdmin.tsx
interface ShowForSuperAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza children solo para SuperAdmin
 *
 * @example
 * ```tsx
 * <ShowForSuperAdmin>
 *   <AdminPanel />
 * </ShowForSuperAdmin>
 * ```
 */
export function ShowForSuperAdmin({ children, fallback = null }: ShowForSuperAdminProps) {
  const { isSuperAdmin, isLoading } = usePermissions();

  if (isLoading) return null;
  if (!isSuperAdmin) return <>{fallback}</>;

  return <>{children}</>;
}

// components/permissions/ShowForAnyModule.tsx
interface ShowForAnyModuleProps {
  modules: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Renderiza children si tiene acceso a CUALQUIERA de los modulos
 */
export function ShowForAnyModule({ modules, children, fallback = null }: ShowForAnyModuleProps) {
  const { hasModule, isSuperAdmin, isLoading } = usePermissions();

  if (isLoading) return null;
  if (!isSuperAdmin && !modules.some(m => hasModule(m))) return <>{fallback}</>;

  return <>{children}</>;
}

// components/permissions/index.ts
export { ShowForModule } from './ShowForModule';
export { ShowForPermission } from './ShowForPermission';
export { ShowForSuperAdmin } from './ShowForSuperAdmin';
export { ShowForAnyModule } from './ShowForAnyModule';
```

## HOCs de Permisos

```typescript
// hocs/withModule.tsx
export function withModule<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  module: string,
  options?: { fallback?: React.ComponentType }
) {
  return function WithModuleComponent(props: P) {
    const { hasModule, isSuperAdmin, isLoading } = usePermissions();

    if (isLoading) return <div>Cargando...</div>;
    if (!isSuperAdmin && !hasModule(module)) {
      const Fallback = options?.fallback;
      return Fallback ? <Fallback /> : null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Uso:
// const ProtectedObjetivos = withModule(ObjetivosPage, 'objetivos');

// hocs/withPermission.tsx
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: string,
  options?: { fallback?: React.ComponentType }
) {
  return function WithPermissionComponent(props: P) {
    const { can, isSuperAdmin, isLoading } = usePermissions();

    if (isLoading) return <div>Cargando...</div>;
    if (!isSuperAdmin && !can(permission)) {
      const Fallback = options?.fallback;
      return Fallback ? <Fallback /> : null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Uso:
// const CreateObjetivoButton = withPermission(Button, 'objetivos:create');
```

## Utilidades de Permisos

```typescript
// lib/permissions-utils.ts

/**
 * Formatea un permiso para mostrar al usuario
 */
export function formatPermission(permission: string): string {
  const [module, action] = permission.split(':');
  const moduleLabels: Record<string, string> = {
    objetivos: 'Objetivos',
    aportes: 'Aportes',
    pqr: 'PQR',
    // ...
  };
  const actionLabels: Record<string, string> = {
    create: 'Crear',
    read: 'Ver',
    update: 'Editar',
    delete: 'Eliminar',
    export: 'Exportar',
    manage: 'Gestionar',
  };

  return `${actionLabels[action] || action} ${moduleLabels[module] || module}`;
}

/**
 * Agrupa permisos por modulo
 */
export function groupPermissionsByModule(permissions: Permission[]): Map<string, Permission[]> {
  const grouped = new Map<string, Permission[]>();

  for (const permission of permissions) {
    const module = permission.module;
    if (!grouped.has(module)) {
      grouped.set(module, []);
    }
    grouped.get(module)!.push(permission);
  }

  return grouped;
}
```

## Notas Tecnicas

- Los componentes usan usePermissions() internamente
- isLoading evita flash de contenido no autorizado
- SuperAdmin siempre bypasea verificaciones
- Usar memo() para optimizar re-renders
- Considerar suspense boundaries para loading states
