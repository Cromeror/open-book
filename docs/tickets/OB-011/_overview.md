# OB-011: Visibilidad de Estados de Cuenta

## Metadata

| Campo | Valor |
|-------|-------|
| Status | pending |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | epic, visibilidad, privacidad, ley-1581 |
| Depends on | OB-002, OB-006, OB-007, OB-010 |

## Descripcion

Esta epica implementa el sistema de visibilidad de estados de cuenta segun SUMMARY.md seccion 7, cumpliendo con la Ley 1581 de 2012 (Habeas Data). El sistema permite a residentes elegir si sus estados de cuenta son publicos o privados.

## Objetivo

Implementar un sistema de visibilidad que respete la privacidad de los residentes, cumpla con la legislacion de datos personales, y mantenga trazabilidad completa de las decisiones de visibilidad.

## Alcance

### Incluido
- Configuracion de visibilidad al registrarse
- Principio de reciprocidad (ver solo si compartes)
- Cambio de visibilidad solo via PQR
- Gestion por admin con justa causa documentada
- Notificacion de cambios al titular
- Auditoria completa

### Excluido
- Visibilidad parcial (todo o nada)
- Visibilidad temporal

## Estructura

### Stories
- [OB-011-A](./OB-011-A/) - Configuracion inicial de visibilidad
- [OB-011-B](./OB-011-B/) - Gestion de cambios de visibilidad
- [OB-011-C](./OB-011-C/) - Visualizacion de estados de cuenta publicos
- [OB-011-D](./OB-011-D/) - Gestion administrativa de visibilidad

## Criterios de Aceptacion Globales

- [ ] Consentimiento expreso al registro (Ley 1581)
- [ ] Cambios solo via PQR (no inmediatos)
- [ ] Reciprocidad: ver solo si compartes
- [ ] Admin puede modificar con justa causa documentada
- [ ] Notificacion al titular de cualquier cambio
- [ ] Auditoria completa de todas las decisiones

## Dependencias

- **Depende de**: OB-002, OB-006, OB-007, OB-010
- **Bloquea a**: Ninguno (funcionalidad independiente)

## Referencias

- SUMMARY.md - Seccion 7: Visibilidad de Estados de Cuenta
- Ley 1581 de 2012 (Habeas Data)
