# OB-003-B: Modelo y gestion de apartamentos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-003 - Gestion de Copropiedades y Apartamentos |
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, apartamentos, modelo |
| Depends on | OB-003-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder registrar y gestionar los apartamentos
**Para** tener un registro completo de las unidades que participan en las actividades de recaudo

## Descripcion

Esta story cubre la creacion del modelo de apartamento y los endpoints para su gestion. Los apartamentos son las unidades basicas que realizan compromisos y aportes.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-003-B-001](./OB-003-B-001.md) | Crear entidad Apartamento con TypeORM | pending |
| [OB-003-B-002](./OB-003-B-002.md) | Implementar CRUD de apartamentos | pending |
| [OB-003-B-003](./OB-003-B-003.md) | Implementar carga masiva de apartamentos | pending |
| [OB-003-B-004](./OB-003-B-004.md) | Validar unicidad de apartamento en copropiedad | pending |

## Criterios de Aceptacion

- [ ] Modelo Apartamento con campos del SUMMARY.md
- [ ] CRUD completo para administradores
- [ ] Carga masiva desde CSV/Excel
- [ ] Numero de apartamento unico por torre/copropiedad
- [ ] Apartamentos pueden activarse/desactivarse

## Notas Tecnicas

- Numero de apartamento + torre debe ser unico
- Soportar apartamentos sin torre (conjunto simple)
- Los apartamentos desactivados no aparecen en listados normales

## Dependencias

- **Depende de**: OB-003-A (copropiedad y torres)
- **Bloquea a**: OB-003-C, OB-006, OB-007
