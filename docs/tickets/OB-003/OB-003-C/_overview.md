# OB-003-C: Asociacion de usuarios a apartamentos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-003 - Gestion de Copropiedades y Apartamentos |
| Status | pending |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2026-01-09 |
| Labels | story, usuarios, apartamentos, relacion |
| Depends on | OB-003-B, OB-002-A |
| Progress | 0% |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder asociar residentes a sus apartamentos
**Para** que puedan ver su informacion de aportes y compromisos

## Descripcion

Esta story implementa la relacion entre usuarios (residentes) y apartamentos. Un apartamento puede tener multiples residentes asociados y un residente puede estar asociado a un apartamento.

## Estado Actual

### Pendiente
- Entidad `ApartmentResident` no creada
- Endpoints de asociacion no implementados
- Guard de filtrado por apartamento no implementado
- Sistema de auto-registro no implementado

### Prerequisitos
- OB-003-B (Apartamentos) debe completarse primero
- OB-002-A (Usuarios) ya completado

## Tareas

| ID | Titulo | Status | Notas |
|----|--------|--------|-------|
| [OB-003-C-001](./OB-003-C-001.md) | Crear entidad ApartmentResident | pending | Tabla apartment_residents |
| [OB-003-C-002](./OB-003-C-002.md) | Implementar endpoints de asociacion | pending | CRUD bajo apartments/:id/residents |
| [OB-003-C-003](./OB-003-C-003.md) | Permitir auto-registro de residentes | pending | /my/apartment-requests |
| [OB-003-C-004](./OB-003-C-004.md) | Filtrar datos por apartamento del residente | pending | ApartmentScopeGuard |

## Criterios de Aceptacion

- [ ] Modelo ApartmentResident creado con TypeORM
- [ ] Admin puede asociar/desasociar residentes
- [ ] Residentes pueden solicitar asociacion (estado PENDING)
- [ ] Un residente ve solo datos de su apartamento
- [ ] Historial de asociaciones para auditoria

## Arquitectura de Endpoints

```
# Admin endpoints (gestion de residentes)
POST   /admin/condominiums/:condoId/apartments/:aptId/residents           - Asociar residente
GET    /admin/condominiums/:condoId/apartments/:aptId/residents           - Listar residentes
PATCH  /admin/condominiums/:condoId/apartments/:aptId/residents/:id       - Actualizar relacion
DELETE /admin/condominiums/:condoId/apartments/:aptId/residents/:id       - Desasociar
PUT    /admin/condominiums/:condoId/apartments/:aptId/residents/:id/approve - Aprobar solicitud

# User endpoints (auto-registro)
POST   /my/apartment-requests        - Solicitar asociacion
GET    /my/apartment-requests        - Ver mis solicitudes
DELETE /my/apartment-requests/:id    - Cancelar solicitud pendiente
GET    /my/apartment                 - Ver mi apartamento actual
```

## Notas Tecnicas

### Nombrado (segun CLAUDE.md)
| Dominio (Espanol) | Codigo (Ingles) | Tabla BD |
|-------------------|-----------------|----------|
| ApartamentoResidente | ApartmentResident | apartment_residents |
| TipoRelacion | RelationType | relation_type |
| EstadoAsociacion | AssociationStatus | status |

### Enums

```typescript
export enum RelationType {
  OWNER = 'OWNER',           // Propietario
  TENANT = 'TENANT',         // Arrendatario
  OTHER = 'OTHER',           // Otro
}

export enum AssociationStatus {
  PENDING = 'PENDING',       // Pendiente aprobacion
  ACTIVE = 'ACTIVE',         // Activa
  INACTIVE = 'INACTIVE',     // Inactiva
  REJECTED = 'REJECTED',     // Rechazada
}
```

### Archivos a crear
- `apps/api/src/entities/apartment-resident.entity.ts`
- `apps/api/src/modules/admin/apartments/residents/residents.controller.ts`
- `apps/api/src/modules/admin/apartments/residents/residents.service.ts`
- `apps/api/src/common/guards/apartment-scope.guard.ts`
- `apps/api/src/common/decorators/user-apartment.decorator.ts`
- `apps/api/src/modules/my/apartment-requests/` - Modulo para auto-registro

### ApartmentScopeGuard
Guard que:
1. Obtiene el usuario del request
2. Si es SuperAdmin/Admin, permite todo
3. Si es residente, busca su asociacion activa
4. Inyecta `request.userApartment` para filtrado en servicios

## Dependencias

- **Depende de**: OB-003-B, OB-002-A
- **Bloquea a**: OB-006, OB-007, OB-011 (requieren saber apartamento del usuario)
