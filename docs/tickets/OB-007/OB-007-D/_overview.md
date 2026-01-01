# OB-007-D: Visualizacion de aportes para residentes

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-007 - Aportes Reales |
| Status | pending |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, visualizacion, residentes |
| Depends on | OB-007-A |

## User Story

**Como** residente de una copropiedad
**Quiero** ver el historial de mis aportes
**Para** tener un registro personal de mis contribuciones a la comunidad

## Descripcion

Esta story implementa la visualizacion de aportes para residentes, permitiendoles consultar su historial de contribuciones y el impacto de sus aportes en los objetivos.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-007-D-001](./OB-007-D-001.md) | Crear endpoint de mis aportes | pending |
| [OB-007-D-002](./OB-007-D-002.md) | Mostrar impacto de aporte en objetivo | pending |

## Criterios de Aceptacion

- [ ] Residente ve solo aportes de su apartamento
- [ ] Historial ordenado cronologicamente
- [ ] Muestra estado de cada aporte
- [ ] Muestra impacto en objetivo/compromiso
- [ ] Acceso a comprobantes de aportes propios

## Notas Tecnicas

- Filtrar estrictamente por apartamento del usuario
- Incluir aportes de todas las actividades
- Considerar paginacion para historiales largos

## Dependencias

- **Depende de**: OB-007-A, OB-003-C
- **Bloquea a**: OB-011 (estados de cuenta)
