# OB-015: Layout Principal y Navegacion con Permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Type | Epic |
| Status | done |
| Priority | high |
| Created | 2026-01-06 |
| Completed | 2026-01-06 |
| Labels | epic, frontend, layout, navigation, permissions |
| Depends on | OB-014-E |

## Descripcion

Esta epica implementa el layout principal de la aplicacion para usuarios autenticados, incluyendo un sidemenu dinamico que muestra unicamente los modulos habilitados segun los permisos del usuario. El layout debe ser consistente en todas las paginas protegidas y permitir logout.

## Objetivo

Crear una experiencia de navegacion coherente y segura donde:
- Los usuarios solo ven los modulos a los que tienen acceso
- SuperAdmin ve todos los modulos
- El layout es responsive (sidebar colapsable en mobile)
- Se puede cerrar sesion facilmente

## Stories

| ID | Titulo | Status | Priority |
|----|--------|--------|----------|
| [OB-015-A](./OB-015-A/_overview.md) | Layout principal con header y sidebar | completed | high |
| [OB-015-B](./OB-015-B/_overview.md) | Sidemenu dinamico con modulos por permisos | completed | high |
| [OB-015-C](./OB-015-C/_overview.md) | Funcionalidad de logout | completed | high |
| [OB-015-D](./OB-015-D/_overview.md) | Responsive design y sidebar colapsable | completed | medium |

## Implementacion

### Archivos Creados

```
apps/web/src/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx              # Layout principal con permisos
│       └── dashboard/page.tsx      # Dashboard home
├── components/
│   └── layout/
│       ├── DashboardShell.tsx      # Shell que combina sidebar + header
│       ├── Sidebar.tsx             # Navegacion lateral con logout
│       ├── Header.tsx              # Header con user menu
│       ├── LogoutButton.tsx        # Boton de logout (server action)
│       ├── Icon.tsx                # Iconos dinamicos de Lucide
│       ├── Breadcrumbs.tsx         # Migas de pan
│       └── index.ts                # Barrel export
└── lib/
    ├── nav-config.ts               # Configuracion de items de navegacion
    ├── nav-filter.server.ts        # Filtrado server-side por permisos
    └── auth.actions.ts             # Server actions (login/logout)
```

### Flujo de Navegacion

```
┌─────────────────────────────────────────────────────────────┐
│                     DASHBOARD LAYOUT                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌─────────────────────────────────────────┐  │
│  │          │  │  HEADER                                 │  │
│  │          │  │  ┌─────────┐              ┌──────────┐  │  │
│  │          │  │  │ Logo    │              │ UserMenu │  │  │
│  │          │  │  └─────────┘              └──────────┘  │  │
│  │ SIDEBAR  │  ├─────────────────────────────────────────┤  │
│  │          │  │                                         │  │
│  │ - Home   │  │           MAIN CONTENT                  │  │
│  │ - Modulo1│  │                                         │  │
│  │ - Modulo2│  │           (children)                    │  │
│  │ - ...    │  │                                         │  │
│  │          │  │                                         │  │
│  │ [Logout] │  │                                         │  │
│  └──────────┘  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Carga de Modulos por Permisos

```typescript
// apps/web/src/app/(dashboard)/layout.tsx
const permissions = await getServerPermissions();
const navItems = filterNavItems(permissions);

// filterNavItems() en nav-filter.server.ts filtra segun:
// - permissions.isSuperAdmin -> ve todo
// - item.superAdminOnly -> solo SuperAdmin
// - item.module -> verifica hasModule()
// - item.permission -> verifica can()
```

## Modulos del Sistema

| Codigo | Icono | Label | Ruta |
|--------|-------|-------|------|
| `dashboard` | Home | Inicio | /dashboard |
| `objetivos` | Target | Objetivos | /objetivos |
| `actividades` | Calendar | Actividades | /actividades |
| `compromisos` | Handshake | Compromisos | /compromisos |
| `aportes` | Banknote | Aportes | /aportes |
| `usuarios` | Users | Usuarios | /usuarios |
| `copropiedades` | Building2 | Copropiedades | /copropiedades |
| `apartamentos` | DoorOpen | Apartamentos | /apartamentos |
| `pqr` | MessageSquare | PQR | /pqr |
| `reportes` | BarChart3 | Reportes | /reportes |
| `auditoria` | ClipboardList | Auditoria | /auditoria |
| `notificaciones` | Bell | Notificaciones | /notificaciones |
| `configuracion` | Settings | Configuracion | /configuracion |
| `admin` | Shield | Administracion | /admin (SuperAdmin only) |

## Criterios de Aceptacion

- [x] Layout consistente en todas las paginas del dashboard
- [x] Sidebar muestra solo modulos habilitados para el usuario
- [x] SuperAdmin ve todos los modulos
- [x] Header con informacion del usuario y menu desplegable
- [x] Boton de logout funcional que limpia tokens y redirige a login
- [x] Responsive: sidebar colapsable en pantallas pequenas
- [x] Indicador visual del modulo activo en sidebar
- [x] Transiciones suaves al navegar

## Dependencias Tecnicas

- Next.js App Router (route groups)
- Tailwind CSS para estilos
- Lucide React para iconos
- Server Components para carga de permisos
- `getServerPermissions()` de `lib/permissions.server.ts`

## Notas

- El layout usa route groups de Next.js: `(dashboard)` para rutas protegidas
- La validacion de permisos es server-side para mejor seguridad
- El middleware protege las rutas y redirige a login si no autenticado
- Los items de navegacion tienen soporte para submenus (children)
- El logout usa server action para limpiar cookies HttpOnly correctamente
