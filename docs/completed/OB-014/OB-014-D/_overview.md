# OB-014-D: Scaffolding de modulos con permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Permisos y Modulos |
| Status | done |
| Priority | medium |
| Created | 2026-01-05 |
| Updated | 2026-01-06 |
| Labels | story, frontend, scaffolding, estructura, permisos |
| Depends on | OB-014-A, OB-014-B, OB-014-C |

## User Story

**Como** desarrollador del proyecto
**Quiero** la estructura de archivos de cada modulo con validacion de permisos configurada
**Para** tener un punto de partida claro para implementar cada funcionalidad

## Descripcion

Crear la estructura de archivos (scaffolding) para todos los modulos visuales del sistema. Cada modulo tendra:
- Estructura de carpetas y archivos
- Validacion de permisos ya configurada
- Paginas placeholder indicando que permisos se requieren
- Comentarios sobre como implementar cada seccion

**IMPORTANTE**: Esta story NO implementa logica de negocio. Solo crea:
- Estructura de archivos
- Guards de permisos
- Placeholders con instrucciones
- Types basicos del modulo

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-014-D-001](./OB-014-D-001.md) | Scaffold modulo Objetivos de Recaudo | done |
| [OB-014-D-002](./OB-014-D-002.md) | Scaffold modulo Actividades de Recaudo | done |
| [OB-014-D-003](./OB-014-D-003.md) | Scaffold modulo Compromisos | done |
| [OB-014-D-004](./OB-014-D-004.md) | Scaffold modulo Aportes Reales | done |
| [OB-014-D-005](./OB-014-D-005.md) | Scaffold modulo PQR | done |
| [OB-014-D-006](./OB-014-D-006.md) | Scaffold modulo Estados de Cuenta | done |
| [OB-014-D-007](./OB-014-D-007.md) | Scaffold modulo Reportes | done |
| [OB-014-D-008](./OB-014-D-008.md) | Scaffold modulo Copropiedades y Apartamentos | done |
| [OB-014-D-009](./OB-014-D-009.md) | Scaffold modulo Usuarios y Perfiles | done |
| [OB-014-D-010](./OB-014-D-010.md) | Scaffold modulo Auditoria | done |
| [OB-014-D-011](./OB-014-D-011.md) | Scaffold modulo Notificaciones | done |
| [OB-014-D-012](./OB-014-D-012.md) | Crear componentes compartidos de permisos | done |

## Criterios de Aceptacion

- [x] Cada modulo tiene su estructura de carpetas creada
- [x] Todas las paginas verifican permisos antes de renderizar
- [x] Paginas placeholder indican claramente que implementar
- [x] Types basicos definidos para cada modulo
- [x] Navegacion ya conectada a cada modulo
- [x] Build pasa sin errores

## Modulos a Crear

### 1. Fundraising Goals (OB-004)
```
(dashboard)/goals/
├── page.tsx                    # List goals - requireModule('goals')
├── new/page.tsx                # Create goal - requirePermission('goals:create')
└── [id]/
    ├── page.tsx                # Goal detail - requirePermission('goals:read')
    ├── edit/page.tsx           # Edit goal - requirePermission('goals:update')
    └── states/page.tsx         # Manage states - requirePermission('goals:manage')
```

### 2. Fundraising Activities (OB-005)
```
(dashboard)/activities/
├── page.tsx                    # List activities - requireModule('activities')
├── new/page.tsx                # Create activity - requirePermission('activities:create')
└── [id]/
    ├── page.tsx                # Activity detail
    ├── edit/page.tsx           # Edit activity
    └── targets/page.tsx        # Configure targets
```

### 3. Commitments (OB-006)
```
(dashboard)/commitments/
├── page.tsx                    # List commitments - requireModule('commitments')
├── new/page.tsx                # Create commitment - requirePermission('commitments:create')
└── [id]/
    ├── page.tsx                # Commitment detail
    └── contributions/page.tsx  # View associated contributions
```

### 4. Contributions (OB-007)
```
(dashboard)/contributions/
├── page.tsx                    # List contributions - requireModule('contributions')
├── register/page.tsx           # Register contribution - requirePermission('contributions:create')
└── [id]/
    ├── page.tsx                # Contribution detail
    └── void/page.tsx           # Void contribution - requirePermission('contributions:manage')
```

