# OB-007-C: Gestion de comprobantes

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-007 - Aportes Reales |
| Status | pending |
| Priority | medium |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, comprobantes, archivos |
| Depends on | OB-007-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** poder adjuntar comprobantes a los aportes
**Para** tener respaldo documental de cada transaccion

## Descripcion

Esta story implementa la funcionalidad de adjuntar y gestionar comprobantes/soportes para los aportes. Los comprobantes son evidencia documental que respalda la transaccion.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-007-C-001](./OB-007-C-001.md) | Implementar carga de comprobantes | pending |
| [OB-007-C-002](./OB-007-C-002.md) | Implementar visualizacion de comprobantes | pending |

## Criterios de Aceptacion

- [ ] Se pueden subir archivos como comprobante
- [ ] Formatos soportados: PDF, JPG, PNG
- [ ] Tamano maximo definido (ej: 5MB)
- [ ] Comprobantes son consultables por admin y residente
- [ ] Los comprobantes no se pueden eliminar (inmutabilidad)

## Notas Tecnicas

- Usar almacenamiento de archivos (S3, local, etc.)
- Considerar compresion de imagenes
- Los archivos son inmutables como los aportes

## Dependencias

- **Depende de**: OB-007-A
- **Bloquea a**: OB-009 (exportacion incluye comprobantes)
