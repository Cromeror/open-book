# OB-014-A: Autenticacion Server-Side y Proteccion de Rutas

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Permisos y Modulos |
| Status | done |
| Priority | critical |
| Created | 2026-01-05 |
| Updated | 2026-01-06 |
| Labels | story, frontend, auth, server-first, middleware, permisos |
| Depends on | OB-002-B, OB-002-C |

## User Story

**Como** usuario de la aplicacion
**Quiero** que mi sesion y permisos se verifiquen en el servidor
**Para** garantizar que solo puedo acceder a las funcionalidades autorizadas de forma segura

## Descripcion

Esta story implementa el sistema de autenticacion y permisos con enfoque **Server-First**. La verificacion de permisos se realiza en el servidor (middleware, Server Components, Server Actions), minimizando la exposicion de datos sensibles al cliente.

**Principios Server-First:**
- Middleware verifica autenticacion basica (JWT valido)
- Server Components cargan y verifican permisos
- Server Actions verifican permisos antes de ejecutar
- Client Components solo reciben datos pre-autorizados

**IMPORTANTE**: No existen roles predefinidos (admin/resident). El sistema usa permisos granulares por modulos.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-014-A-001](./OB-014-A-001.md) | Implementar middleware de autenticacion | done |
| [OB-014-A-002](./OB-014-A-002.md) | Crear utilidades de permisos server-side | done |
| [OB-014-A-003](./OB-014-A-003.md) | Implementar Server Actions protegidas | done |
| [OB-014-A-004](./OB-014-A-004.md) | Crear componentes de permisos (server y client) | done |
| [OB-014-A-005](./OB-014-A-005.md) | Crear pagina de acceso denegado | done |

## Arquitectura Server-First

### Capas de Verificacion

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE REQUEST                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. MIDDLEWARE (Edge Runtime)                                │
│     ├─> Verifica JWT existe y es valido                     │
│     ├─> Redirige a /login si no autenticado                 │
│     └─> Verifica isSuperAdmin para rutas /admin/*           │
│                                                              │
│  2. SERVER COMPONENT (Node Runtime)                          │
│     ├─> Carga permisos via getServerPermissions()           │
│     ├─> Verifica acceso al modulo requerido                 │
│     ├─> redirect() si no tiene acceso                       │
│     └─> Renderiza UI con datos pre-filtrados                │
│                                                              │
│  3. SERVER ACTION (Node Runtime)                             │
│     ├─> Verifica permisos antes de ejecutar                 │
│     ├─> Valida scope (copropiedad, own)                     │
│     └─> Ejecuta operacion de forma segura                   │
│                                                              │
│  4. CLIENT COMPONENT (Browser)                               │
│     ├─> Recibe datos ya filtrados del servidor              │
│     ├─> Recibe flags de permisos (canEdit, canDelete)       │
│     └─> Solo maneja interactividad                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Verificacion

```
Request a /objetivos
       │
       ▼
┌─────────────────┐
│   MIDDLEWARE    │
│                 │
│  ¿Tiene JWT?    │──NO──> Redirect /login
│       │         │
│      YES        │
│       │         │
│  ¿JWT valido?   │──NO──> Redirect /login
│       │         │
│      YES        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SERVER LAYOUT   │
│                 │
│  Carga permisos │
│  Renderiza nav  │──> Solo modulos accesibles
│                 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SERVER PAGE    │
│ /objetivos      │
│                 │
│ ¿hasModule      │
│ ('objetivos')? │──NO──> redirect('/acceso-denegado')
│       │         │
│      YES        │
│       │         │
│ Carga datos     │
│ Renderiza UI    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CLIENT COMPONENT│
│                 │
│ Recibe:         │
│ - objetivos[]   │  (ya filtrados)
│ - canUpdate     │  (boolean del server)
│ - canDelete     │  (boolean del server)
└─────────────────┘
```

## Sistema de Permisos

### Permisos Cargados desde Backend

```typescript
// GET /api/auth/me retorna:
interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: string[];  // ['objetivos', 'aportes', 'pqr']
  permissions: {
    module: string;
    action: string;
    scope: 'own' | 'copropiedad' | 'all';
    scopeId?: string;
  }[];
}
```

### API Server-Side

```typescript
// lib/permissions.server.ts (SOLO SERVER)
import { cookies } from 'next/headers';

export async function getServerPermissions() {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return createEmptyPermissions();
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return createEmptyPermissions();
  }

  if (payload.isSuperAdmin) {
    return createSuperAdminPermissions();
  }

  const { modules, permissions } = await fetchUserPermissions(payload.sub);

  return {
    userId: payload.sub,
    isSuperAdmin: false,
    modules,
    permissions,
    hasModule: (module: string) => modules.includes(module),
    can: (permission: string) => { /* ... */ },
    canInScope: (permission: string, scopeId: string) => { /* ... */ },
  };
}

// Uso en Server Component
export default async function ObjetivosPage() {
  const permissions = await getServerPermissions();

  if (!permissions.hasModule('objetivos')) {
    redirect('/acceso-denegado');
  }

  // ... cargar datos y renderizar
}
```

## Criterios de Aceptacion

### Middleware
- [ ] Verifica JWT en todas las rutas protegidas
- [ ] Redirige a /login si no hay token o es invalido
- [ ] Verifica isSuperAdmin para rutas /admin/*
- [ ] Preserva redirect URL en query param

### Server Components
- [ ] getServerPermissions() disponible en todos los Server Components
- [ ] Verificacion de modulo antes de renderizar contenido
- [ ] redirect() a /acceso-denegado si no tiene permiso
- [ ] Datos se cargan solo si tiene permiso

### Server Actions
- [ ] Verifican permisos antes de ejecutar
- [ ] Validan scope (copropiedad, own) segun contexto
- [ ] Retornan error descriptivo si no tiene permiso
- [ ] Usan revalidatePath/revalidateTag para cache

### Seguridad
- [ ] Token JWT se almacena en httpOnly cookie
- [ ] Permisos se verifican en servidor, no en cliente
- [ ] SuperAdmin tiene bypass solo en servidor
- [ ] Datos sensibles nunca expuestos al cliente sin verificar

## Notas Tecnicas

- **Middleware en Edge**: Solo verificacion basica de JWT (no DB access)
- **Server Components**: Cargan permisos y datos
- **cookies() es async en Next.js 15**: Usar `await cookies()`
- **Cache de permisos**: Considerar `unstable_cache` para reducir llamadas
- **No usar Context para permisos**: Props drilling desde Server Components
