# OB-004-B: Estados y ciclo de vida de objetivos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-004 - Objetivos de Recaudo |
| Status | done |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, estados, workflow |
| Depends on | OB-004-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder cambiar el estado de los objetivos de recaudo
**Para** reflejar el progreso y situacion actual de cada objetivo

## Descripcion

Esta story implementa la maquina de estados para objetivos y las transiciones permitidas. Incluye la logica para cambiar estados y el registro en auditoria de cada cambio.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-004-B-001](./OB-004-B-001.md) | Definir maquina de estados de objetivo | pending |
| [OB-004-B-002](./OB-004-B-002.md) | Implementar endpoint de cambio de estado | pending |
| [OB-004-B-003](./OB-004-B-003.md) | Registrar historial de cambios de estado | pending |

## Criterios de Aceptacion

- [ ] Estados definidos: ACTIVO, PAUSADO, FINALIZADO, CANCELADO
- [ ] Transiciones de estado validadas
- [ ] Historial de cambios de estado consultable
- [ ] Solo admins pueden cambiar estados
- [ ] Notificacion al cambiar a FINALIZADO

## Notas Tecnicas

- Usar patron State Machine
- Algunas transiciones pueden requerir justificacion
- Finalizar objetivo no debe ser reversible

## Dependencias

- **Depende de**: OB-004-A
- **Bloquea a**: OB-008 (calculo depende del estado)
