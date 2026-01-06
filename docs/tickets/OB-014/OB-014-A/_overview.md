# OB-014-A: Contexto de autenticacion y proteccion de rutas

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Rol de Usuario |
| Status | pending |
| Priority | critical |
| Created | 2026-01-05 |
| Updated | 2026-01-05 |
| Labels | story, frontend, auth, context |
| Depends on | OB-002-B |

## User Story

**Como** usuario de la aplicacion
**Quiero** que mi sesion se mantenga y las rutas esten protegidas
**Para** acceder solo a las funcionalidades permitidas segun mi rol

## Descripcion

Esta story implementa el sistema de autenticacion en el frontend, incluyendo el contexto de React para manejar el estado de sesion, hooks personalizados y proteccion de rutas mediante middleware de Next.js.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-014-A-001](./OB-014-A-001.md) | Crear AuthContext y AuthProvider | pending |
| [OB-014-A-002](./OB-014-A-002.md) | Implementar hook useAuth | pending |
| [OB-014-A-003](./OB-014-A-003.md) | Crear middleware de proteccion de rutas | pending |
| [OB-014-A-004](./OB-014-A-004.md) | Implementar componentes AuthGuard y RoleGuard | pending |
| [OB-014-A-005](./OB-014-A-005.md) | Crear pagina de acceso denegado | pending |

## Criterios de Aceptacion

- [ ] AuthContext provee estado de usuario, login, logout
- [ ] useAuth hook disponible en toda la aplicacion
- [ ] Middleware protege rutas /admin/* y /resident/*
- [ ] AuthGuard redirige a /login si no hay sesion
- [ ] RoleGuard redirige a /acceso-denegado si rol no permitido
- [ ] Token JWT se almacena de forma segura (httpOnly cookie preferido)
- [ ] Refresh token funciona correctamente
