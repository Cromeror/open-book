# OB-008: Calculo y Visualizacion de Avance

## Metadata

| Campo | Valor |
|-------|-------|
| Status | pending |
| Priority | high |
| Created | 2025-12-31 |
| Updated | 2025-12-31 |
| Labels | epic, calculo, avance, visualizacion |
| Depends on | OB-004, OB-007 |

## Descripcion

Esta epica implementa el calculo automatico del avance de recaudo segun SUMMARY.md seccion 5: total recaudado, faltante, y porcentaje de avance. Incluye visualizaciones para administradores y residentes.

## Objetivo

Proveer calculos precisos y en tiempo real del progreso de cada objetivo de recaudo, permitiendo a todos los interesados conocer el estado actual de las metas economicas.

## Alcance

### Incluido
- Calculo de total recaudado (suma de aportes confirmados)
- Calculo de faltante (objetivo - recaudado)
- Porcentaje de avance
- Dashboard de avance para administradores
- Visualizacion de avance para residentes
- Metricas por actividad

### Excluido
- Proyecciones futuras automaticas
- Graficos de tendencias historicas

## Estructura

### Stories
- [OB-008-A](./OB-008-A/) - Motor de calculo de avance
- [OB-008-B](./OB-008-B/) - Dashboard de avance para administradores
- [OB-008-C](./OB-008-C/) - Visualizacion de avance para residentes

## Criterios de Aceptacion Globales

- [ ] Calculos son precisos y en tiempo real
- [ ] Solo se contabilizan aportes CONFIRMADOS
- [ ] Dashboard muestra avance por objetivo y actividad
- [ ] Residentes ven avance agregado (sin detalles de otros)
- [ ] Performance aceptable con muchos registros

## Dependencias

- **Depende de**: OB-004 (objetivos), OB-007 (aportes confirmados)
- **Bloquea a**: OB-009 (reportes usan calculos)

## Referencias

- SUMMARY.md - Seccion 5: Calculo de Avance del Objetivo
