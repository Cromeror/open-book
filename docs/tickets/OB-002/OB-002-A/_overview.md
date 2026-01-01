# OB-002-A: Modelo de usuario y registro

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-002 - Gestion de Usuarios y Autenticacion |
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, usuarios, registro |
| Depends on | OB-001-B |

## User Story

**Como** persona interesada en usar OpenBook
**Quiero** poder registrarme en el sistema con mis datos basicos
**Para** acceder a las funcionalidades de la plataforma segun mi rol

## Descripcion

Esta story cubre la creacion del modelo de usuario en la base de datos y la implementacion del flujo de registro. El registro debe capturar la informacion necesaria y el consentimiento de visibilidad de estados de cuenta segun la Ley 1581 de 2012.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-002-A-001](./OB-002-A-001.md) | Crear entidad User con TypeORM | pending |
| [OB-002-A-002](./OB-002-A-002.md) | Implementar endpoint de registro | pending |
| [OB-002-A-003](./OB-002-A-003.md) | Validar datos de registro | pending |
| [OB-002-A-004](./OB-002-A-004.md) | Implementar hash de contrasena con bcrypt | pending |
| [OB-002-A-005](./OB-002-A-005.md) | Registrar consentimiento de visibilidad | pending |

## Criterios de Aceptacion

- [ ] El modelo User tiene todos los campos necesarios
- [ ] El endpoint POST /api/auth/register funciona correctamente
- [ ] La validacion rechaza datos invalidos con mensajes claros
- [ ] Las contrasenas se almacenan hasheadas, nunca en texto plano
- [ ] El consentimiento de visibilidad se registra obligatoriamente

## Notas Tecnicas

- Usar bcrypt con salt rounds >= 10
- Validar formato de email y fortaleza de contrasena
- El campo de consentimiento debe ser booleano con fecha de aceptacion
- Cumplir con Ley 1581 de 2012 para tratamiento de datos

## Dependencias

- **Depende de**: OB-001-B (base de datos configurada)
- **Bloquea a**: OB-002-B (autenticacion requiere usuarios)
