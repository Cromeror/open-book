# OB-003-B: Modelo y gestion de apartamentos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-003 - Gestion de Copropiedades y Apartamentos |
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2026-01-09 |
| Labels | story, apartamentos, modelo |
| Depends on | OB-003-A |
| Progress | 0% |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder registrar y gestionar los apartamentos
**Para** tener un registro completo de las unidades que participan en las actividades de recaudo

## Descripcion

Esta story cubre la creacion del modelo de apartamento y los endpoints para su gestion. Los apartamentos son las unidades basicas que realizan compromisos y aportes.

## Estado Actual

### Pendiente
- Entidad `Apartment` no creada
- Entidad `Tower` no creada (prerequisito)
- Endpoints CRUD no implementados
- Carga masiva no implementada

### Prerequisitos de OB-003-A
- OB-003-A-004 (Torres) debe completarse primero para la relacion Apartment -> Tower

## Tareas

| ID | Titulo | Status | Notas |
|----|--------|--------|-------|
| [OB-003-B-001](./OB-003-B-001.md) | Crear entidad Apartment con TypeORM | pending | Requiere Tower entity primero |
| [OB-003-B-002](./OB-003-B-002.md) | Implementar CRUD de apartamentos | pending | Bajo /admin/condominiums/:id/apartments |
| [OB-003-B-003](./OB-003-B-003.md) | Implementar carga masiva de apartamentos | pending | CSV upload |
| [OB-003-B-004](./OB-003-B-004.md) | Validar unicidad de apartamento en copropiedad | pending | Service-level validation |

## Criterios de Aceptacion

- [ ] Modelo Apartment creado con campos requeridos
- [ ] CRUD completo bajo /admin/condominiums/:condoId/apartments
- [ ] Carga masiva desde CSV
- [ ] Numero de apartamento unico por torre/copropiedad
- [ ] Apartamentos pueden activarse/desactivarse (soft delete)

## Arquitectura de Endpoints

```
# Admin endpoints (acceso completo)
POST   /admin/condominiums/:condoId/apartments           - Crear
GET    /admin/condominiums/:condoId/apartments           - Listar (paginado, filtros)
GET    /admin/condominiums/:condoId/apartments/:id       - Obtener uno
PATCH  /admin/condominiums/:condoId/apartments/:id       - Actualizar
DELETE /admin/condominiums/:condoId/apartments/:id       - Soft delete
POST   /admin/condominiums/:condoId/apartments/bulk      - Carga masiva CSV
GET    /admin/condominiums/:condoId/apartments/template  - Descargar template CSV

# User endpoints (lectura limitada - futuro)
GET    /condominiums/:condoId/apartments                 - Listar activos
GET    /condominiums/:condoId/apartments/:id             - Obtener uno activo
```

## Notas Tecnicas

### Nombrado (segun CLAUDE.md)
| Dominio (Espanol) | Codigo (Ingles) | Tabla BD |
|-------------------|-----------------|----------|
| Apartamento | Apartment | apartments |
| Torre | Tower | towers |
| numero | number | number |
| piso | floor | floor |

### Unicidad
- Con torres: unico por (condominiumId, towerId, number)
- Sin torres: unico por (condominiumId, NULL, number)
- Constraint a nivel de BD + validacion en servicio

### Archivos a crear
- `apps/api/src/entities/apartment.entity.ts`
- `apps/api/src/modules/admin/apartments/apartments.module.ts`
- `apps/api/src/modules/admin/apartments/apartments.controller.ts`
- `apps/api/src/modules/admin/apartments/apartments.service.ts`

## Dependencias

- **Depende de**: OB-003-A (copropiedad y torres)
- **Bloquea a**: OB-003-C, OB-006, OB-007
