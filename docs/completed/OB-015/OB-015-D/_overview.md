# OB-015-D: Responsive design y sidebar colapsable

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-015 - Layout Principal y Navegacion con Permisos |
| Status | done |
| Priority | medium |
| Created | 2026-01-06 |
| Completed | 2026-01-06 |
| Labels | story, frontend, responsive, mobile |
| Depends on | OB-015-A, OB-015-B |

## User Story

**Como** usuario
**Quiero** poder usar la aplicacion desde dispositivos moviles
**Para** acceder a la informacion desde cualquier lugar

## Descripcion

Implementar comportamiento responsive del layout:
- En desktop: sidebar visible y fijo
- En mobile: sidebar como drawer/overlay que se abre con hamburger menu

## Implementacion

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `components/layout/DashboardShell.tsx` | Estado isSidebarOpen para controlar drawer mobile |
| `components/layout/Sidebar.tsx` | Transiciones CSS y overlay para mobile |
| `components/layout/Header.tsx` | Boton hamburger (lg:hidden) para abrir sidebar |

### Comportamiento Responsive

```typescript
// DashboardShell.tsx
export function DashboardShell({ children, user, navItems, isSuperAdmin }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        navItems={navItems}
        isSuperAdmin={isSuperAdmin}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:pl-64">  {/* Padding solo en desktop */}
        <Header
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
```

### Sidebar Responsive

```typescript
// Sidebar.tsx
<>
  {/* Mobile overlay - solo visible cuando isOpen y en mobile */}
  {isOpen && (
    <div
      className="fixed inset-0 bg-black/50 z-40 lg:hidden"
      onClick={onClose}
    />
  )}

  {/* Sidebar con transicion */}
  <aside
    className={`
      fixed top-0 left-0 z-50 h-full w-64 bg-white border-r
      transform transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:z-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}
  >
    {/* ... contenido */}
  </aside>
</>
```

## Criterios de Aceptacion

- [x] Desktop (>1024px): Sidebar fijo expandido (w-64)
- [x] Mobile (<1024px): Sidebar oculto, hamburger menu en header
- [x] Animaciones suaves al abrir/cerrar sidebar (duration-300)
- [x] Click fuera del drawer lo cierra en mobile (overlay onClick)
- [x] Boton X en sidebar para cerrar en mobile

## Breakpoints Implementados

| Breakpoint | Comportamiento |
|------------|----------------|
| `lg:` (>=1024px) | Sidebar fijo, siempre visible |
| `<lg` (<1024px) | Sidebar como drawer, hamburger en header |

## Diseno Mobile Implementado

```
┌──────────────────────────┐
│  ☰  [OB]        🔔  👤   │  <- Header con hamburger (lg:hidden)
├──────────────────────────┤
│                          │
│      MAIN CONTENT        │
│                          │
└──────────────────────────┘

       Click ☰
          ↓

┌──────────────────────────┐
│  ✕  [OB]        🔔  👤   │
├──────────────────────────┤
│ ┌──────────┐ ▓▓▓▓▓▓▓▓▓▓▓ │
│ │ Sidebar  │ ▓ overlay ▓ │
│ │ - Inicio │ ▓▓▓▓▓▓▓▓▓▓▓ │
│ │ - Mods   │ ▓▓▓▓▓▓▓▓▓▓▓ │
│ │          │ ▓▓▓▓▓▓▓▓▓▓▓ │
│ │ [Logout] │ ▓▓▓▓▓▓▓▓▓▓▓ │
│ └──────────┘ ▓▓▓▓▓▓▓▓▓▓▓ │
└──────────────────────────┘
```

## Diseno Desktop Implementado

```
┌─────────────────────────────────────────────────────────────┐
│  [OB] OpenBook                            🔔  Usuario ▼     │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────────────────────────────────┐   │
│ │  [OB]      │ │  Breadcrumbs                           │   │
│ │  OpenBook  │ ├────────────────────────────────────────┤   │
│ │            │ │                                        │   │
│ │  - Inicio  │ │         MAIN CONTENT                   │   │
│ │  - Mods    │ │                                        │   │
│ │  - ...     │ │                                        │   │
│ │            │ │                                        │   │
│ │ [Logout]   │ │                                        │   │
│ └────────────┘ └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Notas

- La funcionalidad de sidebar colapsable para tablet (iconos only) no se implemento en esta version
- Se priorizo el comportamiento mobile/desktop que es el mas comun
- El estado del sidebar mobile no se persiste (siempre cerrado al recargar)
