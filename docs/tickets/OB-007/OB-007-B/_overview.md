# OB-007-B: Estados e inmutabilidad de aportes

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-007 - Aportes Reales |
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, estados, inmutabilidad, transparencia |
| Depends on | OB-007-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder confirmar o anular aportes con justificacion documentada
**Para** mantener la integridad del registro contable cumpliendo con inmutabilidad

## Descripcion

Esta story implementa el manejo de estados de aportes siguiendo el principio de inmutabilidad: los aportes nunca se eliminan, solo cambian de estado, y cada cambio queda documentado.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-007-B-001](./OB-007-B-001.md) | Implementar confirmacion de aporte | pending |
| [OB-007-B-002](./OB-007-B-002.md) | Implementar anulacion de aporte con justificacion | pending |
| [OB-007-B-003](./OB-007-B-003.md) | Registrar historial de cambios de aporte | pending |
| [OB-007-B-004](./OB-007-B-004.md) | Bloquear eliminacion fisica de aportes | pending |

## Criterios de Aceptacion

- [ ] Aportes pasan de PENDIENTE a CONFIRMADO
- [ ] Aportes pueden anularse con justificacion obligatoria
- [ ] Los aportes NUNCA se eliminan fisicamente
- [ ] Cada cambio de estado queda en historial
- [ ] Solo aportes CONFIRMADOS cuentan para calculos

## Notas Tecnicas

- Estado es la caracteristica mas importante del aporte
- La anulacion es irreversible (no se puede "desanular")
- El historial es critico para auditoria

## Dependencias

- **Depende de**: OB-007-A
- **Bloquea a**: OB-008 (solo confirmados cuentan), OB-012
