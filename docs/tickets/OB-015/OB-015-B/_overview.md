# OB-015-B: Sidemenu dinamico con modulos por permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-015 - Layout Principal y Navegacion con Permisos |
| Status | pending |
| Priority | high |
| Created | 2026-01-06 |
| Labels | story, frontend, navigation, permissions |
| Depends on | OB-015-A, OB-014-E |

## User Story

**Como** usuario autenticado
**Quiero** ver solo los modulos a los que tengo acceso en el menu
**Para** navegar unicamente a las secciones permitidas

## Descripcion

El sidebar debe mostrar dinamicamente los modulos habilitados para el usuario segun sus permisos. Utiliza `getServerPermissions()` para obtener los modulos del usuario y renderiza los items correspondientes. SuperAdmin ve todos los modulos.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-015-B-001](./OB-015-B-001.md) | Crear configuracion de navegacion por modulos | pending |
| [OB-015-B-002](./OB-015-B-002.md) | Implementar SidebarNav con filtrado por permisos | pending |
| [OB-015-B-003](./OB-015-B-003.md) | Crear componente SidebarItem con iconos | pending |
| [OB-015-B-004](./OB-015-B-004.md) | Indicador visual de ruta activa | pending |

## Criterios de Aceptacion

- [ ] Sidebar muestra solo modulos habilitados para el usuario
- [ ] SuperAdmin ve todos los modulos disponibles
- [ ] Cada modulo tiene icono, label y ruta correcta
- [ ] Item activo resaltado visualmente
- [ ] Hover states en items del menu
- [ ] Navegacion funcional con Next.js Link

## Configuracion de Modulos

```typescript
// lib/nav-config.ts
export const NAV_ITEMS: NavItem[] = [
  { module: 'dashboard', label: 'Inicio', icon: Home, href: '/dashboard' },
  { module: 'objetivos', label: 'Objetivos', icon: Target, href: '/dashboard/objetivos' },
  { module: 'actividades', label: 'Actividades', icon: Calendar, href: '/dashboard/actividades' },
  { module: 'compromisos', label: 'Compromisos', icon: FileCheck, href: '/dashboard/compromisos' },
  { module: 'aportes', label: 'Aportes', icon: DollarSign, href: '/dashboard/aportes' },
  { module: 'usuarios', label: 'Usuarios', icon: Users, href: '/dashboard/usuarios' },
  { module: 'pqr', label: 'PQR', icon: MessageSquare, href: '/dashboard/pqr' },
  { module: 'reportes', label: 'Reportes', icon: BarChart3, href: '/dashboard/reportes' },
  { module: 'configuracion', label: 'Configuracion', icon: Settings, href: '/dashboard/configuracion' },
];
```

## Logica de Filtrado

```typescript
// En Sidebar.tsx (Server Component)
const { modules, user } = await getServerPermissions();

// SuperAdmin ve todo, usuarios regulares ven solo sus modulos
const visibleItems = user.isSuperAdmin
  ? NAV_ITEMS
  : NAV_ITEMS.filter(item =>
      item.module === 'dashboard' || modules.includes(item.module)
    );
```

## Archivos a Crear/Modificar

```
apps/web/src/
├── lib/
│   └── nav-config.ts           # Configuracion de items de navegacion
├── components/
│   └── layout/
│       ├── SidebarNav.tsx      # Lista de navegacion filtrada
│       └── SidebarItem.tsx     # Item individual del menu
```
