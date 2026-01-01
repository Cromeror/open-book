# OB-006-B: Estados y seguimiento de compromisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-006 - Compromisos de Aporte |
| Status | pending |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, estados, seguimiento |
| Depends on | OB-006-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** ver el estado de cumplimiento de cada compromiso
**Para** saber que apartamentos han cumplido y cuales tienen pendientes

## Descripcion

Esta story implementa el calculo automatico del estado de los compromisos basado en los aportes realizados, y las vistas de seguimiento para administradores.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-006-B-001](./OB-006-B-001.md) | Calcular estado de compromiso automaticamente | pending |
| [OB-006-B-002](./OB-006-B-002.md) | Crear dashboard de seguimiento de compromisos | pending |
| [OB-006-B-003](./OB-006-B-003.md) | Implementar filtros de compromisos por estado | pending |

## Criterios de Aceptacion

- [ ] Estado se calcula automaticamente basado en aportes
- [ ] Estados: PENDIENTE, PARCIAL, CUMPLIDO
- [ ] Dashboard muestra resumen por estado
- [ ] Filtros permiten ver pendientes facilmente
- [ ] Vista de "morosos" (compromisos vencidos pendientes)

## Notas Tecnicas

- Estado no se almacena, se calcula dinamicamente
- Considerar cache para performance en reportes
- PARCIAL = aportado > 0 && aportado < comprometido

## Dependencias

- **Depende de**: OB-006-A, OB-007-A (requiere aportes)
- **Bloquea a**: OB-008, OB-009 (reportes)
