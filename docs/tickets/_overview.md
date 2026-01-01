# OpenBook - Estructura de Tickets

## Descripcion

Este directorio contiene la estructura completa de EPICAS, STORIES y TASKS para el sistema **OpenBook - Gestion transparente de copropiedades**.

## Principios de Diseno

El sistema sigue los principios de transparencia definidos en SUMMARY.md:

1. **Trazabilidad**: Todas las operaciones quedan registradas con autor, fecha y detalles
2. **Inmutabilidad**: Los aportes no se eliminan, solo se anulan con justificacion
3. **Auditoria**: Sistema de logs completo para todas las operaciones criticas
4. **Claridad**: Distincion clara entre Compromisos (intenciones) y Aportes (pagos reales)
5. **Acceso Controlado**: Cumplimiento de Ley 1581 de 2012 (Habeas Data)

## Estructura de Epicas

| ID | Epic | Priority | Status |
|----|------|----------|--------|
| [OB-001](./OB-001/_overview.md) | Configuracion e Infraestructura del Proyecto | critical | pending |
| [OB-002](./OB-002/_overview.md) | Gestion de Usuarios y Autenticacion | critical | pending |
| [OB-003](./OB-003/_overview.md) | Gestion de Copropiedades y Apartamentos | high | pending |
| [OB-004](./OB-004/_overview.md) | Objetivos de Recaudo | high | pending |
| [OB-005](./OB-005/_overview.md) | Actividades de Recaudo | high | pending |
| [OB-006](./OB-006/_overview.md) | Compromisos de Aporte | high | pending |
| [OB-007](./OB-007/_overview.md) | Aportes Reales | critical | pending |
| [OB-008](./OB-008/_overview.md) | Calculo y Visualizacion de Avance | medium | pending |
| [OB-009](./OB-009/_overview.md) | Reportes y Exportacion | medium | pending |
| [OB-010](./OB-010/_overview.md) | Sistema de PQR | medium | pending |
| [OB-011](./OB-011/_overview.md) | Visibilidad de Estados de Cuenta | high | pending |
| [OB-012](./OB-012/_overview.md) | Auditoria y Trazabilidad | high | pending |
| [OB-013](./OB-013/_overview.md) | Notificaciones | medium | pending |

## Orden de Implementacion Sugerido

### Fase 1: Fundamentos (Semanas 1-3)
1. OB-001: Configuracion e Infraestructura
2. OB-002: Usuarios y Autenticacion

### Fase 2: Dominio Core (Semanas 4-7)
3. OB-003: Copropiedades y Apartamentos
4. OB-004: Objetivos de Recaudo
5. OB-005: Actividades de Recaudo
6. OB-006: Compromisos de Aporte
7. OB-007: Aportes Reales

### Fase 3: Transparencia y Visualizacion (Semanas 8-10)
8. OB-008: Calculo y Visualizacion de Avance
9. OB-011: Visibilidad de Estados de Cuenta
10. OB-012: Auditoria y Trazabilidad

### Fase 4: Features Adicionales (Semanas 11-13)
11. OB-009: Reportes y Exportacion
12. OB-010: Sistema de PQR
13. OB-013: Notificaciones

## Estadisticas

- **Total Epicas**: 13
- **Total Stories**: ~40
- **Total Tasks**: ~120+
- **Estimacion Total**: 13-15 semanas

## Convenciones

### Nomenclatura
- **Epic**: OB-XXX (ej: OB-001)
- **Story**: OB-XXX-Y (ej: OB-001-A)
- **Task**: OB-XXX-Y-ZZZ (ej: OB-001-A-001)

### Estados
- `pending`: No iniciado
- `in_progress`: En desarrollo
- `review`: En revision
- `completed`: Completado
- `blocked`: Bloqueado por dependencia

### Prioridades
- `critical`: Bloqueante para el sistema
- `high`: Funcionalidad core
- `medium`: Importante pero no urgente
- `low`: Nice-to-have

## Referencias

- [SUMMARY.md](/SUMMARY.md) - Requisitos del sistema
- [task-refiner.md](/.claude/agents/task-refiner.md) - Formato de tickets
