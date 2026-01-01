# OB-002-B: Autenticacion con JWT

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-002 - Gestion de Usuarios y Autenticacion |
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, autenticacion, jwt, seguridad |
| Depends on | OB-002-A |

## User Story

**Como** usuario registrado
**Quiero** poder iniciar sesion con mi email y contrasena
**Para** acceder a las funcionalidades del sistema de forma segura

## Descripcion

Esta story implementa el sistema de autenticacion basado en JWT (JSON Web Tokens). Incluye el endpoint de login, generacion de tokens, middleware de verificacion, y logout.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-002-B-001](./OB-002-B-001.md) | Implementar endpoint de login | pending |
| [OB-002-B-002](./OB-002-B-002.md) | Generar y firmar JWT | pending |
| [OB-002-B-003](./OB-002-B-003.md) | Crear middleware de autenticacion | pending |
| [OB-002-B-004](./OB-002-B-004.md) | Implementar refresh token | pending |
| [OB-002-B-005](./OB-002-B-005.md) | Registrar eventos de login en auditoria | pending |

## Criterios de Aceptacion

- [ ] POST /api/auth/login retorna JWT valido
- [ ] El JWT contiene id, email y role del usuario
- [ ] Middleware protege rutas que requieren autenticacion
- [ ] Refresh token permite renovar access token
- [ ] Los eventos de login se registran con timestamp e IP

## Notas Tecnicas

- Usar RS256 o HS256 para firmar JWT
- Access token con expiracion corta (15-30 min)
- Refresh token con expiracion larga (7 dias)
- Almacenar refresh tokens en base de datos para invalidacion

## Dependencias

- **Depende de**: OB-002-A (usuarios deben existir)
- **Bloquea a**: OB-002-C (roles requieren autenticacion)
