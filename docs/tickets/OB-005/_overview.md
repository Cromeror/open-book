# OB-005: Actividades de Recaudo

## Metadata

| Campo | Valor |
|-------|-------|
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | epic, actividades, recaudo, dominio |
| Depends on | OB-004 |

## Descripcion

Esta epica implementa la gestion de actividades de recaudo, que son las acciones concretas mediante las cuales se obtiene dinero para cumplir un objetivo. Segun SUMMARY.md seccion 4.2, ejemplos incluyen rifas, donaciones, eventos comunitarios y ventas.

## Objetivo

Permitir a los administradores crear y gestionar diferentes tipos de actividades de recaudo asociadas a objetivos especificos, facilitando la organizacion y seguimiento de las diferentes formas de recolectar fondos.

## Alcance

### Incluido
- Modelo de actividad con tipos predefinidos
- Asociacion de actividades a objetivos
- CRUD completo para administradores
- Estados de actividad (activa, pausada, finalizada)
- Fechas de vigencia de actividades
- Metas opcionales por actividad

### Excluido
- Gestion de inventario para rifas/ventas
- Integracion con plataformas de pago
- Venta de boletos online

## Estructura

### Stories
- [OB-005-A](./OB-005-A/) - Modelo y CRUD de actividades
- [OB-005-B](./OB-005-B/) - Tipos y configuracion de actividades
- [OB-005-C](./OB-005-C/) - Visualizacion de actividades para residentes

## Criterios de Aceptacion Globales

- [ ] Actividades estan asociadas a un objetivo especifico
- [ ] Cada actividad tiene un tipo definido
- [ ] CRUD completo funcional para administradores
- [ ] Residentes pueden ver actividades activas
- [ ] No se eliminan actividades con compromisos/aportes

## Dependencias

- **Depende de**: OB-004 (objetivos para asociar)
- **Bloquea a**: OB-006, OB-007 (compromisos y aportes por actividad)

## Referencias

- SUMMARY.md - Seccion 4.2: Actividades de Recaudo
