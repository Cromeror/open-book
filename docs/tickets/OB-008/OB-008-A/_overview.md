# OB-008-A: Motor de calculo de avance

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-008 - Calculo y Visualizacion de Avance |
| Status | pending |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | story, calculo, motor |
| Depends on | OB-007-B |

## User Story

**Como** sistema
**Quiero** calcular automaticamente el avance de los objetivos
**Para** proveer informacion precisa a todos los usuarios

## Descripcion

Implementar el motor de calculo que computa el avance de objetivos basandose en los aportes confirmados asociados a sus actividades.

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-008-A-001](./OB-008-A-001.md) | Implementar servicio de calculo de avance | pending |
| [OB-008-A-002](./OB-008-A-002.md) | Calcular metricas por actividad | pending |
| [OB-008-A-003](./OB-008-A-003.md) | Implementar cache de calculos | pending |

## Criterios de Aceptacion

- [ ] Calculo preciso segun formula del SUMMARY
- [ ] Solo suma aportes en estado CONFIRMADO
- [ ] Metricas disponibles por objetivo y por actividad
- [ ] Cache para optimizar performance

## Dependencias

- **Depende de**: OB-007-B
- **Bloquea a**: OB-008-B, OB-008-C
