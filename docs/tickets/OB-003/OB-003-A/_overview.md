# OB-003-A: Modelo y gestion de copropiedades

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-003 - Gestion de Copropiedades y Apartamentos |
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, copropiedad, modelo |
| Depends on | OB-001-B, OB-002-C |

## User Story

**Como** administrador del sistema
**Quiero** poder crear y gestionar copropiedades
**Para** organizar los apartamentos y actividades de recaudo por unidad residencial

## Descripcion

Esta story cubre la creacion del modelo de copropiedad y los endpoints para su gestion. Una copropiedad representa una unidad residencial completa (edificio, conjunto residencial, etc.).

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-003-A-001](./OB-003-A-001.md) | Crear entidad Copropiedad con TypeORM | pending |
| [OB-003-A-002](./OB-003-A-002.md) | Implementar CRUD de copropiedades | pending |
| [OB-003-A-003](./OB-003-A-003.md) | Vincular administradores a copropiedades | pending |
| [OB-003-A-004](./OB-003-A-004.md) | Implementar configuracion de torres/bloques | pending |

## Criterios de Aceptacion

- [ ] Modelo Copropiedad creado con campos requeridos
- [ ] CRUD completo (crear, leer, actualizar, desactivar)
- [ ] Solo administradores pueden crear/editar copropiedades
- [ ] Un administrador puede gestionar multiples copropiedades
- [ ] Las copropiedades tienen auditoria completa

## Notas Tecnicas

- No se eliminan fisicamente, se desactivan (soft delete)
- Considerar multi-tenancy si se requiere aislamiento de datos
- Las torres/bloques son opcionales

## Dependencias

- **Depende de**: OB-001-B, OB-002-C
- **Bloquea a**: OB-003-B (apartamentos requieren copropiedad)
