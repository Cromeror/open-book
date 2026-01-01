# OB-004-C: Visualizacion de objetivos para residentes

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-004 - Objetivos de Recaudo |
| Status | pending |
| Priority | medium |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, visualizacion, residentes |
| Depends on | OB-004-A |

## User Story

**Como** residente de una copropiedad
**Quiero** poder ver los objetivos de recaudo activos y finalizados
**Para** estar informado sobre las metas economicas de mi comunidad

## Descripcion

Esta story implementa las vistas y endpoints optimizados para que los residentes consulten los objetivos de su copropiedad, con informacion clara y relevante.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-004-C-001](./OB-004-C-001.md) | Crear endpoint de objetivos para residentes | pending |
| [OB-004-C-002](./OB-004-C-002.md) | Mostrar resumen de objetivo con progreso | pending |
| [OB-004-C-003](./OB-004-C-003.md) | Listar objetivos historicos finalizados | pending |

## Criterios de Aceptacion

- [ ] Residentes ven objetivos de su copropiedad
- [ ] Visualizacion incluye progreso basico (sin detalle de otros)
- [ ] Separacion clara entre activos e historicos
- [ ] Informacion sensible no se expone

## Notas Tecnicas

- Los residentes solo ven objetivos de su copropiedad
- El progreso se muestra agregado, no por apartamento
- Considerar cache para datos de progreso

## Dependencias

- **Depende de**: OB-004-A, OB-003-C
- **Bloquea a**: OB-008-C (visualizacion avanzada)
