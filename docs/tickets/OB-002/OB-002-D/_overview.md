# OB-002-D: Gestion de perfil de usuario

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-002 - Gestion de Usuarios y Autenticacion |
| Status | pending |
| Priority | medium |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, perfil, usuario |
| Depends on | OB-002-B |

## User Story

**Como** usuario autenticado
**Quiero** poder ver y editar mi perfil
**Para** mantener mi informacion actualizada y recuperar acceso si olvido mi contrasena

## Descripcion

Esta story cubre las funcionalidades de gestion del perfil de usuario, incluyendo visualizacion de datos, edicion de informacion personal, cambio de contrasena, y recuperacion de contrasena olvidada.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-002-D-001](./OB-002-D-001.md) | Crear endpoint para ver perfil propio | pending |
| [OB-002-D-002](./OB-002-D-002.md) | Crear endpoint para editar perfil | pending |
| [OB-002-D-003](./OB-002-D-003.md) | Implementar cambio de contrasena | pending |
| [OB-002-D-004](./OB-002-D-004.md) | Implementar recuperacion de contrasena | pending |

## Criterios de Aceptacion

- [ ] Usuario puede ver su perfil completo
- [ ] Usuario puede editar nombre, telefono
- [ ] Usuario puede cambiar su contrasena (requiere actual)
- [ ] Recuperacion de contrasena via email funciona
- [ ] Los cambios quedan registrados en auditoria

## Notas Tecnicas

- El email no debe poder cambiarse (es identificador)
- El cambio de contrasena requiere contrasena actual
- La recuperacion genera token de un solo uso
- Considerar rate limiting en recuperacion

## Dependencias

- **Depende de**: OB-002-B (requiere autenticacion)
- **Bloquea a**: OB-013 (notificaciones de recuperacion)
