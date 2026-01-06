# OB-015-C: Funcionalidad de logout

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-015 - Layout Principal y Navegacion con Permisos |
| Status | pending |
| Priority | high |
| Created | 2026-01-06 |
| Labels | story, frontend, auth, logout |
| Depends on | OB-015-A |

## User Story

**Como** usuario autenticado
**Quiero** poder cerrar mi sesion de forma segura
**Para** proteger mi cuenta cuando termine de usar la aplicacion

## Descripcion

Implementar la funcionalidad completa de logout que:
1. Elimina los tokens del cliente (cookies)
2. Invalida el refresh token en el backend
3. Redirige al usuario a la pagina de login
4. Limpia cualquier cache de permisos

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-015-C-001](./OB-015-C-001.md) | Implementar server action de logout | pending |
| [OB-015-C-002](./OB-015-C-002.md) | Crear componente UserMenu con opcion logout | pending |
| [OB-015-C-003](./OB-015-C-003.md) | Agregar boton logout en sidebar | pending |

## Criterios de Aceptacion

- [ ] Boton de logout visible en el menu de usuario (header)
- [ ] Boton de logout visible en el sidebar (parte inferior)
- [ ] Al hacer logout se eliminan las cookies (access_token, refresh_token)
- [ ] Se llama al endpoint POST /api/auth/logout para invalidar refresh token
- [ ] Redireccion automatica a /login despues del logout
- [ ] Confirmacion visual durante el proceso de logout

## Flujo de Logout

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGOUT FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario hace click en "Cerrar sesion"                   │
│                                                              │
│  2. Server Action: logout()                                  │
│     ├─> Obtiene refresh_token de cookies                    │
│     ├─> POST /api/auth/logout (invalida token en backend)   │
│     ├─> Elimina cookie access_token                         │
│     └─> Elimina cookie refresh_token                        │
│                                                              │
│  3. Redireccion a /login                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Componentes

### UserMenu (Header)

```typescript
// Dropdown menu en el header
<UserMenu>
  <UserMenuTrigger>
    {user.firstName} ▼
  </UserMenuTrigger>
  <UserMenuContent>
    <UserMenuItem href="/dashboard/perfil">Mi Perfil</UserMenuItem>
    <UserMenuSeparator />
    <UserMenuItem onClick={logout}>
      <LogOut className="h-4 w-4 mr-2" />
      Cerrar sesion
    </UserMenuItem>
  </UserMenuContent>
</UserMenu>
```

### Sidebar Logout Button

```typescript
// En la parte inferior del sidebar
<div className="mt-auto border-t pt-4">
  <LogoutButton />
</div>
```

## Server Action

```typescript
// lib/auth.actions.ts
'use server';

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const accessToken = cookieStore.get('access_token')?.value;

  // Invalidar token en backend (opcional, falla silenciosamente)
  if (refreshToken && accessToken) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignorar errores del backend
    }
  }

  // Eliminar cookies
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');

  // Redirigir a login
  redirect('/login');
}
```

## Archivos a Crear/Modificar

```
apps/web/src/
├── lib/
│   └── auth.actions.ts         # Agregar/mejorar logout action
├── components/
│   └── layout/
│       ├── UserMenu.tsx        # Menu de usuario en header
│       └── LogoutButton.tsx    # Boton de logout para sidebar
```
