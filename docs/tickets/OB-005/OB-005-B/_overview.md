# OB-005-B: Tipos y configuracion de actividades

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-005 - Actividades de Recaudo |
| Status | pending |
| Priority | medium |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, tipos, configuracion |
| Depends on | OB-005-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder configurar diferentes tipos de actividades con sus caracteristicas
**Para** adaptar el sistema a las diferentes formas de recaudo que usamos

## Descripcion

Esta story define los tipos de actividades soportados y permite configuraciones especificas para cada tipo (ej: rifas pueden tener precio de boleta, donaciones no).

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-005-B-001](./OB-005-B-001.md) | Definir configuracion por tipo de actividad | pending |
| [OB-005-B-002](./OB-005-B-002.md) | Implementar validaciones especificas por tipo | pending |
| [OB-005-B-003](./OB-005-B-003.md) | Implementar cambio de estado de actividad | pending |

## Criterios de Aceptacion

- [ ] Tipos de actividad definidos con configuracion
- [ ] Cada tipo puede tener campos especificos
- [ ] Validaciones especificas por tipo funcionan
- [ ] Estados de actividad manejados correctamente

## Notas Tecnicas

- Usar campos JSON para configuracion flexible por tipo
- Tipos iniciales: RIFA, DONACION, EVENTO, VENTA, CUOTA, OTRO
- Considerar extensibilidad para tipos personalizados

## Dependencias

- **Depende de**: OB-005-A
- **Bloquea a**: OB-006-A (compromisos por tipo de actividad)
