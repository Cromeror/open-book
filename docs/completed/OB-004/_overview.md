# OB-004: Objetivos de Recaudo

## Metadata

| Campo | Valor |
|-------|-------|
| Status | done |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | epic, objetivos, recaudo, dominio |
| Depends on | OB-001, OB-002, OB-003 |

## Descripcion

Esta epica implementa la gestion de objetivos de recaudo, que representan las metas economicas que la copropiedad desea alcanzar. Segun el SUMMARY.md seccion 4.1, un objetivo tiene nombre, descripcion, monto objetivo, fechas y estado.

## Objetivo

Permitir a los administradores crear y gestionar objetivos de recaudo con toda la informacion necesaria, y a los residentes visualizar los objetivos activos y su progreso.

## Alcance

### Incluido
- Modelo de objetivo de recaudo con todos los atributos
- CRUD completo para administradores
- Visualizacion para residentes
- Estados: activo, pausado, finalizado, cancelado
- Fechas de inicio y fin
- Historial de cambios de estado

### Excluido
- Calculo automatico de avance (ver OB-008)
- Objetivos recurrentes o plantillas

## Estructura

### Stories
- [OB-004-A](./OB-004-A/) - Modelo y CRUD de objetivos
- [OB-004-B](./OB-004-B/) - Estados y ciclo de vida de objetivos
- [OB-004-C](./OB-004-C/) - Visualizacion de objetivos para residentes

## Criterios de Aceptacion Globales

- [ ] Administradores pueden crear objetivos con monto y fechas
- [ ] Los objetivos tienen estados claros y transiciones definidas
- [ ] Residentes pueden ver objetivos activos de su copropiedad
- [ ] Existe auditoria completa de cambios en objetivos
- [ ] No se pueden eliminar objetivos con actividades/aportes

## Dependencias

- **Depende de**: OB-003 (copropiedad para asociar objetivo)
- **Bloquea a**: OB-005 (actividades asociadas a objetivos)

## Referencias

- SUMMARY.md - Seccion 4.1: Objetivo de Recaudo
