# OB-007: Aportes Reales

## Metadata

| Campo | Valor |
|-------|-------|
| Status | pending |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | epic, aportes, recaudo, inmutabilidad, transparencia |
| Depends on | OB-003, OB-005, OB-006 |

## Descripcion

Esta epica implementa el registro de aportes reales, que segun SUMMARY.md seccion 4.5 son el registro contable del dinero efectivamente recibido. Esta es la funcionalidad mas critica del sistema ya que representa el flujo real de dinero y debe cumplir estrictamente con los principios de trazabilidad e inmutabilidad.

## Objetivo

Implementar el registro seguro y auditable de aportes reales, garantizando que cada peso recaudado quede documentado con fecha, responsable, medio de pago y comprobante, cumpliendo con los principios de transparencia del sistema.

## Alcance

### Incluido
- Modelo de aporte con todos los atributos del SUMMARY
- Registro de aportes por administradores
- Estados de aporte (pendiente, confirmado, anulado)
- Soporte para comprobantes/soportes
- Inmutabilidad: aportes no se eliminan, se anulan con justificacion
- Historial completo de cada aporte
- Asociacion a compromiso (opcional) y actividad (obligatoria)

### Excluido
- Pagos online/pasarelas de pago
- Conciliacion bancaria automatica
- Recibos digitales firmados

## Estructura

### Stories
- [OB-007-A](./OB-007-A/) - Modelo y registro de aportes
- [OB-007-B](./OB-007-B/) - Estados e inmutabilidad de aportes
- [OB-007-C](./OB-007-C/) - Gestion de comprobantes
- [OB-007-D](./OB-007-D/) - Visualizacion de aportes para residentes

## Criterios de Aceptacion Globales

- [ ] Aportes registrados con todos los campos del SUMMARY
- [ ] Los aportes NUNCA se eliminan fisicamente
- [ ] Anulaciones requieren justificacion documentada
- [ ] Cada aporte tiene historial de cambios
- [ ] Comprobantes pueden adjuntarse y consultarse
- [ ] Residentes pueden ver sus propios aportes
- [ ] Auditoria completa de todas las operaciones

## Dependencias

- **Depende de**: OB-003 (apartamentos), OB-005 (actividades), OB-006 (compromisos opcional)
- **Bloquea a**: OB-008 (calculo de avance), OB-009 (reportes), OB-011 (estados de cuenta)

## Referencias

- SUMMARY.md - Seccion 4.5: Aportes Reales
- Principios de Transparencia: Trazabilidad, Inmutabilidad, Auditoria
