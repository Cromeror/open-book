# OB-002-C: Sistema de roles y permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-002 - Gestion de Usuarios y Autenticacion |
| Status | pending |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, roles, permisos, autorizacion |
| Depends on | OB-002-B |

## User Story

**Como** administrador del sistema
**Quiero** que existan roles diferenciados con permisos especificos
**Para** controlar el acceso a las funcionalidades segun el tipo de usuario

## Descripcion

Esta story implementa el sistema de autorizacion basado en roles (RBAC). Segun el SUMMARY.md, existen dos roles principales: Administrador y Residente, cada uno con diferentes permisos sobre las funcionalidades del sistema.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-002-C-001](./OB-002-C-001.md) | Definir permisos por rol | pending |
| [OB-002-C-002](./OB-002-C-002.md) | Crear middleware de autorizacion | pending |
| [OB-002-C-003](./OB-002-C-003.md) | Implementar decoradores de permisos | pending |
| [OB-002-C-004](./OB-002-C-004.md) | Crear endpoint para cambiar rol de usuario | pending |

## Criterios de Aceptacion

- [ ] Roles ADMIN y RESIDENT definidos con permisos claros
- [ ] Middleware verifica permisos antes de ejecutar accion
- [ ] Administradores pueden acceder a todas las funcionalidades
- [ ] Residentes solo acceden a funcionalidades permitidas
- [ ] Cambio de rol queda registrado en auditoria

## Notas Tecnicas

- Usar patron RBAC (Role-Based Access Control)
- Permisos definidos como constantes/enum
- Middleware reutilizable para proteger rutas
- Considerar permisos granulares para futuro

## Dependencias

- **Depende de**: OB-002-B (requiere autenticacion)
- **Bloquea a**: Todos los modulos que requieren control de acceso
