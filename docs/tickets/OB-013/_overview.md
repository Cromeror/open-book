# OB-013: Notificaciones

## Metadata

| Campo | Valor |
|-------|-------|
| Status | pending |
| Priority | medium |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | epic, notificaciones, email, comunicacion |
| Depends on | OB-002 |

## Descripcion

Sistema de notificaciones para mantener informados a los usuarios sobre eventos relevantes en el sistema OpenBook.

## Objetivo

Implementar un sistema de notificaciones multicanal que mantenga a residentes y administradores informados sobre eventos importantes relacionados con objetivos, aportes, PQR y cambios de visibilidad.

## Alcance

- Modelo de notificaciones
- Notificaciones por email
- Notificaciones in-app
- Preferencias de notificación por usuario
- Templates de notificación

## Estructura

| ID | Story | Status |
|----|-------|--------|
| [OB-013-A](./OB-013-A/_overview.md) | Modelo de notificaciones | pending |
| [OB-013-B](./OB-013-B/_overview.md) | Notificaciones por email | pending |
| [OB-013-C](./OB-013-C/_overview.md) | Notificaciones in-app | pending |
| [OB-013-D](./OB-013-D/_overview.md) | Preferencias de notificación | pending |

## Criterios de Aceptacion

- [ ] Usuarios reciben notificaciones de eventos relevantes
- [ ] Email funcional con templates profesionales
- [ ] Notificaciones in-app consultables
- [ ] Usuarios pueden configurar sus preferencias
- [ ] Notificaciones obligatorias no pueden deshabilitarse

## Dependencias

- **Depende de**: OB-002 (Usuarios), OB-011 (Visibilidad - notificaciones obligatorias)
- **Bloquea a**: Ninguno

## Notas Tecnicas

- Integración con servicio de email (SendGrid, SES, etc.)
- Cola de notificaciones para procesamiento asíncrono
- Distinción entre notificaciones opcionales y obligatorias (Ley 1581)
- Registro de notificaciones enviadas para auditoría

## Referencias

- SUMMARY.md - Notificaciones por cambios de visibilidad
- Ley 1581 de 2012 - Notificación obligatoria de cambios
