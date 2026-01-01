# OB-010: Sistema de PQR

## Metadata

| Campo | Valor |
|-------|-------|
| Status | pending |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | epic, pqr, solicitudes, soporte |
| Depends on | OB-002 |

## Descripcion

Esta epica implementa el sistema de Peticiones, Quejas y Reclamos (PQR) segun SUMMARY.md seccion 9. Es especialmente importante porque los cambios de visibilidad de estados de cuenta se tramitan a traves de este sistema.

## Objetivo

Proveer un canal formal para que los residentes puedan enviar peticiones, quejas y reclamos, con trazabilidad completa y tiempos de respuesta definidos.

## Alcance

### Incluido
- Creacion de PQR por residentes
- Radicacion automatica con numero de seguimiento
- Tiempos de respuesta por tipo
- Gestion de PQR por administradores
- Historial de solicitudes por residente
- Integracion con cambios de visibilidad

### Excluido
- Chat en tiempo real
- Integracion con canales externos (WhatsApp, email externo)

## Estructura

### Stories
- [OB-010-A](./OB-010-A/) - Modelo y creacion de PQR
- [OB-010-B](./OB-010-B/) - Gestion y respuesta de PQR
- [OB-010-C](./OB-010-C/) - Seguimiento de PQR para residentes
- [OB-010-D](./OB-010-D/) - Integracion con visibilidad de estados

## Criterios de Aceptacion Globales

- [ ] Residentes pueden crear PQR
- [ ] Radicacion automatica con numero unico
- [ ] Tiempos de respuesta monitoreados
- [ ] Administradores pueden gestionar y responder
- [ ] Historial completo y trazable
- [ ] Cambios de visibilidad via PQR funcionan

## Dependencias

- **Depende de**: OB-002 (usuarios)
- **Bloquea a**: OB-011 (cambios de visibilidad via PQR)

## Referencias

- SUMMARY.md - Seccion 9: Sistema de PQR
