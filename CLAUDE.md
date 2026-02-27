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

## Coding Conventions

### Language in Source Code
**All source code must be in English**. This includes:
- Module, class, and function names
- Variable and constant names
- File and folder names
- Code comments
- API routes and endpoints

Domain concepts mapping (Spanish domain → English code):
| Domain (Spanish) | Code (English) | Module Code |
|------------------|----------------|-------------|
| Objetivo de Recaudo | Goal | goals |
| Actividad de Recaudo | Activity | activities |
| Compromiso | Commitment | commitments |
| Aporte Real | Contribution | contributions |
| Copropiedad | Property | properties |
| Apartamento | Apartment | apartments |
| Usuario | User | users |
| PQR | PQR | pqr |
| Estado de Cuenta | Account Statement | account_statements |
| Reporte | Report | reports |
| Auditoría | Audit | audit |
| Notificación | Notification | notifications |

**Note**: Some legacy code may still use Spanish names (e.g., `objetivos` module). New code should use English naming.

### Components Location
All React components must be in `src/components/`. Do NOT create `_components/` folders inside route directories.

## Architecture: Core Platform vs. Domain Layer

### The integration model

OpenBook API acts as an **integration layer** between the frontend and external systems:

```
Frontend (Next.js)
      ↓  HTTP
OpenBook API (NestJS)   ← integration layer: auth, permissions, HATEOAS, business rules
      ↓  HTTP / gRPC / SDK
External System (ERP, accounting, property management, etc.)
```

Today there is no external system — the domain logic lives directly in the API (goals, condominiums, etc.). But the architecture anticipates that in the future, domain data would come from an external system and the API would act as the facade: consuming the external, applying permissions and HATEOAS, and responding to the frontend.

**The `resources` registry is our configuration** — we define how the external system's responses are exposed to the frontend (which endpoints exist, what their URLs are, what HATEOAS links they produce). The external system does not know about this registry.

### Two distinct layers

**Core Platform (domain-agnostic, reusable across clients)**
- **Resources** (`resources`, `resource_http_methods`, `resource_http_method_links`) — catalog of exposed endpoints and their HATEOAS link configurations
- **HATEOAS** (`HateoasModule`, `HateoasInterceptor`, `HateoasService`, `@HateoasResource`) — enriches responses with `_links` automatically
- **Permissions** (`modules`, `module_permissions`, `user_permissions`, `pool_permissions`) — granular permission system with direct and pool-based assignment
- **Users, Auth, Pools** — authentication and user grouping

**Domain Layer (condominium-specific, current client)**
- `goals`, `activities`, `commitments`, `contributions`
- `condominiums`, `properties`, `property_residents`
- `pqr`, `account_statements`, `reports`

### How to implement a new endpoint

**Always follow this order:**

1. **Register the resource in BD** via the admin API:
   ```
   POST /admin/resources  → declare the endpoint with its templateUrl
   POST /admin/resources/:code/http-methods  → assign HTTP methods
   ```

2. **Configure HATEOAS links** (optional but recommended):
   ```
   PUT /admin/resources/:code/http-methods/:methodId/links  → define outbound links
   ```

3. **Implement the controller** — consume domain logic or call the external system, then decorate:
   ```typescript
   @UseGuards(JwtAuthGuard, CondominiumMemberGuard, PermissionsGuard)
   export class GoalsController {
     @Get()
     @HateoasResource('goals', 'GET')      // ← matches resource code in BD
     @RequirePermission('goals:read')       // ← matches module_permission code in BD
     async findAll(...) {
       // today: calls GoalsService (local DB)
       // future: calls ExternalERP.getGoals(condominiumId)
     }
   }
   ```

The controller is the integration point: it receives the frontend request, applies auth/permissions, calls the data source (local or external), and returns the enriched response. The core platform handles auth, permissions, and HATEOAS transparently — the same regardless of whether the data source is local or external.

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
