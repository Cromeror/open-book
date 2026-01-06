# OB-002-C: Sistema de permisos por modulos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-002 - Gestion de Usuarios y Autenticacion |
| Status | done |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2026-01-05 |
| Labels | story, permisos, modulos, autorizacion, granular |
| Depends on | OB-002-B |

## User Story

**Como** superadmin del sistema
**Quiero** un sistema de permisos basado en modulos con control granular
**Para** controlar el acceso de usuarios a funcionalidades especificas del sistema

## Descripcion

Esta story implementa un sistema de autorizacion basado en **modulos**. No existen roles predefinidos (admin/resident) - todos son usuarios con permisos asignados individualmente o mediante pools.

### Conceptos Clave

1. **SuperAdmin**: Usuario unico con acceso total al sistema (hardcoded)
2. **Usuarios**: Todos los usuarios son iguales, diferenciados solo por permisos
3. **Modulos**: Unidades funcionales del sistema (1:1 con recursos)
4. **Permisos de Modulo**: Acceso al modulo completo (prerequisito)
5. **Permisos Granulares**: Acciones especificas dentro del modulo (create, read, update, delete, etc.)
6. **Pools de Usuarios**: Grupos con permisos identicos para facilitar gestion

### Flujo de Permisos

```
1. SuperAdmin otorga acceso a MODULO (prerequisito)
2. SuperAdmin otorga permisos GRANULARES dentro del modulo
3. Usuario solo puede usar funcionalidades si tiene:
   - Acceso al modulo Y
   - Permiso granular especifico
```

### Ejemplo

```
Usuario Juan:
├── Modulo: objetivos ✓ (tiene acceso)
│   ├── objetivos:read ✓
│   ├── objetivos:create ✓
│   └── objetivos:update ✗ (no otorgado)
├── Modulo: aportes ✓
│   └── aportes:read ✓
└── Modulo: reportes ✗ (sin acceso al modulo)
    └── reportes:export ✗ (no aplica, no tiene modulo)
```

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-002-C-001](./OB-002-C-001.md) | Definir estructura de modulos y permisos | done |
| [OB-002-C-002](./OB-002-C-002.md) | Crear middleware de autorizacion | done |
| [OB-002-C-003](./OB-002-C-003.md) | Implementar decoradores de permisos | done |
| [OB-002-C-004](./OB-002-C-004.md) | Crear sistema de pools de usuarios | done |
| [OB-002-C-005](./OB-002-C-005.md) | Implementar permisos por contexto (scope) | done |
| [OB-002-C-006](./OB-002-C-006.md) | Crear sistema de registro de modulos | done |
| [OB-002-C-007](./OB-002-C-007.md) | Implementar cache de permisos | done |
| [OB-002-C-008](./OB-002-C-008.md) | Crear endpoints de gestion de permisos (superadmin) | done |

## Criterios de Aceptacion

- [ ] SuperAdmin (unico) tiene acceso total sin restricciones
- [ ] No existen roles predefinidos - solo permisos por modulo
- [ ] Usuarios solo acceden a modulos asignados
- [ ] Permisos granulares requieren permiso de modulo previo
- [ ] Pools permiten asignar permisos a grupos de usuarios
- [ ] Modulos se registran automaticamente via migraciones
- [ ] Cambios de permisos quedan en auditoria
- [ ] Cache de permisos para performance

## Arquitectura de Permisos

```
┌─────────────────────────────────────────────────────────────┐
│                    PERMISSION CHECK                          │
├─────────────────────────────────────────────────────────────┤
│  1. ¿Es SuperAdmin?                                         │
│     └─> SI: Permitir todo (bypass completo)                 │
│                                                             │
│  2. ¿Usuario autenticado?                                   │
│     └─> NO: 401 Unauthorized                                │
│                                                             │
│  3. ¿Tiene acceso al MODULO?                                │
│     └─> NO: 403 Forbidden (sin acceso al modulo)            │
│     └─> Verificar USER_MODULES o POOL_MODULES               │
│                                                             │
│  4. ¿Tiene permiso GRANULAR?                                │
│     └─> NO: 403 Forbidden (sin permiso especifico)          │
│     └─> Verificar USER_PERMISSIONS o POOL_PERMISSIONS       │
│                                                             │
│  5. ¿Tiene permiso de CONTEXTO (scope)?                     │
│     └─> Verificar acceso al recurso especifico              │
│        - own: solo recursos propios                         │
│        - copropiedad: recursos de su copropiedad            │
│                                                             │
│  6. Permitir acceso                                         │
└─────────────────────────────────────────────────────────────┘
```

## Modelo de Datos

