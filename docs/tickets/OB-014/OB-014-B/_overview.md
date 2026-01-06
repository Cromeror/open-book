# OB-014-B: Layout dinamico basado en permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Permisos y Modulos |
| Status | pending |
| Priority | high |
| Created | 2026-01-05 |
| Updated | 2026-01-06 |
| Labels | story, frontend, layout, permisos, modulos |
| Depends on | OB-014-A |

## User Story

**Como** usuario autenticado del sistema
**Quiero** un layout que se adapte a mis permisos asignados
**Para** ver y acceder solo a las funcionalidades que tengo autorizadas

## Descripcion

Implementar el layout principal de la aplicacion que se adapta dinamicamente segun los modulos y permisos del usuario. No existe distincion admin/resident - el layout muestra las secciones segun los modulos asignados a cada usuario.

**IMPORTANTE**: No existen roles predefinidos. El layout:
- Para **SuperAdmin**: Muestra todas las secciones sin restricciones
- Para **Usuarios**: Muestra solo los modulos asignados

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-014-B-001](./OB-014-B-001.md) | Crear DashboardLayout con sidebar dinamico | pending |
| [OB-014-B-002](./OB-014-B-002.md) | Implementar Header con info de usuario y permisos | pending |
| [OB-014-B-003](./OB-014-B-003.md) | Crear estructura de rutas por modulos | pending |

## Criterios de Aceptacion

- [ ] Layout con sidebar que muestra solo modulos accesibles
- [ ] Header con info de usuario y opcion logout
- [ ] SuperAdmin ve todas las secciones
- [ ] Usuarios ven solo modulos asignados
- [ ] Menu de navegacion generado dinamicamente segun permisos
- [ ] Indicador de seccion/modulo activo
- [ ] Responsive para mobile, tablet y desktop
- [ ] Breadcrumbs para navegacion contextual

## Estructura del Layout

```
┌─────────────────────────────────────────────────────────┐
│                     HEADER                              │
│  Logo    [Usuario: juan@ejemplo.com]    [Notif] [Logout]│
├─────────┬───────────────────────────────────────────────┤
│         │                                               │
│ SIDEBAR │              MAIN CONTENT                     │
│ (basado │                                               │
│  en     │   ┌─────────────────────────────────────┐    │
│ modulos)│   │  Breadcrumbs: Dashboard > Objetivos │    │
│         │   └─────────────────────────────────────┘    │
│ [modulo]│                                               │
│ [modulo]│   {children - contenido de pagina}           │
│ [modulo]│                                               │
│         │                                               │
└─────────┴───────────────────────────────────────────────┘
```

## Modulos en Navegacion

El sidebar muestra items segun los modulos asignados al usuario:

```typescript
const NAV_ITEMS = [
  // Siempre visible para usuarios autenticados
  { path: '/dashboard', label: 'Inicio', icon: HomeIcon, module: null },

  // Visibles segun modulo asignado
  { path: '/objetivos', label: 'Objetivos', icon: TargetIcon, module: 'objetivos' },
  { path: '/actividades', label: 'Actividades', icon: CalendarIcon, module: 'actividades' },
  { path: '/aportes', label: 'Aportes', icon: MoneyIcon, module: 'aportes' },
  { path: '/compromisos', label: 'Compromisos', icon: HandshakeIcon, module: 'compromisos' },
  { path: '/pqr', label: 'PQR', icon: MessageIcon, module: 'pqr' },
  { path: '/reportes', label: 'Reportes', icon: ChartIcon, module: 'reportes' },
  { path: '/usuarios', label: 'Usuarios', icon: UsersIcon, module: 'users' },
  { path: '/copropiedades', label: 'Copropiedades', icon: BuildingIcon, module: 'copropiedades' },
  { path: '/apartamentos', label: 'Apartamentos', icon: DoorIcon, module: 'apartamentos' },
  { path: '/auditoria', label: 'Auditoria', icon: ClipboardIcon, module: 'auditoria' },
  { path: '/configuracion', label: 'Configuracion', icon: SettingsIcon, module: 'configuracion' },

  // Solo visible para SuperAdmin
  { path: '/admin/pools', label: 'Pools', icon: GroupIcon, superAdminOnly: true },
  { path: '/admin/permisos', label: 'Permisos', icon: KeyIcon, superAdminOnly: true },
  { path: '/admin/modulos', label: 'Modulos', icon: ModuleIcon, superAdminOnly: true },
];
```

## Notas Tecnicas

- Usar Next.js App Router con layouts anidados
- El sidebar se genera dinamicamente usando usePermissions()
- Implementar collapsible sidebar para responsive
- Considerar lazy loading de secciones
- Mantener estado del sidebar en localStorage