### 5. PQR (OB-010)
```
(dashboard)/pqr/
├── page.tsx                    # My PQRs - requireModule('pqr')
├── new/page.tsx                # Create PQR - requirePermission('pqr:create')
├── manage/page.tsx             # Manage PQRs - requirePermission('pqr:manage')
└── [number]/
    ├── page.tsx                # PQR detail
    └── respond/page.tsx        # Respond to PQR - requirePermission('pqr:manage')
```

### 6. Account Statements (OB-011)
```
(dashboard)/account-statements/
├── page.tsx                    # My account statement - requireModule('account_statements')
├── settings/page.tsx           # Public/private privacy settings
└── public/page.tsx             # View public statements (if I'm public)
```

### 7. Reports (OB-009)
```
(dashboard)/reports/
├── page.tsx                    # Reports center - requireModule('reports')
├── contributions/page.tsx      # Contributions report - requirePermission('reports:read')
├── commitments/page.tsx        # Commitments report
├── progress/page.tsx           # Progress report
└── export/page.tsx             # Export data - requirePermission('reports:export')
```

### 8. Properties and Apartments (OB-003)
```
(dashboard)/properties/
├── page.tsx                    # List properties - requireModule('properties')
└── [id]/
    ├── page.tsx                # Property detail
    └── apartments/page.tsx     # Property apartments

(dashboard)/apartments/
├── page.tsx                    # List apartments - requireModule('apartments')
├── new/page.tsx                # Create apartment - requirePermission('apartments:create')
└── [id]/
    ├── page.tsx                # Apartment detail
    └── residents/page.tsx      # Assigned residents
```

### 9. Users and Profiles (OB-002)
```
(dashboard)/users/
├── page.tsx                    # List users - requireModule('users')
└── [id]/
    ├── page.tsx                # User detail
    ├── permissions/page.tsx    # Manage permissions - requireSuperAdmin()
    └── privacy/page.tsx        # Change privacy - requirePermission('users:manage')

(dashboard)/profile/
├── page.tsx                    # My profile (always accessible)
├── edit/page.tsx               # Edit my profile
└── notifications/page.tsx      # Notification preferences
```

### 10. Audit (OB-012)
```
(dashboard)/audit/
├── page.tsx                    # Audit logs - requireModule('audit')
└── [resource]/
    └── [id]/page.tsx           # Resource history
```

### 11. Notifications (OB-013)
```
(dashboard)/notifications/
├── page.tsx                    # Notifications center - requireModule('notifications')
└── preferences/page.tsx        # Configure preferences
```

### 12. Administration (SuperAdmin Only)
```
(dashboard)/admin/
├── page.tsx                    # Admin panel - requireSuperAdmin()
├── pools/page.tsx              # User pools
├── permissions/page.tsx        # Permission management
└── modules/page.tsx            # System modules
```

## Estructura de Pagina Placeholder

Cada pagina placeholder seguira este patron:

```typescript
// Ejemplo: (dashboard)/goals/new/page.tsx
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/permissions.server';

export default async function CreateGoalPage() {
  try {
    await requirePermission('goals:create');
  } catch {
    redirect('/acceso-denegado');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crear Objetivo</h1>
        <p className="text-gray-600">
          Crea un nuevo objetivo de recaudo para la copropiedad
        </p>
      </div>

      {/* TODO: Implementar en OB-004 */}
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            Modulo: Objetivos de Recaudo
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Permiso requerido: goals:create
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Implementacion: OB-004
          </p>
        </div>
      </div>
    </div>
  );
}
```

## Componentes Compartidos de Permisos

```typescript
// components/permissions/ShowForModule.tsx
// components/permissions/ShowForPermission.tsx
// components/permissions/ShowForSuperAdmin.tsx
// components/permissions/PermissionGate.tsx
// components/permissions/AccessDenied.tsx
```

## Notas Tecnicas

- Usar `requireModule()` y `requirePermission()` de lib/permissions.server.ts
- **IMPORTANTE**: Todos los componentes deben estar en `src/components/`, NO usar carpetas `_components/` locales
- Las paginas son Server Components por defecto
- Los placeholders indican claramente que epic implementa cada funcionalidad
- El build debe pasar sin errores despues de crear el scaffolding
