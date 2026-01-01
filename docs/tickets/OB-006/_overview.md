# OB-006: Compromisos de Aporte

## Metadata

| Campo | Valor |
|-------|-------|
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | epic, compromisos, dominio, transparencia |
| Depends on | OB-003, OB-005 |

## Descripcion

Esta epica implementa la gestion de compromisos de aporte, que segun SUMMARY.md seccion 4.4 representan la intencion o responsabilidad asumida por un apartamento frente a una actividad. Es fundamental la distincion: un compromiso NO representa un ingreso real hasta que se registra un aporte efectivo.

## Objetivo

Permitir el registro y seguimiento de compromisos de aporte por apartamento, manteniendo clara la diferencia entre lo comprometido y lo efectivamente aportado (principio de Claridad del sistema).

## Alcance

### Incluido
- Modelo de compromiso con estados
- Asociacion compromiso -> apartamento -> actividad
- Estados: pendiente, parcial, cumplido
- CRUD con validaciones de negocio
- Visualizacion de compromisos propios para residentes

### Excluido
- Compromisos automaticos o masivos (puede ser fase futura)
- Recordatorios automaticos (ver OB-013)
- Penalizaciones por incumplimiento

## Estructura

### Stories
- [OB-006-A](./OB-006-A/) - Modelo y CRUD de compromisos
- [OB-006-B](./OB-006-B/) - Estados y seguimiento de compromisos
- [OB-006-C](./OB-006-C/) - Visualizacion de compromisos para residentes

## Criterios de Aceptacion Globales

- [ ] Compromisos asociados a apartamento y actividad
- [ ] Estados claros: PENDIENTE, PARCIAL, CUMPLIDO
- [ ] Solo admins pueden crear/editar compromisos
- [ ] Residentes ven solo sus compromisos
- [ ] Clara diferenciacion entre compromiso y aporte real
- [ ] Auditoria completa de compromisos

## Dependencias

- **Depende de**: OB-003 (apartamentos), OB-005 (actividades)
- **Bloquea a**: OB-007 (aportes se asocian a compromisos), OB-008

## Referencias

- SUMMARY.md - Seccion 4.4: Compromisos de Aporte
- Principio de Claridad: compromisos vs aportes
