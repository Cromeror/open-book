# OB-002-A: Modelo de usuario y registro

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-002 - Gestion de Usuarios y Autenticacion |
| Status | in_progress |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2026-01-05 |
| Labels | story, usuarios, registro |
| Depends on | OB-001-B |

## User Story

**Como** persona interesada en usar OpenBook
**Quiero** poder registrarme en el sistema con mis datos basicos
**Para** acceder a las funcionalidades de la plataforma segun mis permisos

## Descripcion

Esta story cubre la creacion del modelo de usuario en la base de datos y la implementacion del flujo de registro. El registro debe capturar la informacion necesaria y el consentimiento de visibilidad de estados de cuenta segun la Ley 1581 de 2012.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-002-A-001](./OB-002-A-001.md) | Crear entidad User con TypeORM | done |
| [OB-002-A-002](./OB-002-A-002.md) | Implementar endpoint de registro | done |
| [OB-002-A-003](./OB-002-A-003.md) | Validar datos de registro | done |
| [OB-002-A-004](./OB-002-A-004.md) | Implementar hash de contrasena con bcrypt | done |
| [OB-002-A-005](./OB-002-A-005.md) | Registrar consentimiento de visibilidad | done |
| [OB-002-A-006](./OB-002-A-006.md) | Actualizar entidad User (eliminar roles) | pending |

## Criterios de Aceptacion

- [x] El modelo User tiene todos los campos necesarios
- [x] El endpoint POST /api/auth/register funciona correctamente
- [x] La validacion rechaza datos invalidos con mensajes claros
- [x] Las contrasenas se almacenan hasheadas, nunca en texto plano
- [x] El consentimiento de visibilidad se registra obligatoriamente
- [ ] Entidad User actualizada sin campo role (nueva arquitectura)

## Notas Tecnicas

- Usar bcrypt con salt rounds >= 10
- Validar formato de email y fortaleza de contrasena
- El campo de consentimiento debe ser booleano con fecha de aceptacion
- Cumplir con Ley 1581 de 2012 para tratamiento de datos

## Dependencias

- **Depende de**: OB-001-B (base de datos configurada)
- **Bloquea a**: OB-002-B (autenticacion requiere usuarios)
