# OB-015-D: Responsive design y sidebar colapsable

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-015 - Layout Principal y Navegacion con Permisos |
| Status | pending |
| Priority | medium |
| Created | 2026-01-06 |
| Labels | story, frontend, responsive, mobile |
| Depends on | OB-015-A, OB-015-B |

## User Story

**Como** usuario
**Quiero** poder usar la aplicacion desde dispositivos moviles
**Para** acceder a la informacion desde cualquier lugar

## Descripcion

Implementar comportamiento responsive del layout:
- En desktop: sidebar visible y fijo
- En tablet: sidebar colapsable con boton toggle
- En mobile: sidebar como drawer/overlay que se abre con hamburger menu

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-015-D-001](./OB-015-D-001.md) | Implementar sidebar colapsable para tablet | pending |
| [OB-015-D-002](./OB-015-D-002.md) | Crear MobileNav con drawer/sheet | pending |
| [OB-015-D-003](./OB-015-D-003.md) | Agregar boton hamburger en header mobile | pending |
| [OB-015-D-004](./OB-015-D-004.md) | Ajustar breakpoints y transiciones | pending |

## Criterios de Aceptacion

- [ ] Desktop (>1024px): Sidebar fijo expandido (w-64)
- [ ] Tablet (768-1024px): Sidebar colapsable (w-16 colapsado, w-64 expandido)
- [ ] Mobile (<768px): Sidebar oculto, hamburger menu en header
- [ ] Animaciones suaves al abrir/cerrar sidebar
- [ ] Click fuera del drawer lo cierra en mobile
- [ ] Estado del sidebar persistido en localStorage (tablet)

## Breakpoints

| Breakpoint | Comportamiento |
|------------|----------------|
| `lg:` (>1024px) | Sidebar fijo expandido |
| `md:` (768-1024px) | Sidebar colapsable |
| `sm:` (<768px) | Drawer/overlay |

## Diseno Mobile

```
┌──────────────────────────┐
│  ☰  OpenBook      👤     │  <- Header con hamburger
├──────────────────────────┤
│                          │
│                          │
│      MAIN CONTENT        │
│                          │
│                          │
└──────────────────────────┘

       Click ☰
          ↓

┌──────────────────────────┐
│  ✕  OpenBook      👤     │
├──────────────────────────┤
│ ┌──────────┐             │
│ │ Sidebar  │  (overlay)  │
│ │ - Home   │             │
│ │ - Mod 1  │             │
│ │ - Mod 2  │             │
│ │          │             │
│ │ [Logout] │             │
│ └──────────┘             │
└──────────────────────────┘
```

## Diseno Tablet (Colapsado)

```
┌─────────────────────────────────────────┐
│  ◀  OpenBook                    👤      │
├─────────────────────────────────────────┤
│ ┌────┐ ┌────────────────────────────┐   │
│ │ 🏠 │ │                            │   │
│ │ 🎯 │ │      MAIN CONTENT          │   │
│ │ 📅 │ │                            │   │
│ │ 💰 │ │                            │   │
│ │ ⚙️ │ │                            │   │
│ └────┘ └────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Implementacion

### Estado del Sidebar

```typescript
// hooks/useSidebar.ts
'use client';

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Persistir estado en localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-open');
    if (stored !== null) {
      setIsOpen(JSON.parse(stored));
    }
  }, []);

  const toggle = () => {
    setIsOpen(prev => {
      localStorage.setItem('sidebar-open', JSON.stringify(!prev));
      return !prev;
    });
  };

  return { isOpen, isMobileOpen, toggle, setIsMobileOpen };
}
```

### MobileNav Component

```typescript
// components/layout/MobileNav.tsx
'use client';

export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden">
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform lg:hidden",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        {children}
      </div>
    </>
  );
}
```

## Archivos a Crear/Modificar

```
apps/web/src/
├── hooks/
│   └── useSidebar.ts           # Hook para estado del sidebar
├── components/
│   └── layout/
│       ├── MobileNav.tsx       # Drawer para mobile
│       ├── SidebarToggle.tsx   # Boton para colapsar
│       └── Sidebar.tsx         # Modificar para responsive
```
