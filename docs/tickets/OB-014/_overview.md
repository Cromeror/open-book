# OB-014: Configuracion de Vistas por Permisos y Modulos

## Metadata

| Campo | Valor |
|-------|-------|
| Status | done |
| Priority | high |
| Created | 2026-01-05 |
| Updated | 2026-01-06 |
| Labels | epic, frontend, permisos, ui, modulos, server-first |
| Depends on | OB-002 |

## Descripcion

Esta epica implementa la logica de renderizado condicional en Next.js para mostrar diferentes vistas segun los permisos del usuario autenticado. **Adopta un enfoque "Server-First"** donde la verificacion de permisos se realiza principalmente en el servidor para maximizar la seguridad.

**IMPORTANTE**: No existen roles predefinidos (admin/resident). El sistema usa:
- **SuperAdmin**: Usuario unico con acceso total (flag `isSuperAdmin`)
- **Modulos**: Unidades funcionales del sistema
- **Permisos Granulares**: Acciones dentro de modulos (create, read, update, delete)
- **Scopes**: Alcance del permiso (own, copropiedad, all)

## Principios de Arquitectura Server-First

### Por que Server-First?

1. **Seguridad**: Los permisos se verifican en el servidor donde no pueden ser manipulados
2. **Proteccion de datos**: La informacion sensible nunca llega al cliente si no tiene permiso
3. **SEO y Performance**: Server Components renderizan mas rapido
4. **Simplicidad**: Menos estado del cliente que manejar
5. **Defense in Depth**: Multiples capas de verificacion

### Capas de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPAS DE SEGURIDAD                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. MIDDLEWARE (Edge Runtime)                                │
│     └─> Verifica JWT valido                                  │
│     └─> Redirige a /login si no autenticado                 │
│     └─> Verifica isSuperAdmin para rutas /admin/*           │
│                                                              │
│  2. SERVER COMPONENTS (Node Runtime)                         │
│     └─> Cargan permisos del usuario desde DB                │
│     └─> Verifican acceso a modulos                          │
│     └─> Renderizan UI condicionalmente                      │
│     └─> Datos sensibles NUNCA llegan al cliente             │
│                                                              │
│  3. SERVER ACTIONS (Node Runtime)                            │
│     └─> Verifican permisos antes de ejecutar                │
│     └─> Validan datos de entrada                            │
│     └─> Ejecutan operaciones de forma segura                │
│                                                              │
│  4. API BACKEND (NestJS)                                     │
│     └─> Ultima linea de defensa                             │
│     └─> Verifica permisos en cada endpoint                  │
│     └─> Nunca confia en el cliente                          │
│                                                              │
│  5. CLIENT COMPONENTS (Browser) - Solo UX                    │
│     └─> Oculta botones/elementos para mejor UX              │
│     └─> NO es capa de seguridad                             │
│     └─> Usa permisos pre-cargados del servidor              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Objetivo

1. Implementar verificacion de permisos en el servidor (Server Components)
2. Proteger rutas con middleware de Next.js
3. Usar Server Actions para operaciones sensibles
4. Minimizar exposicion de datos al cliente
5. Proveer UX fluida con componentes cliente cuando sea necesario

## Alcance

### Incluido
- Middleware de Next.js para proteccion de rutas
- Server Components con verificacion de permisos
- Server Actions para operaciones protegidas
- Utilidades de permisos del lado del servidor
- Layout dinamico renderizado en servidor
- Navegacion generada en servidor segun permisos
- Componentes cliente para interactividad (cuando necesario)
- Pagina de acceso denegado

### Excluido
- Roles predefinidos (admin/resident) - reemplazados por permisos
- Verificacion de permisos solo en cliente (inseguro)
- Backend de autenticacion (cubierto en OB-002)

## Estructura

### Stories
- [OB-014-A](./OB-014-A/) - Autenticacion server-side y proteccion de rutas
- [OB-014-B](./OB-014-B/) - Layout dinamico basado en permisos (Server Components)
- [OB-014-C](./OB-014-C/) - Navegacion adaptativa por modulos
- [OB-014-D](./OB-014-D/) - Componentes compartidos y utilidades de permisos
- [OB-014-E](./OB-014-E/) - Integracion completa del sistema de permisos

## Arquitectura Server-First

### Flujo de Request

```
Browser Request
       │
       ▼
┌─────────────────┐
│   MIDDLEWARE    │  ← Verifica JWT, redirige si no auth
│   (Edge)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SERVER LAYOUT   │  ← Carga permisos, renderiza nav
│ (RSC)           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SERVER PAGE    │  ← Verifica modulo, carga datos
│  (RSC)          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CLIENT ISLANDS  │  ← Solo interactividad
│ (hydration)     │
└─────────────────┘
```

### Implementacion Server-First

```typescript
// ============================================
// 1. MIDDLEWARE - Primera capa de defensa
// ============================================
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  // Rutas publicas
  if (isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Sin token -> login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar token
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rutas SuperAdmin
  if (isSuperAdminRoute(request.nextUrl.pathname) && !payload.isSuperAdmin) {
    return NextResponse.redirect(new URL('/acceso-denegado', request.url));
  }

  return NextResponse.next();
}

// ============================================
// 2. SERVER COMPONENT - Verificacion de permisos
// ============================================
// app/(dashboard)/goals/page.tsx
import { redirect } from 'next/navigation';
import { getServerPermissions } from '@/lib/permissions.server';
import { GoalsList } from './goals-list';

export default async function GoalsPage() {
  // Cargar permisos en el servidor
  const permissions = await getServerPermissions();

  // Verificar acceso al modulo
  if (!permissions.hasModule('goals')) {
    redirect('/acceso-denegado');
  }

  // Cargar datos (solo si tiene permiso)
  const goals = await fetchGoals(permissions);

  // Pasar solo los permisos necesarios al cliente
  return (
    <div>
      <h1>Objetivos de Recaudo</h1>

      {/* Server-rendered: boton solo aparece si tiene permiso */}
      {permissions.can('goals:create') && (
        <CreateGoalButton />
      )}

      {/* Client component recibe datos ya filtrados */}
      <GoalsList
        goals={goals}
        canUpdate={permissions.can('goals:update')}
        canDelete={permissions.can('goals:delete')}
      />
    </div>
  );
}

