# OB-015-C: Funcionalidad de logout

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-015 - Layout Principal y Navegacion con Permisos |
| Status | done |
| Priority | high |
| Created | 2026-01-06 |
| Completed | 2026-01-06 |
| Labels | story, frontend, auth, logout |
| Depends on | OB-015-A |

## User Story

**Como** usuario autenticado
**Quiero** poder cerrar mi sesion de forma segura
**Para** proteger mi cuenta cuando termine de usar la aplicacion

## Descripcion

Implementar la funcionalidad completa de logout que:
1. Elimina los tokens del cliente (cookies)
2. Redirige al usuario a la pagina de login

## Implementacion

### Archivos Creados

| Archivo | Descripcion |
|---------|-------------|
| `lib/auth.actions.ts` | Server action logout() que elimina cookies |
| `components/layout/LogoutButton.tsx` | Componente de boton con variantes (header/sidebar) |
| `components/layout/Header.tsx` | Integrado LogoutButton en dropdown del usuario |
| `components/layout/Sidebar.tsx` | Integrado LogoutButton en parte inferior |

### Server Action

```typescript
// lib/auth.actions.ts
'use server';

export async function logout(): Promise<ActionResult<null>> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    return { success: true, data: null };
  } catch {
    return { success: false, error: 'Error al cerrar sesión' };
  }
}
```

### LogoutButton Component

```typescript
// components/layout/LogoutButton.tsx
'use client';

export function LogoutButton({ variant = 'default' }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const result = await logout();
    if (result.success) {
      router.push('/login');
      router.refresh();
    }
    setIsLoading(false);
  };

  // Renderiza con estilos segun variant: 'default' o 'sidebar'
}
```

## Criterios de Aceptacion

- [x] Boton de logout visible en el menu de usuario (header)
- [x] Boton de logout visible en el sidebar (parte inferior)
- [x] Al hacer logout se eliminan las cookies (access_token, refresh_token)
- [x] Redireccion automatica a /login despues del logout
- [x] Confirmacion visual durante el proceso de logout (texto "Cerrando...")

## Flujo de Logout Implementado

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGOUT FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario hace click en "Cerrar sesion"                   │
│     (Header dropdown o Sidebar button)                      │
│                                                              │
│  2. LogoutButton llama a logout() server action             │
│     └─> Muestra "Cerrando..." (isLoading)                   │
│                                                              │
│  3. Server Action: logout()                                  │
│     ├─> Elimina cookie access_token                         │
│     └─> Elimina cookie refresh_token                        │
│                                                              │
│  4. Client-side redirect:                                   │
│     ├─> router.push('/login')                               │
│     └─> router.refresh()                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Ubicaciones del Boton Logout

### Header (User Dropdown)
```
┌────────────────────────┐
│  Admin Test            │
│  admin@test.com        │
│  [SuperAdmin]          │
├────────────────────────┤
│  👤 Mi Perfil          │
│  🚪 Cerrar Sesion      │  <-- LogoutButton variant="default"
└────────────────────────┘
```

### Sidebar (Bottom)
```
┌────────────────────────┐
│  - Inicio              │
│  - Objetivos           │
│  - ...                 │
├────────────────────────┤
│  🚪 Cerrar Sesion      │  <-- LogoutButton variant="sidebar"
└────────────────────────┘
```
