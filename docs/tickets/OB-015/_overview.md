# OB-015: Layout Principal y Navegacion con Permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Type | Epic |
| Status | pending |
| Priority | high |
| Created | 2026-01-06 |
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
| [OB-015-A](./OB-015-A/_overview.md) | Layout principal con header y sidebar | pending | high |
| [OB-015-B](./OB-015-B/_overview.md) | Sidemenu dinamico con modulos por permisos | pending | high |
| [OB-015-C](./OB-015-C/_overview.md) | Funcionalidad de logout | pending | high |
| [OB-015-D](./OB-015-D/_overview.md) | Responsive design y sidebar colapsable | pending | medium |

## Arquitectura

### Estructura de Carpetas

```
apps/web/src/
├── app/
│   ├── (public)/              # Rutas publicas (login, registro, landing)
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Landing page
│   │   ├── login/
│   │   └── registro/
│   └── (dashboard)/           # Rutas protegidas con layout comun
│       ├── layout.tsx         # DashboardLayout con sidebar
│       ├── page.tsx           # Dashboard home
│       ├── objetivos/
│       ├── aportes/
│       ├── usuarios/
│       └── configuracion/
├── components/
│   └── layout/
│       ├── DashboardLayout.tsx
│       ├── Sidebar.tsx
│       ├── SidebarNav.tsx
│       ├── SidebarItem.tsx
│       ├── Header.tsx
│       ├── UserMenu.tsx
│       └── MobileNav.tsx
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
// El sidebar se renderiza server-side usando getServerPermissions()
// Solo muestra modulos a los que el usuario tiene acceso

const { modules, user } = await getServerPermissions();

// SuperAdmin ve todos los modulos
const visibleModules = user.isSuperAdmin
  ? ALL_MODULES
  : modules;

// Renderizar items del sidebar
{visibleModules.map(module => (
  <SidebarItem key={module} module={module} />
))}
```

## Modulos del Sistema

| Codigo | Icono | Label | Ruta |
|--------|-------|-------|------|
| `dashboard` | Home | Inicio | /dashboard |
| `objetivos` | Target | Objetivos | /dashboard/objetivos |
| `actividades` | Calendar | Actividades | /dashboard/actividades |
| `compromisos` | FileCheck | Compromisos | /dashboard/compromisos |
| `aportes` | DollarSign | Aportes | /dashboard/aportes |
| `usuarios` | Users | Usuarios | /dashboard/usuarios |
| `copropiedades` | Building2 | Copropiedades | /dashboard/copropiedades |
| `apartamentos` | Home | Apartamentos | /dashboard/apartamentos |
| `pqr` | MessageSquare | PQR | /dashboard/pqr |
| `reportes` | BarChart3 | Reportes | /dashboard/reportes |
| `auditoria` | Shield | Auditoria | /dashboard/auditoria |
| `configuracion` | Settings | Configuracion | /dashboard/configuracion |

## Criterios de Aceptacion Generales

- [ ] Layout consistente en todas las paginas del dashboard
- [ ] Sidebar muestra solo modulos habilitados para el usuario
- [ ] SuperAdmin ve todos los modulos
- [ ] Header con informacion del usuario y menu desplegable
- [ ] Boton de logout funcional que limpia tokens y redirige a login
- [ ] Responsive: sidebar colapsable en pantallas pequenas
- [ ] Indicador visual del modulo activo en sidebar
- [ ] Transiciones suaves al navegar

## Dependencias Tecnicas

- Next.js App Router (route groups)
- Tailwind CSS para estilos
- Lucide React para iconos
- Server Components para carga de permisos
- `getServerPermissions()` de `lib/permissions.server.ts`

## Notas

- El layout usa route groups de Next.js: `(public)` y `(dashboard)`
- La validacion de permisos es server-side para mejor seguridad
- El middleware ya protege las rutas `/dashboard/*`
- Usar Server Components donde sea posible para mejor performance
