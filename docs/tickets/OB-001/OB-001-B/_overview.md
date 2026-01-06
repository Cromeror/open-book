# OB-001-B: Configuracion de base de datos y ORM

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-001 - Configuracion e Infraestructura del Proyecto |
| Status | done |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2026-01-05 |
| Labels | story, database, orm |
| Depends on | OB-001-A |

## User Story

**Como** desarrollador del proyecto
**Quiero** tener la base de datos configurada con un ORM robusto
**Para** poder modelar las entidades del sistema con trazabilidad y auditoria incorporadas

## Descripcion

Esta story cubre la configuracion completa de la capa de persistencia, incluyendo la conexion a la base de datos, configuracion de TypeORM, creacion del sistema de migraciones, y la implementacion de campos de auditoria base que se usaran en todas las entidades.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-001-B-001](./OB-001-B-001.md) | Configurar conexion a PostgreSQL | done |
| [OB-001-B-002](./OB-001-B-002.md) | Instalar y configurar TypeORM | done |
| [OB-001-B-003](./OB-001-B-003.md) | Crear modelo base con campos de auditoria | done |
| [OB-001-B-004](./OB-001-B-004.md) | Configurar sistema de migraciones | done |
| [OB-001-B-005](./OB-001-B-005.md) | Implementar soft delete para inmutabilidad | done |

## Criterios de Aceptacion

- [x] La conexion a PostgreSQL funciona correctamente
- [x] TypeORM esta configurado con las entidades del proyecto
- [x] Las migraciones se ejecutan automaticamente
- [x] Todas las entidades tendran campos de auditoria (createdAt, updatedAt, createdBy)
- [x] El soft delete esta implementado para cumplir con inmutabilidad

## Notas Tecnicas

- Usar TypeORM con decoradores para definir entidades
- Los campos de auditoria son criticos para los principios de transparencia
- Considerar usar subscribers de TypeORM para auditoria adicional
- El soft delete (deletedAt) reemplaza el delete fisico

## Dependencias

- **Depende de**: OB-001-A (setup inicial)
- **Bloquea a**: OB-002, OB-003 (requieren modelos de BD)
