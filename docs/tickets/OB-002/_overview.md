# OB-002: Gestion de Usuarios y Autenticacion

## Metadata

| Campo | Valor |
|-------|-------|
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | epic, usuarios, autenticacion, seguridad |
| Depends on | OB-001 |

## Descripcion

Esta epica cubre todo el sistema de gestion de usuarios, incluyendo registro, autenticacion, autorizacion basada en roles, y gestion de perfiles. El sistema debe soportar diferentes tipos de usuarios (administradores y residentes) con permisos diferenciados segun lo definido en el SUMMARY.md.

## Objetivo

Implementar un sistema de autenticacion y autorizacion robusto y seguro que permita gestionar los diferentes roles del sistema (administrador, residente) con sus respectivos permisos, garantizando el acceso controlado a la informacion segun los principios de transparencia.

## Alcance

### Incluido
- Modelo de usuario con campos requeridos
- Registro de usuarios con validacion
- Autenticacion con JWT
- Roles: administrador, residente
- Permisos basados en roles
- Recuperacion de contrasena
- Perfil de usuario editable
- Consentimiento de visibilidad de estados de cuenta (Ley 1581)

### Excluido
- Autenticacion con proveedores externos (Google, Facebook)
- Autenticacion de dos factores (2FA) - puede ser fase futura
- Single Sign-On (SSO)

## Estructura

### Stories
- [OB-002-A](./OB-002-A/) - Modelo de usuario y registro
- [OB-002-B](./OB-002-B/) - Autenticacion con JWT
- [OB-002-C](./OB-002-C/) - Sistema de roles y permisos
- [OB-002-D](./OB-002-D/) - Gestion de perfil de usuario

## Criterios de Aceptacion Globales

- [ ] Los usuarios pueden registrarse con email y contrasena
- [ ] El login retorna un token JWT valido
- [ ] Los endpoints protegidos verifican autenticacion
- [ ] Los permisos se verifican segun el rol del usuario
- [ ] Las contrasenas se almacenan hasheadas (bcrypt)
- [ ] El consentimiento de visibilidad se registra en el momento del registro
- [ ] Existe auditoria de login/logout

## Dependencias

- **Depende de**: OB-001 (infraestructura base)
- **Bloquea a**: OB-003, OB-011 (requieren sistema de usuarios)

## Referencias

- SUMMARY.md - Seccion 7: Funcionalidades para Administracion y Residentes
- Ley 1581 de 2012 - Habeas Data (consentimiento de datos)
