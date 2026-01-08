# OB-004-A: Modelo y CRUD de objetivos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-004 - Objetivos de Recaudo |
| Status | done |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, objetivos, modelo, crud |
| Depends on | OB-003-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder crear y gestionar objetivos de recaudo
**Para** definir las metas economicas que la comunidad debe alcanzar

## Descripcion

Esta story implementa el modelo de datos y los endpoints CRUD para objetivos de recaudo. Un objetivo representa una meta economica con monto, fechas y descripcion.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-004-A-001](./OB-004-A-001.md) | Crear entidad Objetivo con TypeORM | pending |
| [OB-004-A-002](./OB-004-A-002.md) | Implementar CRUD de objetivos | pending |
| [OB-004-A-003](./OB-004-A-003.md) | Validar reglas de negocio de objetivos | pending |
| [OB-004-A-004](./OB-004-A-004.md) | Implementar busqueda y filtros de objetivos | pending |

## Criterios de Aceptacion

- [ ] Modelo Objetivo con atributos del SUMMARY.md
- [ ] CRUD completo funcional
- [ ] Validacion de monto positivo y fechas coherentes
- [ ] Filtros por estado, fecha, copropiedad

## Notas Tecnicas

- El monto debe ser decimal con precision monetaria
- Las fechas deben validar que fin >= inicio
- Objetivo asociado a una copropiedad especifica

## Dependencias

- **Depende de**: OB-003-A
- **Bloquea a**: OB-004-B, OB-005-A
