# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OpenBook** is a transparent financial management system for condominiums (copropiedades) in Colombia. It manages fundraising objectives, contribution tracking, and provides transparency between administration and residents.

Key domain concepts:
- **Objetivo de Recaudo**: Fundraising goals with target amounts and deadlines
- **Actividades de Recaudo**: Activities (raffles, donations, events) linked to objectives
- **Compromisos**: Pledged contributions by apartments (not actual money)
- **Aportes Reales**: Actual contributions received (the real accounting records)
- **PQR**: Petitions, complaints, and claims system (required for visibility changes)

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Monorepo | Nx | ^19.x |
| Package Manager | pnpm | ^8.x |
| Backend | NestJS | ^10.x |
| Frontend | Next.js | ^14.x |
| Database | PostgreSQL | 16 |
| ORM | TypeORM | ^0.3.x |
| Runtime | Node.js | ^20.x |
| Language | TypeScript | ^5.x |
| Forms | React Hook Form | ^7.x |
| Validation | Zod | ^3.x |
| Styling | Tailwind CSS | ^3.x |
| HTTP Client | Axios | ^1.x |

## Project Status

This project is in the **planning/specification phase**. Core documents:
- `SUMMARY.md` - Complete system specification and requirements
- `EPICAS_Y_TAREAS.md` - Epics and tasks breakdown
- `docs/tickets/` - Ticket tracking (Jira-like structure with OB-XXX naming)

## Custom Agents

Two specialized agents are configured in `.claude/agents/`:

### task-refiner
Use for organizing epics, stories, and tasks. Follows a hierarchical structure:
```
docs/tickets/
├── OB-001/                 # Epic (folder)
│   ├── _overview.md        # Epic overview
│   ├── OB-001-A/           # Story (subfolder)
│   │   ├── _overview.md    # Story overview
│   │   └── OB-001-A-001.md # Task
```

Naming: `OB-XXX` (Epic) → `OB-XXX-Y` (Story) → `OB-XXX-Y-ZZZ` (Task)

### user-story-estimator
Use for effort estimation. Outputs CSV with:
- Optimistic/pessimistic estimates in hours
- 25% buffer calculation
- Uses comma as decimal separator (Spanish format: 8,5 not 8.5)

## Legal Compliance Requirements

Colombian Law 1581/2012 (Habeas Data) applies to resident data:
- Account statement visibility requires explicit consent at registration
- Visibility changes (public↔private) must go through PQR system
- Admin changes require documented justification and notification

## Transparency Principles

All implementations must follow:
- **Trazabilidad**: Every contribution logged with date and responsible party
- **Inmutabilidad**: Financial records cannot be deleted, only corrected with justification
- **Auditoría**: Complete change history
- **Claridad**: Clear distinction between pledges (compromisos) and actual contributions (aportes)
- **Acceso controlado**: Role-based information access
