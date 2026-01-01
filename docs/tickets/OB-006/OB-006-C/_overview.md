# OB-006-C: Visualizacion de compromisos para residentes

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-006 - Compromisos de Aporte |
| Status | pending |
| Priority | medium |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, visualizacion, residentes |
| Depends on | OB-006-A |

## User Story

**Como** residente de una copropiedad
**Quiero** ver mis compromisos de aporte y su estado
**Para** saber cuanto he aportado y cuanto me falta

## Descripcion

Esta story implementa la visualizacion de compromisos para residentes, mostrando solo los compromisos de su propio apartamento con su estado de cumplimiento.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-006-C-001](./OB-006-C-001.md) | Crear endpoint de mis compromisos | pending |
| [OB-006-C-002](./OB-006-C-002.md) | Mostrar detalle de compromiso con aportes | pending |

## Criterios de Aceptacion

- [ ] Residente ve solo compromisos de su apartamento
- [ ] Cada compromiso muestra estado y progreso
- [ ] Se puede ver historial de aportes del compromiso
- [ ] Informacion clara de cuanto falta por aportar

## Notas Tecnicas

- Filtrar automaticamente por apartamento del usuario
- No mostrar compromisos de otros apartamentos
- Incluir informacion de la actividad asociada

## Dependencias

- **Depende de**: OB-006-A, OB-003-C
- **Bloquea a**: OB-011 (estados de cuenta)
