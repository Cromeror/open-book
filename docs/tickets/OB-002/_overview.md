# OB-002: Gestion de Usuarios y Autenticacion

## Metadata

| Campo | Valor |
|-------|-------|
| Status | in_progress |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2026-01-09 |
| Labels | epic, usuarios, autenticacion, seguridad, permisos |
| Depends on | OB-001 |

## Descripcion

Esta epica cubre todo el sistema de gestion de usuarios, incluyendo registro, autenticacion, y autorizacion basada en permisos por modulos. El sistema tiene un SuperAdmin unico y usuarios regulares que reciben permisos granulares.

## Objetivo

Implementar un sistema de autenticacion y autorizacion robusto y seguro basado en modulos y permisos granulares, donde:
- Existe un **SuperAdmin unico** con acceso total
- Los **usuarios regulares** reciben permisos especificos por modulo
- Los **pools de usuarios** permiten agrupar permisos comunes

## Alcance

### Incluido
- Modelo de usuario con campos requeridos
- Registro de usuarios con validacion
- Autenticacion con JWT
- SuperAdmin unico (configurado en sistema)
- Sistema de permisos basado en modulos
- Permisos granulares por accion (create, read, update, delete)
- Scopes de permisos (own, copropiedad, all)
- Pools de usuarios para permisos compartidos
- Recuperacion de contrasena
- Perfil de usuario editable
- Consentimiento de visibilidad de estados de cuenta (Ley 1581)

### Excluido
- Roles predefinidos (admin/resident) - reemplazados por permisos
- Autenticacion con proveedores externos (Google, Facebook)
- Autenticacion de dos factores (2FA) - puede ser fase futura
- Single Sign-On (SSO)

## Estructura

### Stories
- [OB-002-A](./OB-002-A/) - Modelo de usuario y registro
- [OB-002-B](./OB-002-B/) - Autenticacion con JWT
- [OB-002-C](./OB-002-C/) - Sistema de permisos por modulos
- [OB-002-D](./OB-002-D/) - Gestion de perfil de usuario

## Arquitectura de Permisos

```
┌────────────────────────────────────────────────────────┐
│                      USUARIOS                           │
├────────────────────────────────────────────────────────┤
│  SuperAdmin (unico)                                     │
│  └─> Acceso total a todo el sistema                    │
│                                                         │
│  Usuarios Regulares                                     │
│  └─> Permisos asignados por modulo                     │
│      └─> Permisos directos                             │
│      └─> Permisos via pools                            │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                      MODULOS                            │
├────────────────────────────────────────────────────────┤
│  Cada modulo tiene permisos granulares:                 │
│  - objetivos: create, read, update, delete             │
│  - aportes: create, read, update                       │
│  - reportes: read, export                              │
│  - etc.                                                 │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                       SCOPES                            │
├────────────────────────────────────────────────────────┤
│  own: Solo recursos propios del usuario                │
│  copropiedad: Recursos de una copropiedad especifica   │
│  all: Todos los recursos (solo SuperAdmin)             │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                       POOLS                             │
├────────────────────────────────────────────────────────┤
│  Grupos de usuarios con permisos identicos:            │
│  - "Admins Edificio Centro"                            │
│  - "Comite Financiero Torre A"                         │
│  - etc.                                                 │
│                                                         │
│  Usuario hereda permisos de todos sus pools            │
└────────────────────────────────────────────────────────┘
```

## Flujo de Verificacion de Permisos

```
1. ¿Es SuperAdmin? → SI: Permitir todo
2. ¿Autenticado? → NO: 401
3. ¿Tiene acceso al modulo (directo o pool)? → NO: 403
4. ¿Tiene permiso granular (directo o pool)? → NO: 403
5. ¿Scope permite acceso al recurso? → NO: 403
6. Permitir acceso
```

## Criterios de Aceptacion Globales

- [x] Los usuarios pueden registrarse con email y contrasena
- [x] El login retorna un token JWT valido
- [x] Los endpoints protegidos verifican autenticacion
- [x] SuperAdmin tiene acceso total sin restricciones
- [x] Permisos se verifican a nivel de modulo y granular
- [x] Pools permiten asignar permisos a grupos
- [x] Las contrasenas se almacenan hasheadas (bcrypt)
- [x] El consentimiento de visibilidad se registra en el momento del registro
- [x] Existe auditoria de login/logout y cambios de permisos

## Dependencias

- **Depende de**: OB-001 (infraestructura base)
- **Bloquea a**: OB-003, OB-011 (requieren sistema de usuarios)

## Referencias

- SUMMARY.md - Seccion 7: Funcionalidades para Administracion y Residentes
- Ley 1581 de 2012 - Habeas Data (consentimiento de datos)
