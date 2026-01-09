# OB-015-B: Sidemenu dinamico con modulos por permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-015 - Layout Principal y Navegacion con Permisos |
| Status | done |
| Priority | high |
| Created | 2026-01-06 |
| Completed | 2026-01-06 |
| Labels | story, frontend, navigation, permissions |
| Depends on | OB-015-A, OB-014-E |

## User Story

**Como** usuario autenticado
**Quiero** ver solo los modulos a los que tengo acceso en el menu
**Para** navegar unicamente a las secciones permitidas

## Descripcion

El sidebar debe mostrar dinamicamente los modulos habilitados para el usuario segun sus permisos. Utiliza `getServerPermissions()` para obtener los modulos del usuario y renderiza los items correspondientes. SuperAdmin ve todos los modulos.

## Implementacion

### Archivos Creados

| Archivo | Descripcion |
|---------|-------------|
| `lib/nav-config.ts` | Configuracion de todos los items de navegacion con submenus |
| `lib/nav-filter.server.ts` | Filtrado server-side por permisos |
| `components/layout/Icon.tsx` | Renderizado dinamico de iconos Lucide |

### Logica de Filtrado

```typescript
// lib/nav-filter.server.ts
export function filterNavItems(permissions: ServerPermissions): NavItem[] {
  const filterItems = (items: NavItem[]): NavItem[] => {
    return items
      .filter((item) => {
        if (permissions.isSuperAdmin) return true;
        if (item.superAdminOnly) return false;
        if (item.module && !permissions.hasModule(item.module)) return false;
        if (item.permission && !permissions.can(item.permission)) return false;
        return true;
      })
      .map((item) => ({
        ...item,
        children: item.children ? filterItems(item.children) : undefined,
      }))
      .filter((item) => !item.children || item.children.length > 0);
  };

  return filterItems(NAV_CONFIG);
}
```

## Criterios de Aceptacion

- [x] Sidebar muestra solo modulos habilitados para el usuario
- [x] SuperAdmin ve todos los modulos disponibles
- [x] Cada modulo tiene icono, label y ruta correcta
- [x] Item activo resaltado visualmente (bg-blue-50 text-blue-700)
- [x] Hover states en items del menu
- [x] Navegacion funcional con Next.js Link
- [x] Soporte para submenus expandibles (children)

## Modulos Configurados

| Modulo | Icono | Subitems |
|--------|-------|----------|
| Inicio | Home | - |
| Objetivos | Target | Ver todos, Crear |
| Actividades | Calendar | Ver todas, Crear |
| Compromisos | Handshake | Ver todos, Crear |
| Aportes | Banknote | Ver todos, Registrar |
| PQR | MessageSquare | Mis PQR, Nueva, Gestionar |
| Reportes | BarChart3 | Ver, Exportar |
| Usuarios | Users | Ver usuarios |
| Copropiedades | Building2 | Ver todas |
| Apartamentos | DoorOpen | Ver todos, Crear |
| Auditoria | ClipboardList | - |
| Notificaciones | Bell | - |
| Configuracion | Settings | - |
| Admin (SuperAdmin) | Shield | Pools, Permisos, Modulos |
