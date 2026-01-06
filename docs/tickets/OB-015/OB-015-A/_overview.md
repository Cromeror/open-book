# OB-015-A: Layout principal con header y sidebar

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-015 - Layout Principal y Navegacion con Permisos |
| Status | done |
| Priority | high |
| Created | 2026-01-06 |
| Completed | 2026-01-06 |
| Labels | story, frontend, layout |
| Depends on | OB-014-E |

## User Story

**Como** usuario autenticado
**Quiero** un layout consistente con header y sidebar
**Para** navegar facilmente por las diferentes secciones de la aplicacion

## Descripcion

Implementar la estructura base del layout para usuarios autenticados usando route groups de Next.js. El layout incluye un header fijo con informacion del usuario y un sidebar lateral para navegacion.

## Implementacion

### Archivos Creados

| Archivo | Descripcion |
|---------|-------------|
| `app/(dashboard)/layout.tsx` | Layout principal que carga permisos y renderiza DashboardShell |
| `app/(dashboard)/dashboard/page.tsx` | Pagina home del dashboard con cards segun permisos |
| `components/layout/DashboardShell.tsx` | Client Component que combina Sidebar + Header |
| `components/layout/Header.tsx` | Header con logo, notificaciones y user menu |
| `components/layout/Sidebar.tsx` | Sidebar con navegacion y logout |

### Codigo Clave

```typescript
// app/(dashboard)/layout.tsx
export default async function DashboardLayout({ children }) {
  const permissions = await getServerPermissions();

  if (!permissions.isAuthenticated) {
    redirect('/login');
  }

  const navItems = filterNavItems(permissions);
  const user = getUserForHeader(permissions);

  return (
    <DashboardShell
      user={user}
      navItems={navItems}
      isSuperAdmin={permissions.isSuperAdmin}
    >
      {children}
    </DashboardShell>
  );
}
```

## Criterios de Aceptacion

- [x] Route group `(dashboard)` creado con layout propio
- [x] Header muestra logo y nombre del usuario
- [x] Sidebar con estructura base
- [x] Layout ocupa toda la pantalla con sidebar fijo a la izquierda
- [x] Content area con scroll independiente
- [x] Estilos con Tailwind CSS

## Diseno Implementado

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (h-16, sticky top)                                  │
│  ┌─────────────────┐                    ┌────────────────┐  │
│  │  ☰ OpenBook     │                    │ 🔔  Usuario ▼  │  │
│  └─────────────────┘                    └────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────────────────────────────────┐   │
│ │  SIDEBAR   │ │  Breadcrumbs                           │   │
│ │  (w-64)    │ ├────────────────────────────────────────┤   │
│ │            │ │                                        │   │
│ │  - Inicio  │ │         MAIN CONTENT                   │   │
│ │  - Modulos │ │         (p-4 md:p-6)                   │   │
│ │  - ...     │ │                                        │   │
│ │            │ │                                        │   │
│ │ [Logout]   │ │                                        │   │
│ └────────────┘ └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```