// ============================================
// 3. SERVER ACTIONS - Operaciones protegidas
// ============================================
// app/(dashboard)/goals/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { getServerPermissions } from '@/lib/permissions.server';
import { createGoalInDB } from '@/lib/db';

export async function createGoal(formData: FormData) {
  // Verificar permisos en el servidor
  const permissions = await getServerPermissions();

  if (!permissions.can('goals:create')) {
    throw new Error('No tienes permiso para crear objetivos');
  }

  // Validar datos
  const data = validateGoalData(formData);

  // Verificar scope (copropiedad)
  if (!permissions.canInScope('goals:create', data.propertyId)) {
    throw new Error('No tienes permiso en esta copropiedad');
  }

  // Crear en base de datos
  await createGoalInDB(data);

  // Revalidar cache
  revalidatePath('/goals');
}

// ============================================
// 4. UTILIDADES SERVER-SIDE
// ============================================
// lib/permissions.server.ts
import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { fetchUserPermissions } from './api';

export async function getServerPermissions() {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return createEmptyPermissions();
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return createEmptyPermissions();
  }

  // SuperAdmin tiene acceso total
  if (payload.isSuperAdmin) {
    return createSuperAdminPermissions();
  }

  // Cargar permisos efectivos del usuario
  const { modules, permissions } = await fetchUserPermissions(payload.sub);

  return {
    isSuperAdmin: false,
    modules,
    permissions,

    hasModule: (module: string) => modules.includes(module),

    can: (permission: string) => {
      const [mod, action] = permission.split(':');
      if (!modules.includes(mod)) return false;
      return permissions.some(p => p.module === mod && p.action === action);
    },

    canInScope: (permission: string, scopeId: string) => {
      const [mod, action] = permission.split(':');
      const perm = permissions.find(p => p.module === mod && p.action === action);
      if (!perm) return false;
      if (perm.scope === 'all') return true;
      if (perm.scope === 'copropiedad') return perm.scopeId === scopeId;
      return false;
    },
  };
}

// ============================================
// 5. CLIENT COMPONENT - Solo cuando necesario
// ============================================
// components/goals-list.tsx
'use client';

import { useState } from 'react';

interface Props {
  goals: Goal[];          // Ya filtrados por el servidor
  canUpdate: boolean;     // Pre-calculado en servidor
  canDelete: boolean;     // Pre-calculado en servidor
}

