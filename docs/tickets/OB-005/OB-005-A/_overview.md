# OB-005-A: Modelo y CRUD de actividades

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-005 - Actividades de Recaudo |
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, actividades, modelo, crud |
| Depends on | OB-004-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder crear y gestionar actividades de recaudo
**Para** organizar las diferentes formas de recolectar fondos para un objetivo

## Descripcion

Esta story implementa el modelo de datos y los endpoints CRUD para actividades de recaudo. Una actividad es una accion concreta para recolectar dinero (rifa, donacion, evento, etc.).

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-005-A-001](./OB-005-A-001.md) | Crear entidad Actividad con TypeORM | pending |
| [OB-005-A-002](./OB-005-A-002.md) | Implementar CRUD de actividades | pending |
| [OB-005-A-003](./OB-005-A-003.md) | Validar asociacion con objetivo activo | pending |

## Criterios de Aceptacion

- [ ] Modelo Actividad creado con campos necesarios
- [ ] CRUD completo funcional
- [ ] Actividad siempre asociada a un objetivo
- [ ] Solo se pueden crear actividades en objetivos activos
- [ ] Soft delete para actividades

## Notas Tecnicas

- Una actividad pertenece a exactamente un objetivo
- Un objetivo puede tener multiples actividades
- Las actividades heredan la copropiedad del objetivo

## Dependencias

- **Depende de**: OB-004-A
- **Bloquea a**: OB-005-B, OB-006-A
