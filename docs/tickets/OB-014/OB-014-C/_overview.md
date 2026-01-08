# OB-014-C: Navegacion adaptativa por modulos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Permisos y Modulos |
| Status | done |
| Priority | high |
| Created | 2026-01-05 |
| Updated | 2026-01-06 |
| Labels | story, frontend, navigation, permisos, modulos |
| Depends on | OB-014-A, OB-014-B |

## User Story

**Como** usuario del sistema
**Quiero** una navegacion que muestre solo las secciones a las que tengo acceso
**Para** encontrar facilmente las funcionalidades que puedo usar

## Descripcion

Implementar el sistema de navegacion que se adapta dinamicamente segun los modulos y permisos del usuario. La navegacion filtra automaticamente los items del menu basado en los permisos asignados, sin necesidad de roles predefinidos.

**IMPORTANTE**: No existen roles predefinidos (admin/resident). La navegacion:
- Para **SuperAdmin**: Muestra todos los modulos
- Para **Usuarios**: Muestra solo modulos asignados + submenus segun permisos granulares

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-014-C-001](./OB-014-C-001.md) | Crear DynamicNav basado en modulos | done |
| [OB-014-C-002](./OB-014-C-002.md) | Implementar submenus por permisos granulares | done |
| [OB-014-C-003](./OB-014-C-003.md) | Crear navegacion mobile responsiva | done |

## Criterios de Aceptacion

- [x] Navegacion filtra items segun modulos accesibles
- [x] SuperAdmin ve todas las opciones
- [x] Usuarios ven solo modulos asignados
- [x] Submenus muestran acciones segun permisos granulares
- [x] Indicador visual de seccion activa
- [x] Responsive con menu hamburguesa en mobile
- [x] Transiciones suaves al expandir/contraer

## Sistema de Navegacion por Modulos

```typescript
// lib/navigation.ts
import { usePermissions } from '@/hooks/usePermissions';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType;
  module?: string;          // Modulo requerido (null = siempre visible)
  permission?: string;      // Permiso granular requerido
  superAdminOnly?: boolean; // Solo SuperAdmin
  children?: NavItem[];     // Submenus
}

const NAV_CONFIG: NavItem[] = [
  // Dashboard - siempre visible
  { path: '/dashboard', label: 'Inicio', icon: HomeIcon },

  // Modulo Objetivos
  {
    path: '/goals',
    label: 'Objetivos',
    icon: TargetIcon,
    module: 'goals',
    children: [
      { path: '/goals', label: 'Ver todos', permission: 'goals:read' },
      { path: '/goals/new', label: 'Crear', permission: 'goals:create' },
    ],
  },

  // Modulo Aportes
  {
    path: '/contributions',
    label: 'Aportes',
    icon: MoneyIcon,
    module: 'contributions',
    children: [
      { path: '/contributions', label: 'Ver todos', permission: 'contributions:read' },
      { path: '/contributions/register', label: 'Registrar', permission: 'contributions:create' },
    ],
  },

  // Modulo PQR
  {
    path: '/pqr',
    label: 'PQR',
    icon: MessageIcon,
    module: 'pqr',
    children: [
      { path: '/pqr', label: 'Mis PQR', permission: 'pqr:read' },
      { path: '/pqr/new', label: 'Nueva solicitud', permission: 'pqr:create' },
      { path: '/pqr/manage', label: 'Gestionar', permission: 'pqr:manage' },
    ],
  },

  // Modulo Reportes
  {
    path: '/reports',
    label: 'Reportes',
    icon: ChartIcon,
    module: 'reports',
    children: [
      { path: '/reports', label: 'Ver reportes', permission: 'reports:read' },
      { path: '/reports/export', label: 'Exportar', permission: 'reports:export' },
    ],
  },

  // ... otros modulos

  // SuperAdmin only
  {
    path: '/admin',
    label: 'Administracion',
    icon: SettingsIcon,
    superAdminOnly: true,
    children: [
      { path: '/admin/pools', label: 'Pools de Usuarios' },
      { path: '/admin/permissions', label: 'Gestion de Permisos' },
      { path: '/admin/modules', label: 'Modulos del Sistema' },
    ],
  },
];

/**
 * Hook que retorna items de navegacion filtrados por permisos
 */
export function useNavigation() {
  const { hasModule, can, isSuperAdmin } = usePermissions();

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter(item => {
        // SuperAdmin ve todo
        if (isSuperAdmin) return true;

        // Items solo para SuperAdmin
        if (item.superAdminOnly) return false;

        // Verificar modulo si es requerido
        if (item.module && !hasModule(item.module)) return false;

        // Verificar permiso si es requerido
        if (item.permission && !can(item.permission)) return false;

        return true;
      })
      .map(item => ({
        ...item,
        children: item.children ? filterNavItems(item.children) : undefined,
      }))
      .filter(item => !item.children || item.children.length > 0);
  };

  return {
    navItems: filterNavItems(NAV_CONFIG),
    isSuperAdmin,
  };
}
```

## Notas Tecnicas

- Usar Next.js Link para navegacion client-side
- Implementar active state basado en pathname
- Considerar prefetch para rutas accesibles
- Menu mobile usa Sheet/Drawer pattern
- Animaciones con Framer Motion o CSS transitions