export function GoalsList({ goals, canUpdate, canDelete }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <ul>
      {goals.map(goal => (
        <li key={goal.id} onClick={() => setSelected(goal.id)}>
          {goal.name}

          {/* Permisos ya vienen del servidor */}
          {canUpdate && <EditButton id={goal.id} />}
          {canDelete && <DeleteButton id={goal.id} />}
        </li>
      ))}
    </ul>
  );
}
```

## Modulos del Sistema

| Modulo | Descripcion | Permisos Disponibles |
|--------|-------------|---------------------|
| `users` | Gestion de usuarios | read, update |
| `properties` | Copropiedades | read, update |
| `apartments` | Apartamentos | create, read, update, delete |
| `goals` | Objetivos de recaudo | create, read, update, delete |
| `activities` | Actividades de recaudo | create, read, update, delete |
| `commitments` | Compromisos | create, read, update |
| `contributions` | Aportes reales | create, read, update |
| `pqr` | PQR | create, read, manage |
| `reports` | Reportes | read, export |
| `audit` | Auditoria | read |
| `notifications` | Notificaciones | read, create |
| `settings` | Configuracion | read, update |

## Criterios de Aceptacion Globales

### Seguridad (Server-Side)
- [ ] Middleware verifica autenticacion en todas las rutas protegidas
- [ ] Server Components cargan y verifican permisos
- [ ] Server Actions verifican permisos antes de ejecutar
- [ ] Datos sensibles nunca se envian al cliente sin verificacion
- [ ] SuperAdmin verificado en servidor, no en cliente

### Funcionalidad
- [ ] Usuarios ven solo modulos asignados
- [ ] Acciones se muestran solo si tiene permiso granular
- [ ] Rutas sin permiso redirigen a /acceso-denegado
- [ ] La navegacion refleja los modulos accesibles
- [ ] Post-login redirige a primera ruta accesible

### UX (Client-Side - Solo Mejoras)
- [ ] Transiciones suaves entre paginas
- [ ] Estados de carga apropiados
- [ ] Feedback inmediato en acciones

## Arquitectura de Archivos

```
apps/web/
├── middleware.ts                    # Proteccion de rutas (Edge)
├── src/
│   ├── lib/
│   │   ├── auth.ts                  # Verificacion JWT
│   │   ├── permissions.server.ts    # Utilidades permisos (SERVER ONLY)
│   │   ├── permissions.client.ts    # Utilidades permisos (CLIENT)
│   │   └── api.ts                   # Llamadas al backend
│   ├── app/
│   │   ├── (public)/                # Rutas publicas
│   │   │   ├── login/
│   │   │   │   ├── page.tsx         # Server Component
│   │   │   │   └── login-form.tsx   # Client Component (form)
│   │   │   └── registro/
│   │   ├── (dashboard)/             # Rutas protegidas
│   │   │   ├── layout.tsx           # Server: carga permisos, renderiza nav
│   │   │   ├── page.tsx             # Server: redirect a primera ruta
│   │   │   ├── goals/
│   │   │   │   ├── page.tsx         # Server: verifica modulo, carga datos
│   │   │   │   ├── actions.ts       # Server Actions
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx     # Server: verifica permiso read
│   │   │   │   └── new/
│   │   │   │       └── page.tsx     # Server: verifica permiso create
│   │   │   ├── contributions/
│   │   │   ├── pqr/
│   │   │   └── ...
│   │   ├── (superadmin)/            # Rutas solo SuperAdmin
│   │   │   ├── layout.tsx           # Server: verifica isSuperAdmin
│   │   │   └── admin/
│   │   └── acceso-denegado/
│   │       └── page.tsx
│   ├── components/
│   │   ├── server/                  # Server Components
│   │   │   ├── nav.tsx              # Navegacion (renderizada en server)
│   │   │   └── user-info.tsx
│   │   └── client/                  # Client Components
│   │       ├── forms/
│   │       └── interactive/
│   └── types/
│       └── permissions.ts
```

## Comparacion: Server-First vs Client-First

| Aspecto | Server-First (Adoptado) | Client-First |
|---------|------------------------|--------------|
| Seguridad | Alta - datos nunca expuestos | Baja - todo en cliente |
| Performance | Mejor - menos JS enviado | Peor - mas JS, mas requests |
| SEO | Excelente - contenido renderizado | Pobre - contenido dinamico |
| Complejidad | Moderada | Alta (estado, cache) |
| UX inicial | Rapida - HTML listo | Lenta - loading states |
| Interactividad | Selectiva (islands) | Total |

## Dependencias

- **Depende de**: OB-002 (sistema de autenticacion y permisos)
- **Bloquea a**: Ninguna (habilita desarrollo paralelo de features)

## Notas Tecnicas

- **Server Components por defecto**: Solo usar 'use client' cuando sea necesario
- **Middleware ligero**: Solo verificacion basica de JWT en Edge
- **Server Actions para mutaciones**: Nunca exponer endpoints sensibles al cliente
- **Permisos en servidor**: `getServerPermissions()` es la fuente de verdad
- **Props de permisos**: Pasar booleans (`canEdit`, `canDelete`) a client components
- **No confiar en cliente**: Toda verificacion critica en servidor
- **Cache de Next.js**: Usar `revalidatePath` y `revalidateTag` para invalidacion

## Referencias

- SUMMARY.md - Seccion 7: Funcionalidades
- OB-002-C - Sistema de permisos por modulos
- Next.js App Router - Server Components
- Next.js Server Actions documentation
