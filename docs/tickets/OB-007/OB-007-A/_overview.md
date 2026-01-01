# OB-007-A: Modelo y registro de aportes

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-007 - Aportes Reales |
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, aportes, modelo, registro |
| Depends on | OB-003-B, OB-005-A, OB-006-A |

## User Story

**Como** administrador de una copropiedad
**Quiero** registrar los aportes reales recibidos
**Para** tener un registro contable preciso y auditable del dinero recaudado

## Descripcion

Esta story implementa el modelo de datos y los endpoints para registro de aportes. Un aporte representa dinero efectivamente recibido, a diferencia del compromiso que es solo una intencion.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-007-A-001](./OB-007-A-001.md) | Crear entidad Aporte con TypeORM | pending |
| [OB-007-A-002](./OB-007-A-002.md) | Implementar endpoint de registro de aporte | pending |
| [OB-007-A-003](./OB-007-A-003.md) | Validar aporte segun tipo de actividad | pending |
| [OB-007-A-004](./OB-007-A-004.md) | Asociar aporte a compromiso automaticamente | pending |

## Criterios de Aceptacion

- [ ] Modelo Aporte con todos los atributos del SUMMARY
- [ ] Registro requiere: monto, fecha, medio de pago
- [ ] Asociacion a actividad (obligatoria) y compromiso (opcional)
- [ ] Estado inicial: PENDIENTE (hasta confirmar)
- [ ] Validacion segun tipo de actividad

## Notas Tecnicas

- El aporte es la entidad financiera critica del sistema
- Requiere maxima trazabilidad y auditoria
- Los medios de pago son configurables

## Dependencias

- **Depende de**: OB-003-B, OB-005-A, OB-006-A
- **Bloquea a**: OB-007-B, OB-007-C, OB-008
