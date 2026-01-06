# OB-014-C: Navegacion adaptativa por modulos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Permisos y Modulos |
| Status | pending |
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
| [OB-014-C-001](./OB-014-C-001.md) | Crear DynamicNav basado en modulos | pending |
| [OB-014-C-002](./OB-014-C-002.md) | Implementar submenus por permisos granulares | pending |
| [OB-014-C-003](./OB-014-C-003.md) | Crear navegacion mobile responsiva | pending |

## Criterios de Aceptacion

- [ ] Navegacion filtra items segun modulos accesibles
- [ ] SuperAdmin ve todas las opciones
- [ ] Usuarios ven solo modulos asignados
- [ ] Submenus muestran acciones segun permisos granulares
- [ ] Indicador visual de seccion activa
- [ ] Responsive con menu hamburguesa en mobile
- [ ] Transiciones suaves al expandir/contraer

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
    path: '/objetivos',
    label: 'Objetivos',
    icon: TargetIcon,
    module: 'objetivos',
    children: [
      { path: '/objetivos', label: 'Ver todos', permission: 'objetivos:read' },
      { path: '/objetivos/nuevo', label: 'Crear', permission: 'objetivos:create' },
    ],
  },

  // Modulo Aportes
  {
    path: '/aportes',
    label: 'Aportes',
    icon: MoneyIcon,
    module: 'aportes',
    children: [
      { path: '/aportes', label: 'Ver todos', permission: 'aportes:read' },
      { path: '/aportes/registrar', label: 'Registrar', permission: 'aportes:create' },
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
      { path: '/pqr/nuevo', label: 'Nueva solicitud', permission: 'pqr:create' },
      { path: '/pqr/gestionar', label: 'Gestionar', permission: 'pqr:manage' },
    ],
  },

  // Modulo Reportes
  {
    path: '/reportes',
    label: 'Reportes',
    icon: ChartIcon,
    module: 'reportes',
    children: [
      { path: '/reportes', label: 'Ver reportes', permission: 'reportes:read' },
      { path: '/reportes/exportar', label: 'Exportar', permission: 'reportes:export' },
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
      { path: '/admin/permisos', label: 'Gestion de Permisos' },
      { path: '/admin/modulos', label: 'Modulos del Sistema' },
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
