# OB-006-A: Modelo y CRUD de compromisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-006 - Compromisos de Aporte |
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, compromisos, modelo, crud |
| Depends on | OB-003-B, OB-005-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** registrar compromisos de aporte por apartamento
**Para** llevar control de lo que cada unidad se compromete a aportar

## Descripcion

Esta story implementa el modelo de datos y los endpoints CRUD para compromisos de aporte. Un compromiso representa la intencion de un apartamento de aportar cierto monto a una actividad.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-006-A-001](./OB-006-A-001.md) | Crear entidad Compromiso con TypeORM | pending |
| [OB-006-A-002](./OB-006-A-002.md) | Implementar CRUD de compromisos | pending |
| [OB-006-A-003](./OB-006-A-003.md) | Validar compromiso unico por apartamento-actividad | pending |
| [OB-006-A-004](./OB-006-A-004.md) | Implementar registro masivo de compromisos | pending |

## Criterios de Aceptacion

- [ ] Modelo Compromiso con campos del SUMMARY.md
- [ ] Compromiso asociado a apartamento y actividad
- [ ] Un apartamento solo puede tener un compromiso por actividad
- [ ] CRUD completo funcional para administradores
- [ ] Soft delete para inmutabilidad

## Notas Tecnicas

- Estado inicial siempre es PENDIENTE
- El monto comprometido puede modificarse (con auditoria)
- Considerar restriccion de unicidad (apartamento, actividad)

## Dependencias

- **Depende de**: OB-003-B, OB-005-A
- **Bloquea a**: OB-006-B, OB-007-A
