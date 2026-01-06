# OB-014: Configuracion de Vistas por Permisos y Modulos

## Metadata

| Campo | Valor |
|-------|-------|
| Status | pending |
| Priority | high |
| Created | 2026-01-05 |
| Updated | 2026-01-05 |
| Labels | epic, frontend, permisos, ui, modulos |
| Depends on | OB-002 |

## Descripcion

Esta epica implementa la logica de renderizado condicional en el frontend (Next.js) para mostrar diferentes vistas segun los permisos del usuario autenticado. No existen roles predefinidos - la interfaz se adapta dinamicamente segun los modulos y permisos granulares asignados a cada usuario.

## Objetivo

1. Configurar la aplicacion web para presentar la interfaz apropiada segun los permisos del usuario
2. Implementar verificacion de permisos basada en modulos (acceso al modulo + permiso granular)
3. Sincronizar permisos entre frontend y backend
4. Garantizar una experiencia de usuario optima con acceso controlado

## Alcance

### Incluido
- Sistema de rutas protegidas por permisos
- Sistema de permisos basado en modulos (sincronizado con backend)
- Permisos granulares por accion (create, read, update, delete)
- Scopes de permisos (own, copropiedad, all)
- Hook usePermissions para verificacion declarativa
- Componentes de renderizado condicional basados en permisos
- Layout dinamico basado en modulos accesibles
- Navegacion dinamica segun permisos
- Componente de contexto de autenticacion
- Guards de ruta en Next.js
- Pagina de acceso denegado
- Redireccion automatica segun permisos post-login

### Excluido
- Roles predefinidos (admin/resident) - reemplazados por permisos
- Implementacion de funcionalidades especificas (otras epicas)
- Backend de autenticacion (cubierto en OB-002)
- Dashboard de metricas (cubierto en OB-008)

## Estructura

### Stories
- [OB-014-A](./OB-014-A/) - Contexto de autenticacion y proteccion de rutas
- [OB-014-B](./OB-014-B/) - Layout dinamico basado en permisos
- [OB-014-C](./OB-014-C/) - Navegacion adaptativa por modulos
- [OB-014-D](./OB-014-D/) - Componentes compartidos y utilidades de permisos

## Sistema de Permisos por Modulos

### Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Usuario se autentica                                 │
│     └─> JWT contiene: userId, isSuperAdmin               │
│                                                          │
│  2. Frontend solicita permisos efectivos                 │
│     └─> GET /api/auth/me (o /api/permissions/me)        │
│     └─> Respuesta:                                       │
│         {                                                │
│           modules: ['objetivos', 'aportes', 'pqr'],     │
│           permissions: [                                 │
│             { module: 'objetivos', action: 'read', scope: 'copropiedad', scopeId: '...' },
│             { module: 'objetivos', action: 'create', scope: 'copropiedad', scopeId: '...' },
│             { module: 'aportes', action: 'read', scope: 'own' },
│           ]                                              │
│         }                                                │
│                                                          │
│  3. usePermissions() verifica acceso                     │
│     └─> hasModule('objetivos') // true                   │
│     └─> can('objetivos:create', { copropiedadId }) // true
│                                                          │
│  4. UI se renderiza segun permisos                       │
│     └─> Menu muestra solo modulos accesibles            │
│     └─> Botones se muestran segun permisos granulares   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Verificacion

```
1. ¿Es SuperAdmin? → SI: Mostrar todo
2. ¿Tiene acceso al MODULO? → NO: No mostrar seccion
3. ¿Tiene permiso GRANULAR? → NO: No mostrar accion
4. ¿Scope permite acceso? → NO: Filtrar datos
5. Mostrar elemento
```

### API de Permisos en Frontend

```typescript
// types/permissions.ts
export interface UserPermissions {
  isSuperAdmin: boolean;
  modules: string[];  // ['objetivos', 'aportes', 'pqr']
  permissions: {
    module: string;
    action: string;
    scope: 'own' | 'copropiedad' | 'all';
    scopeId?: string;
  }[];
}

// hooks/usePermissions.ts
const {
  isSuperAdmin,
  hasModule,
  can,
  canAny,
  canAll,
  getModules,
  getPermissions,
} = usePermissions();

// Verificar acceso a modulo
if (hasModule('objetivos')) {
  // Usuario tiene acceso al modulo objetivos
}

// Verificar permiso granular
if (can('objetivos:create', { copropiedadId })) {
  // Usuario puede crear objetivos en esa copropiedad
}

// Verificar multiples permisos
if (canAny(['objetivos:read', 'aportes:read'])) {
  // Usuario puede ver objetivos O aportes
}

// Componente de renderizado condicional
<ShowForModule module="objetivos">
  <ObjetivosSection />
</ShowForModule>

<ShowForPermission permission="objetivos:create" context={{ copropiedadId }}>
  <Button>Crear Objetivo</Button>
</ShowForPermission>

// Renderizado condicional por SuperAdmin
<ShowForSuperAdmin>
  <AdminPanel />
</ShowForSuperAdmin>
```

## Modulos del Sistema

