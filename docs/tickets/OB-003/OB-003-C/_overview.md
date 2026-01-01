# OB-003-C: Asociacion de usuarios a apartamentos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-003 - Gestion de Copropiedades y Apartamentos |
| Status | pending |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, usuarios, apartamentos, relacion |
| Depends on | OB-003-B, OB-002-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder asociar residentes a sus apartamentos
**Para** que puedan ver su informacion de aportes y compromisos

## Descripcion

Esta story implementa la relacion entre usuarios (residentes) y apartamentos. Un apartamento puede tener multiples residentes asociados y un residente puede estar asociado a un apartamento.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-003-C-001](./OB-003-C-001.md) | Crear modelo ApartamentoResidente | pending |
| [OB-003-C-002](./OB-003-C-002.md) | Implementar endpoints de asociacion | pending |
| [OB-003-C-003](./OB-003-C-003.md) | Permitir auto-registro de residentes | pending |
| [OB-003-C-004](./OB-003-C-004.md) | Filtrar datos por apartamento del residente | pending |

## Criterios de Aceptacion

- [ ] Modelo de relacion usuario-apartamento creado
- [ ] Admin puede asociar/desasociar residentes
- [ ] Residentes pueden solicitar asociacion (pendiente aprobacion)
- [ ] Un residente ve solo datos de su apartamento
- [ ] Historial de asociaciones para auditoria

## Notas Tecnicas

- Considerar roles dentro del apartamento (propietario, arrendatario)
- La asociacion puede tener fechas de vigencia
- Mantener historial de asociaciones anteriores

## Dependencias

- **Depende de**: OB-003-B, OB-002-A
- **Bloquea a**: OB-006, OB-007, OB-011 (requieren saber apartamento del usuario)
