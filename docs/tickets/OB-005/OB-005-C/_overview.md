# OB-005-C: Visualizacion de actividades para residentes

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-005 - Actividades de Recaudo |
| Status | pending |
| Priority | medium |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, visualizacion, residentes |
| Depends on | OB-005-A |

## User Story

**Como** residente de una copropiedad
**Quiero** ver las actividades de recaudo disponibles
**Para** saber como puedo contribuir a los objetivos de la comunidad

## Descripcion

Esta story implementa la visualizacion de actividades para residentes, mostrando informacion relevante como tipo, fechas, y como participar.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-005-C-001](./OB-005-C-001.md) | Crear endpoint de actividades para residentes | pending |
| [OB-005-C-002](./OB-005-C-002.md) | Mostrar detalle de actividad con instrucciones | pending |

## Criterios de Aceptacion

- [ ] Residentes ven actividades activas de su copropiedad
- [ ] Detalle de actividad muestra como participar
- [ ] Informacion de precios/montos visible
- [ ] No expone datos de otros apartamentos

## Notas Tecnicas

- Filtrar solo actividades en estado ACTIVA por defecto
- Incluir progreso de la actividad si tiene meta
- Considerar informacion especifica por tipo

## Dependencias

- **Depende de**: OB-005-A, OB-003-C
- **Bloquea a**: OB-006 (crear compromisos desde vista de actividad)