| Modulo | Descripcion | Permisos Disponibles |
|--------|-------------|---------------------|
| `users` | Gestion de usuarios | read, update |
| `copropiedades` | Copropiedades | read, update |
| `apartamentos` | Apartamentos | create, read, update, delete |
| `objetivos` | Objetivos de recaudo | create, read, update, delete |
| `actividades` | Actividades de recaudo | create, read, update, delete |
| `compromisos` | Compromisos | create, read, update |
| `aportes` | Aportes reales | create, read, update |
| `pqr` | PQR | create, read, manage |
| `reportes` | Reportes | read, export |
| `auditoria` | Auditoria | read |
| `notificaciones` | Notificaciones | read, create |
| `configuracion` | Configuracion | read, update |

## Criterios de Aceptacion Globales

- [ ] SuperAdmin ve todo el sistema sin restricciones
- [ ] Usuarios ven solo modulos asignados
- [ ] Acciones se muestran solo si tiene permiso granular
- [ ] Rutas protegidas redirigen a login si no hay sesion
- [ ] Rutas sin permiso redirigen a /acceso-denegado
- [ ] El contexto de auth esta disponible en toda la aplicacion
- [ ] La navegacion refleja los modulos accesibles del usuario
- [ ] Post-login redirige a primera ruta accesible
- [ ] Hook usePermissions disponible globalmente
- [ ] Componentes ShowForModule/ShowForPermission funcionan
- [ ] Permisos sincronizados con backend via /api/auth/me

## Arquitectura Propuesta

```
apps/web/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx          # Contexto de autenticacion y permisos
│   ├── hooks/
│   │   ├── useAuth.ts               # Hook de autenticacion
│   │   └── usePermissions.ts        # Hook de permisos por modulos
│   ├── components/
│   │   ├── guards/
│   │   │   ├── AuthGuard.tsx        # Protege rutas autenticadas
│   │   │   ├── ModuleGuard.tsx      # Protege rutas por modulo
│   │   │   └── PermissionGuard.tsx  # Protege rutas por permiso
│   │   ├── permissions/
│   │   │   ├── ShowForSuperAdmin.tsx
│   │   │   ├── ShowForModule.tsx
│   │   │   ├── ShowForPermission.tsx
│   │   │   └── index.ts
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.tsx  # Layout con menu dinamico
│   │   │   └── PublicLayout.tsx     # Layout publico
│   │   └── navigation/
│   │       └── DynamicNav.tsx       # Menu basado en modulos accesibles
│   ├── app/
│   │   ├── (public)/                # Rutas publicas
│   │   │   ├── login/
│   │   │   └── registro/
│   │   ├── (dashboard)/             # Rutas protegidas
│   │   │   ├── layout.tsx           # DashboardLayout
│   │   │   ├── page.tsx             # Redirect a primera ruta accesible
│   │   │   ├── usuarios/            # Requiere modulo: users
│   │   │   ├── copropiedades/       # Requiere modulo: copropiedades
│   │   │   ├── objetivos/           # Requiere modulo: objetivos
│   │   │   ├── aportes/             # Requiere modulo: aportes
│   │   │   ├── pqr/                 # Requiere modulo: pqr
│   │   │   ├── reportes/            # Requiere modulo: reportes
│   │   │   └── configuracion/       # Requiere modulo: configuracion
│   │   ├── (superadmin)/            # Rutas solo SuperAdmin
│   │   │   ├── layout.tsx
│   │   │   ├── admin/pools/         # Gestion de pools
│   │   │   └── admin/permisos/      # Gestion de permisos
│   │   └── acceso-denegado/
│   ├── lib/
│   │   ├── permissions.ts           # Utilidades de permisos
│   │   └── routes.ts                # Config de rutas con modulos requeridos
│   └── types/
│       └── permissions.ts           # Tipos de permisos
```

## Flujo de Autenticacion y Permisos

```
1. Usuario accede a ruta protegida
   │
   ├─> No autenticado ──> Redirect a /login
   │
   └─> Autenticado
       │
       ├─> Es SuperAdmin ──> Acceso total
       │
       └─> Usuario regular
           │
           ├─> Verificar acceso al modulo
           │   └─> Sin acceso ──> /acceso-denegado
           │
           └─> Verificar permisos para acciones
               ├─> Sin permiso ──> Ocultar/deshabilitar
               └─> Con permiso ──> Mostrar
```

## Dependencias

- **Depende de**: OB-002 (sistema de autenticacion y permisos)
- **Bloquea a**: Ninguna (habilita desarrollo paralelo de features)

## Notas Tecnicas

- Usar Next.js App Router con Route Groups
- Implementar middleware de Next.js para proteccion de rutas
- El JWT contiene userId y isSuperAdmin flag
- Permisos efectivos se cargan via GET /api/auth/me
- Usar React Context para estado de autenticacion y permisos
- Considerar SSR: verificar auth en servidor cuando sea posible
- El backend valida permisos en cada request (defense in depth)
- El frontend solo oculta UI, la seguridad real esta en backend
- Menu se genera dinamicamente segun modulos accesibles
- Sin roles predefinidos - todo basado en permisos

## Referencias

- SUMMARY.md - Seccion 7: Funcionalidades
- OB-002-C - Sistema de permisos por modulos
- Next.js App Router documentation
