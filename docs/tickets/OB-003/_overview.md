# OB-003: Gestion de Copropiedades y Apartamentos

## Metadata

| Campo | Valor |
|-------|-------|
| Status | in_progress |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2026-01-09 |
| Labels | epic, copropiedades, apartamentos, dominio |
| Depends on | OB-001, OB-002 |
| Progress | ~25% |

## Descripcion

Esta epica cubre la gestion de las entidades fundamentales del dominio: copropiedades (unidades residenciales) y apartamentos. Estas entidades son la base sobre la cual se construyen todas las funcionalidades de recaudo del sistema.

## Objetivo

Implementar el CRUD completo de copropiedades y apartamentos, permitiendo la configuracion de la estructura organizacional de cada unidad residencial y la asociacion de residentes a sus respectivos apartamentos.

## Estado Actual de Implementacion

### Completado
- Entidad `Condominium` creada con campos base (name, nit, address, city, unitCount, isActive)
- Migracion de tabla `condominiums` aplicada
- Relacion con entidad `Goal` establecida
- Infraestructura de `AdminModule` para endpoints bajo `/admin/*`
- Sistema de permisos con `@RequirePermission()` y `@RequireModule()` decoradores

### En Progreso
- CRUD de copropiedades (requiere endpoints)

### Pendiente
- Entidades: Tower, Apartment, ApartmentResident, CondominiumAdmin
- Endpoints CRUD para copropiedades, apartamentos y torres
- Relaciones completas en Condominium entity

## Arquitectura de Endpoints

El proyecto implementa dos niveles de acceso:

| Prefijo | Acceso | Descripcion |
|---------|--------|-------------|
| `/admin/*` | SuperAdmin + Admins con permisos | Acceso completo, gestion global |
| `/*` | Usuarios autenticados | Acceso limitado, filtrado por permisos |

### Estructura de Endpoints Propuesta

```
# Admin endpoints (acceso completo)
/admin/condominiums                    - CRUD copropiedades
/admin/condominiums/:id/towers         - CRUD torres
/admin/condominiums/:id/apartments     - CRUD apartamentos
/admin/condominiums/:id/admins         - Gestionar administradores

# User endpoints (acceso limitado)
/condominiums/:condominiumId/goals     - Ya implementado (GoalsModule)
/condominiums/:condominiumId/apartments/:aptId/residents - Gestionar residentes
/my/apartment-requests                 - Auto-registro de residentes
```

## Alcance

### Incluido
- Modelo de copropiedad con configuracion basica
- Modelo de apartamento/unidad residencial
- Asociacion de usuarios (residentes) a apartamentos
- Torres/bloques como agrupacion opcional
- CRUD completo con permisos apropiados
- Vinculacion de administradores a copropiedades

### Excluido
- Gestion de multiples copropiedades por usuario residente
- Coeficientes de copropiedad (puede ser fase futura)
- Planos o ubicacion geografica de apartamentos

## Estructura

### Stories
| Story | Titulo | Estado | Progreso |
|-------|--------|--------|----------|
| [OB-003-A](./OB-003-A/) | Modelo y gestion de copropiedades | in_progress | ~40% |
| [OB-003-B](./OB-003-B/) | Modelo y gestion de apartamentos | pending | 0% |
| [OB-003-C](./OB-003-C/) | Asociacion de usuarios a apartamentos | pending | 0% |

## Criterios de Aceptacion Globales

- [x] Entidad Copropiedad/Condominium creada con auditoria
- [ ] Administradores pueden crear y gestionar copropiedades
- [ ] Los apartamentos pertenecen a una copropiedad
- [ ] Los residentes estan asociados a un apartamento
- [ ] La estructura soporta torres/bloques opcionales
- [x] Campos de auditoria heredados de BaseEntity

## Dependencias

- **Depende de**: OB-001 (infraestructura), OB-002 (usuarios)
- **Bloquea a**: OB-004, OB-005, OB-006, OB-007 (requieren apartamentos)

## Notas Tecnicas de Implementacion

### Convenciones de Nombrado
El codigo usa nombrado en ingles segun CLAUDE.md:

| Dominio (Espanol) | Codigo (Ingles) | Tabla BD |
|-------------------|-----------------|----------|
| Copropiedad | Condominium | condominiums |
| Torre | Tower | towers |
| Apartamento | Apartment | apartments |
| ApartamentoResidente | ApartmentResident | apartment_residents |
| CopropiedadAdmin | CondominiumAdmin | condominium_admins |

### Archivos Existentes Relevantes
- `apps/api/src/entities/condominium.entity.ts` - Entidad principal
- `apps/api/src/modules/admin/admin.module.ts` - Modulo admin con RouterModule
- `apps/api/src/modules/goals/` - Ejemplo de modulo con endpoints bajo condominium

## Referencias

- SUMMARY.md - Seccion 4.3: Apartamentos / Unidades Residenciales
- `apps/api/src/entities/condominium.entity.ts` - Implementacion actual
