# OB-015-A: Layout principal con header y sidebar

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-015 - Layout Principal y Navegacion con Permisos |
| Status | pending |
| Priority | high |
| Created | 2026-01-06 |
| Labels | story, frontend, layout |
| Depends on | OB-014-E |

## User Story

**Como** usuario autenticado
**Quiero** un layout consistente con header y sidebar
**Para** navegar facilmente por las diferentes secciones de la aplicacion

## Descripcion

Implementar la estructura base del layout para usuarios autenticados usando route groups de Next.js. El layout incluye un header fijo con informacion del usuario y un sidebar lateral para navegacion.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-015-A-001](./OB-015-A-001.md) | Crear route group (dashboard) con layout base | pending |
| [OB-015-A-002](./OB-015-A-002.md) | Implementar componente Header | pending |
| [OB-015-A-003](./OB-015-A-003.md) | Implementar componente Sidebar base | pending |
| [OB-015-A-004](./OB-015-A-004.md) | Crear pagina de dashboard home | pending |

## Criterios de Aceptacion

- [ ] Route group `(dashboard)` creado con layout propio
- [ ] Header muestra logo y nombre del usuario
- [ ] Sidebar con estructura base (sin modulos dinamicos aun)
- [ ] Layout ocupa toda la pantalla con sidebar fijo a la izquierda
- [ ] Content area con scroll independiente
- [ ] Estilos con Tailwind CSS

## Diseno

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (h-16, fixed top)                                   │
│  ┌─────────────────┐                    ┌────────────────┐  │
│  │  OpenBook       │                    │  Usuario ▼     │  │
│  └─────────────────┘                    └────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────────────────────────────────┐   │
│ │            │ │                                        │   │
│ │  SIDEBAR   │ │         MAIN CONTENT                   │   │
│ │  (w-64)    │ │         (flex-1, overflow-auto)        │   │
│ │            │ │                                        │   │
│ │            │ │                                        │   │
│ │            │ │                                        │   │
│ └────────────┘ └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Archivos a Crear

```
apps/web/src/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx          # DashboardLayout
│       └── page.tsx            # Dashboard home
├── components/
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── index.ts
```