```typescript
// SuperAdmin (hardcoded o en config)
// Solo existe UN superadmin en el sistema

// Modulo del sistema (se registra via migracion)
interface Module {
  id: string;
  code: string;           // 'objetivos', 'aportes', 'pqr'
  name: string;           // 'Objetivos de Recaudo'
  description: string;
  isActive: boolean;
  createdAt: Date;
}

// Permisos disponibles por modulo (se registran via migracion)
interface ModulePermission {
  id: string;
  moduleId: string;
  code: string;           // 'create', 'read', 'update', 'delete', 'export'
  name: string;           // 'Crear objetivos'
  description: string;
}

// Acceso de usuario a modulo
interface UserModule {
  id: string;
  userId: string;
  moduleId: string;
  grantedBy: string;      // SuperAdmin ID
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// Permiso granular de usuario
interface UserPermission {
  id: string;
  userId: string;
  modulePermissionId: string;
  scope: 'own' | 'copropiedad' | 'all';
  scopeId?: string;       // ID de copropiedad si scope='copropiedad'
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

// Pool de usuarios
interface UserPool {
  id: string;
  name: string;           // 'Administradores Edificio Centro'
  description: string;
  createdBy: string;      // SuperAdmin
  createdAt: Date;
  isActive: boolean;
}

// Miembros del pool
interface UserPoolMember {
  id: string;
  poolId: string;
  userId: string;
  addedBy: string;
  addedAt: Date;
}

// Acceso de pool a modulo
interface PoolModule {
  id: string;
  poolId: string;
  moduleId: string;
  grantedBy: string;
  grantedAt: Date;
}

// Permisos del pool (se aplican a todos los miembros)
interface PoolPermission {
  id: string;
  poolId: string;
  modulePermissionId: string;
  scope: 'own' | 'copropiedad' | 'all';
  scopeId?: string;
  grantedBy: string;
  grantedAt: Date;
}
```

## Modulos del Sistema

Los siguientes modulos se registran via migracion:

| Codigo | Nombre | Permisos Disponibles |
|--------|--------|---------------------|
| `users` | Gestion de Usuarios | read, update |
| `copropiedades` | Copropiedades | read, update |
| `apartamentos` | Apartamentos | create, read, update, delete |
| `objetivos` | Objetivos de Recaudo | create, read, update, delete |
| `actividades` | Actividades de Recaudo | create, read, update, delete |
| `compromisos` | Compromisos | create, read, update |
| `aportes` | Aportes Reales | create, read, update |
| `pqr` | PQR | create, read, manage |
| `reportes` | Reportes | read, export |
| `auditoria` | Auditoria | read |
| `notificaciones` | Notificaciones | read, create |
| `configuracion` | Configuracion | read, update |

## Ejemplo de Uso

```typescript
// SuperAdmin otorga acceso al modulo 'objetivos' a usuario
await permissionsService.grantModuleAccess(userId, 'objetivos');

// SuperAdmin otorga permiso granular 'crear' en 'objetivos'
await permissionsService.grantPermission(userId, {
  module: 'objetivos',
  permission: 'create',
  scope: 'copropiedad',
  scopeId: copropiedadId,
});

// SuperAdmin crea pool y asigna permisos
const pool = await poolService.create({
  name: 'Admins Edificio A',
  description: 'Administradores del edificio A'
});
await poolService.addMember(pool.id, userId);
await poolService.grantModuleAccess(pool.id, 'objetivos');
await poolService.grantPermission(pool.id, {
  module: 'objetivos',
  permission: 'read',
  scope: 'copropiedad',
  scopeId: copropiedadId,
});

// Verificar permiso (combina permisos directos + pool)
const canCreate = await permissionsService.hasPermission(
  userId,
  'objetivos:create',
  { copropiedadId }
);
```

## Notas Tecnicas

- **SuperAdmin unico**: Configurado en variables de entorno o seed inicial
- **No hay roles**: Solo SuperAdmin y usuarios con permisos asignados
- **Modulos auto-registrados**: Cada modulo se registra via migracion al crearse
- **Permisos jerarquicos**: Modulo (acceso) > Permiso Granular > Scope
- **Pools opcionales**: Facilitan gestion de grupos con permisos identicos
- **Permisos acumulativos**: Usuario tiene permisos directos + permisos de pools
- **Cache agresivo**: Permisos en memoria, invalidar al cambiar
- **Auditoria completa**: Todo cambio de permiso queda registrado

## Dependencias

- **Depende de**: OB-002-B (requiere autenticacion)
- **Bloquea a**: Todos los modulos que requieren control de acceso
- **Relacionado**: OB-014-D (utilidades de permisos en frontend)
