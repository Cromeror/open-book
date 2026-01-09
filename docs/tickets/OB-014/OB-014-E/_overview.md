# OB-014-E: Sistema de Permisos Gobernado por Backend

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Permisos y Modulos |
| Status | done |
| Priority | high |
| Created | 2026-01-05 |
| Updated | 2026-01-06 |
| Labels | story, frontend, backend, permissions, modulos, integration |
| Depends on | OB-014-A, OB-014-D, OB-002-C |

## User Story

**Como** desarrollador del proyecto
**Quiero** un sistema de permisos donde el backend sea la unica fuente de verdad
**Para** evitar sincronizacion de tipos y permitir que el frontend se adapte dinamicamente

## Descripcion

Esta story implementa un sistema donde:
1. **Backend es la unica fuente de verdad** - No hay tipos hardcodeados en frontend
2. **Modulos CRUD son genericos** - Se renderizan automaticamente segun metadatos del backend
3. **Modulos especializados se registran** - Graficos, calculos complejos se construyen en frontend pero se registran en backend
4. **Metadata segregada por accion** - Cada modulo entrega solo la metadata de las acciones permitidas

### Principios de Diseno

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND = FUENTE DE VERDAD                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │  Modulos CRUD   │    │    Metadatos    │    │   Permisos      │ │
│  │  (Genericos)    │    │   de Modulos    │    │   de Usuario    │ │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘ │
│           │                      │                      │          │
│           └──────────────────────┴──────────────────────┘          │
│                                  │                                  │
│                         GET /api/auth/me                            │
│                 (autenticado, solo datos del usuario)               │
│                                  │                                  │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND DINAMICO                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Login obtiene modulos + metadata del usuario                    │
│  2. Genera navegacion dinamicamente                                 │
│  3. Renderiza modulos CRUD genericos                                │
│  4. Carga modulos especializados bajo demanda                       │
│                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐ │
│  │  GenericCRUD    │    │  ChartModule    │    │  ReportModule   │ │
│  │  (dinamico)     │    │  (registrado)   │    │  (registrado)   │ │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Tareas

| ID | Titulo | Status |
|----|--------|--------|
| [OB-014-E-001](./OB-014-E-001.md) | Extender /api/auth/me con modulos y metadata | pending |
| [OB-014-E-002](./OB-014-E-002.md) | Implementar ModuleRegistry en frontend | pending |
| [OB-014-E-003](./OB-014-E-003.md) | Crear componente GenericCRUDModule | pending |
| [OB-014-E-004](./OB-014-E-004.md) | Adaptar navegacion a metadatos dinamicos | pending |
| [OB-014-E-005](./OB-014-E-005.md) | Registrar modulos especializados | pending |
| [OB-014-E-006](./OB-014-E-006.md) | Eliminar tipos hardcodeados del frontend | pending |
| [OB-014-E-007](./OB-014-E-007.md) | Tests de integracion | pending |

## Criterios de Aceptacion

- [ ] No existen tipos de permisos hardcodeados en frontend
- [ ] /api/auth/me retorna modulos con metadata completa (solo los autorizados)
- [ ] Frontend genera navegacion desde respuesta de /api/auth/me
- [ ] Modulos CRUD se renderizan con componente generico
- [ ] Modulos especializados se registran y cargan bajo demanda
- [ ] SuperAdmin recibe todos los modulos con todos los permisos
- [ ] Agregar un modulo CRUD no requiere cambios en frontend
- [ ] Metadata CRUD segregada por accion (read, create, update, delete)
- [ ] Tests de integracion validan el flujo completo

## Arquitectura

### 1. Endpoint Consolidado /api/auth/me

Un solo endpoint autenticado que retorna:
- Datos del usuario
- Modulos a los que tiene acceso (con su metadata completa)
- Permisos por modulo

**IMPORTANTE**: La metadata CRUD se segrega por accion. Si el usuario solo tiene permiso `read`, solo recibe la metadata necesaria para leer (listColumns). Si tiene `create`, recibe los fields del formulario, etc.

```typescript
// GET /api/auth/me (requiere autenticacion)

interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: ModuleWithPermissions[];
}

interface ModuleWithPermissions {
  code: string;                    // 'goals', 'contributions', etc.
  label: string;                   // 'Objetivos de Recaudo'
  description: string;             // 'Gestiona los objetivos...'
  icon: string;                    // 'Target' (lucide icon)
  type: 'crud' | 'specialized';    // Tipo de modulo

  // Navegacion
  nav: {
    path: string;                  // '/goals'
    order: number;                 // Orden en menu
  };

  // Config base para modulos CRUD
  entity?: string;                 // 'Objetivo' (solo CRUD)
  endpoint?: string;               // '/api/goals' (solo CRUD)

  // Config para modulos especializados
  component?: string;              // 'ReportsModule' (solo specialized)

  // ACCIONES - Unificado para CRUD y specialized
  // Solo se incluyen las acciones que el usuario tiene permiso
  actions: ModuleAction[];
}

// Accion del modulo - el codigo coincide con el codigo de permiso
interface ModuleAction {
  code: string;                    // 'read', 'create', 'update', 'delete', 'view', 'export'
  label: string;                   // 'Ver', 'Crear', 'Editar', 'Eliminar'
  description?: string;            // 'Permite ver registros'
  settings: ActionSettings;        // Tipado segun tipo de modulo
}

// ============================================
// Settings tipados para acciones CRUD
// ============================================

type ActionSettings = CrudActionSettings | GenericActionSettings;

// Settings para acciones CRUD (tipados)
type CrudActionSettings =
  | ReadActionSettings
  | CreateActionSettings
  | UpdateActionSettings
  | DeleteActionSettings;

interface ReadActionSettings {
  type: 'read';
  listColumns: ColumnDefinition[];
  filters?: FilterDefinition[];
  sortable?: string[];
  defaultSort?: { field: string; order: 'asc' | 'desc' };
}

interface CreateActionSettings {
  type: 'create';
  fields: FieldDefinition[];
  validation?: ValidationRules;
}

interface UpdateActionSettings {
  type: 'update';
  fields: FieldDefinition[];
  validation?: ValidationRules;
}

interface DeleteActionSettings {
  type: 'delete';
  confirmation: string;            // Mensaje de confirmacion
  soft?: boolean;                  // Soft delete?
}

// ============================================
// Settings genericos para acciones especializadas
// ============================================

interface GenericActionSettings {
  type: 'generic';
  [key: string]: unknown;          // Cualquier configuracion adicional
}

// ============================================
// Definiciones de campos y columnas
// ============================================

interface FieldDefinition {
  name: string;                    // 'name', 'amount', etc.
  label: string;                   // 'Nombre', 'Monto'
  type: 'text' | 'number' | 'date' | 'select' | 'money' | 'textarea' | 'boolean';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;  // Para select
  min?: number;
  max?: number;
  placeholder?: string;
}

interface ColumnDefinition {
  field: string;                   // 'name', 'createdAt'
  label: string;                   // 'Nombre', 'Fecha'
  sortable?: boolean;
  format?: 'date' | 'money' | 'boolean';
}

interface FilterDefinition {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: Array<{ value: string; label: string }>;
}

interface ValidationRules {
  [field: string]: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}
```

### Ejemplo de Respuesta

```json
{
  "user": {
    "id": "user-123",
    "email": "admin@copropiedad.com",
    "firstName": "Juan",
    "lastName": "Perez",
    "isSuperAdmin": false
  },
  "modules": [
    {
      "code": "objetivos",
      "label": "Objetivos de Recaudo",
      "description": "Gestiona los objetivos de recaudo de la copropiedad",
      "icon": "Target",
      "type": "crud",
      "nav": { "path": "/goals", "order": 10 },
      "entity": "Objetivo",
      "endpoint": "/api/goals",
      "actions": [
        {
          "code": "read",
          "label": "Ver",
          "settings": {
            "type": "read",
            "listColumns": [
              { "field": "name", "label": "Nombre", "sortable": true },
              { "field": "targetAmount", "label": "Meta", "format": "money" },
              { "field": "deadline", "label": "Fecha Limite", "format": "date" }
            ],
            "filters": [
              { "field": "status", "label": "Estado", "type": "select", "options": [] }
            ]
          }
        },
        {
          "code": "create",
          "label": "Crear",
          "settings": {
            "type": "create",
            "fields": [
              { "name": "name", "label": "Nombre", "type": "text", "required": true },
              { "name": "targetAmount", "label": "Meta", "type": "money", "required": true },
              { "name": "deadline", "label": "Fecha Limite", "type": "date", "required": true }
            ]
          }
        },
        {
          "code": "update",
          "label": "Editar",
          "settings": {
            "type": "update",
            "fields": [
              { "name": "name", "label": "Nombre", "type": "text", "required": true },
              { "name": "targetAmount", "label": "Meta", "type": "money", "required": true },
              { "name": "deadline", "label": "Fecha Limite", "type": "date", "required": true }
            ]
          }
        }
      ]
    },
    {
      "code": "aportes",
      "label": "Aportes Reales",
      "description": "Registro de aportes recibidos",
      "icon": "DollarSign",
      "type": "crud",
      "nav": { "path": "/contributions", "order": 20 },
      "entity": "Aporte",
      "endpoint": "/api/contributions",
      "actions": [
        {
          "code": "read",
          "label": "Ver",
          "settings": {
            "type": "read",
            "listColumns": [
              { "field": "amount", "label": "Monto", "format": "money" },
              { "field": "date", "label": "Fecha", "format": "date" },
              { "field": "source", "label": "Origen" }
            ]
          }
        }
      ]
    },
    {
      "code": "reportes",
      "label": "Reportes y Estadisticas",
      "description": "Graficos y exportacion de datos",
      "icon": "BarChart3",
      "type": "specialized",
      "nav": { "path": "/reports", "order": 60 },
      "component": "ReportsModule",
      "actions": [
        {
          "code": "view",
          "label": "Ver reportes",
          "description": "Visualizar reportes",
          "settings": { "type": "generic" }
        },
        {
          "code": "export",
          "label": "Exportar",
          "description": "Exportar a PDF/Excel",
          "settings": {
            "type": "generic",
            "formats": ["pdf", "excel", "csv"]
          }
        }
      ]
    }
  ]
}
```

### 2. ModuleRegistry (Frontend)

```typescript
// apps/web/src/lib/module-registry.ts

type ModuleComponent = React.ComponentType<ModuleProps>;

interface ModuleProps {
  moduleCode: string;
  metadata: ModuleWithPermissions;
}

class ModuleRegistry {
  private specializedModules = new Map<string, ModuleComponent>();
  private loadedModules: ModuleWithPermissions[] = [];

  // Registrar modulo especializado (llamado al iniciar app)
  register(code: string, component: ModuleComponent): void {
    this.specializedModules.set(code, component);
  }

  // Cargar modulos del usuario (despues de login)
  setUserModules(modules: ModuleWithPermissions[]): void {
    this.loadedModules = modules;
  }

  // Obtener metadata de un modulo
  getMetadata(code: string): ModuleWithPermissions | undefined {
    return this.loadedModules.find(m => m.code === code);
  }

  // Obtener componente para un modulo
  getComponent(code: string): ModuleComponent | null {
    const meta = this.getMetadata(code);
    if (!meta) return null;

    if (meta.type === 'specialized') {
      return this.specializedModules.get(code) || null;
    }

    // Modulo CRUD generico
    return GenericCRUDModule;
  }

  // Generar config de navegacion
  getNavConfig(): NavItem[] {
    return this.loadedModules
      .sort((a, b) => a.nav.order - b.nav.order)
      .map(m => ({
        path: m.nav.path,
        label: m.label,
        icon: m.icon,
        module: m.code,
      }));
  }

  // Verificar si tiene acceso a un modulo
  hasModule(code: string): boolean {
    return this.loadedModules.some(m => m.code === code);
  }

  // Verificar si tiene una accion especifica
  // El codigo de accion coincide con el codigo de permiso
  hasAction(moduleCode: string, actionCode: string): boolean {
    const module = this.getMetadata(moduleCode);
    return module?.actions.some(a => a.code === actionCode) ?? false;
  }

  // Obtener settings de una accion
  getActionSettings<T extends ActionSettings>(
    moduleCode: string,
    actionCode: string
  ): T | undefined {
    const module = this.getMetadata(moduleCode);
    const action = module?.actions.find(a => a.code === actionCode);
    return action?.settings as T | undefined;
  }

  // Obtener todos los codigos de accion de un modulo (equivale a permisos)
  getPermissions(moduleCode: string): string[] {
    const module = this.getMetadata(moduleCode);
    return module?.actions.map(a => a.code) ?? [];
  }
}

export const moduleRegistry = new ModuleRegistry();
```

### 3. Modulos CRUD Genericos

```typescript
// apps/web/src/components/modules/GenericCRUDModule.tsx

export function GenericCRUDModule({ moduleCode, metadata }: ModuleProps) {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Obtener settings de cada accion (si existe, tiene permiso)
  const readSettings = getActionByCode<ReadActionSettings>(metadata.actions, 'read');
  const createSettings = getActionByCode<CreateActionSettings>(metadata.actions, 'create');
  const updateSettings = getActionByCode<UpdateActionSettings>(metadata.actions, 'update');
  const deleteSettings = getActionByCode<DeleteActionSettings>(metadata.actions, 'delete');

  if (!readSettings) {
    return <ModuleError message="Sin permiso para ver este modulo" />;
  }

  return (
    <div className="space-y-6">
      <ModuleHeader
        title={metadata.label}
        description={metadata.description}
      />

      {view === 'list' && (
        <>
          {createSettings && (
            <Button onClick={() => setView('create')}>
              Crear {metadata.entity}
            </Button>
          )}
          <GenericList
            config={readSettings.settings}
            endpoint={metadata.endpoint!}
            onEdit={updateSettings ? (id) => { setSelectedId(id); setView('edit'); } : undefined}
            onDelete={deleteSettings ? handleDelete : undefined}
          />
        </>
      )}

      {view === 'create' && createSettings && (
        <GenericForm
          config={createSettings.settings}
          endpoint={metadata.endpoint!}
          mode="create"
          onSuccess={() => setView('list')}
          onCancel={() => setView('list')}
        />
      )}

      {view === 'edit' && selectedId && updateSettings && (
        <GenericForm
          config={updateSettings.settings}
          endpoint={`${metadata.endpoint}/${selectedId}`}
          mode="edit"
          onSuccess={() => setView('list')}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  );
}

// Helper para obtener accion por codigo
function getActionByCode<T extends ActionSettings>(
  actions: ModuleAction[],
  code: string
): ModuleAction & { settings: T } | undefined {
  const action = actions.find(a => a.code === code);
  if (!action) return undefined;
  return action as ModuleAction & { settings: T };
}
```

### 4. Modulos Especializados

Los modulos especializados (NO CRUD) siguen un flujo de dos pasos:

1. **Desarrollo**: Se construyen como componentes React en el frontend
2. **Registro**: El SuperAdmin los registra desde la UI de administracion

```
┌─────────────────────────────────────────────────────────────────────┐
│              FLUJO DE MODULOS ESPECIALIZADOS                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  DESARROLLO (codigo)                                                │
│  ─────────────────────                                              │
│  1. Desarrollador crea componente React                             │
│     └─> apps/web/src/modules/reports/ReportsModule.tsx              │
│                                                                      │
│  2. Registra componente como "disponible"                           │
│     └─> moduleRegistry.registerComponent(meta, ReportsModule)       │
│                                                                      │
│  3. Deploy (componente incluido en bundle)                          │
│                                                                      │
│  REGISTRO (admin UI)                                                │
│  ─────────────────────                                              │
│  4. SuperAdmin va a Admin > Modulos > Registrar                     │
│     └─> Ve lista de componentes disponibles                        │
│     └─> Selecciona "ReportsModule"                                  │
│     └─> Configura: label, icon, path, orden                         │
│     └─> Guarda en backend                                           │
│                                                                      │
│  5. SuperAdmin asigna permisos a usuarios                           │
│     └─> Admin > Permisos > Asignar modulo                          │
│                                                                      │
│  6. Usuario ve modulo en navegacion                                 │
│     └─> /api/auth/me incluye el modulo                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Registro de Componentes Disponibles

```typescript
// apps/web/src/modules/index.ts
import { moduleRegistry } from '@/lib/module-registry';
import { ReportsModule } from './reports';

// Hacer componente DISPONIBLE para que admin lo registre
moduleRegistry.registerModule({
  code: 'reportes',
  name: 'ReportsModule',
  label: 'Reportes y Estadisticas',
  description: 'Graficos y exportacion de datos',
  defaultIcon: 'BarChart3',
  defaultActions: [
    {
      code: 'view',
      label: 'Ver reportes',
      description: 'Visualizar reportes',
      settings: { type: 'generic' }
    },
    {
      code: 'export',
      label: 'Exportar',
      description: 'Exportar a PDF/Excel',
      settings: { type: 'generic', formats: ['pdf', 'excel', 'csv'] }
    },
  ],
}, ReportsModule);
```

#### Componente Especializado

```typescript
// apps/web/src/modules/reports/ReportsModule.tsx
export function ReportsModule({ moduleCode, metadata }: ModuleProps) {
  // Verificar si tiene la accion 'export' (codigo = permiso)
  const hasExportAction = metadata.actions.some(a => a.code === 'export');

  return (
    <div className="space-y-6">
      <h1>{metadata.label}</h1>

      {/* UI compleja con graficos */}
      <ContributionsChart />
      <ProgressChart />

      {hasExportAction && <ExportButton />}
    </div>
  );
}
```

#### Estructura Unificada de Acciones

Tanto modulos CRUD como especializados usan la misma estructura `ModuleAction`:

```typescript
// Estructura unificada para todas las acciones
interface ModuleAction {
  code: string;                   // 'read', 'create', 'view', 'export', etc.
  label: string;                  // 'Ver', 'Crear', 'Exportar'
  description?: string;           // 'Permite ver registros'
  settings: ActionSettings;       // Tipado o generico segun el tipo
}

// Para acciones CRUD - settings tipados
type CrudActionSettings =
  | ReadActionSettings     // type: 'read'
  | CreateActionSettings   // type: 'create'
  | UpdateActionSettings   // type: 'update'
  | DeleteActionSettings;  // type: 'delete'

// Para acciones especializadas - settings genericos
interface GenericActionSettings {
  type: 'generic';
  [key: string]: unknown;  // Cualquier config adicional
}
```

### 5. Flujo de Carga

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP INITIALIZATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Usuario hace login                                          │
│     └─> POST /api/auth/login                                    │
│     └─> Recibe token JWT                                        │
│                                                                  │
│  2. Obtener datos del usuario + modulos                         │
│     └─> GET /api/auth/me (con token)                            │
│     └─> Recibe: { user, modules[] }                             │
│     └─> modules incluye SOLO los que tiene acceso               │
│     └─> cada modulo incluye SOLO la metadata de sus permisos    │
│                                                                  │
│  3. Cargar en ModuleRegistry                                    │
│     └─> moduleRegistry.setUserModules(response.modules)         │
│                                                                  │
│  4. Generar navegacion                                          │
│     └─> moduleRegistry.getNavConfig()                           │
│     └─> Sidebar muestra solo modulos autorizados                │
│                                                                  │
│  5. Usuario navega a /goals                                     │
│     └─> moduleRegistry.getComponent('objetivos')                │
│     └─> Retorna GenericCRUDModule                               │
│     └─> GenericCRUDModule lee crud.read, crud.create, etc.      │
│     └─> Solo renderiza lo que existe en metadata                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Tipos en Frontend (Dinamicos)

**IMPORTANTE**: El frontend NO tiene tipos hardcodeados para modulos/permisos.

```typescript
// apps/web/src/lib/types.ts
// Solo interfaces para respuestas del API - strings genericos

export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: ModuleWithPermissions[];
}

// Validacion en runtime, no en compile time
// El codigo de accion ES el codigo de permiso
export function hasAction(
  modules: ModuleWithPermissions[],
  moduleCode: string,
  actionCode: string
): boolean {
  const module = modules.find(m => m.code === moduleCode);
  return module?.actions.some(a => a.code === actionCode) ?? false;
}

// Helper para obtener settings tipados
export function getActionSettings<T extends ActionSettings>(
  modules: ModuleWithPermissions[],
  moduleCode: string,
  actionCode: string
): T | undefined {
  const module = modules.find(m => m.code === moduleCode);
  const action = module?.actions.find(a => a.code === actionCode);
  return action?.settings as T | undefined;
}
```

## Segregacion de Acciones por Permiso

Las acciones se entregan **solo si el usuario tiene el permiso correspondiente**:

| Permiso (codigo) | Accion incluida |
|------------------|-----------------|
| `read` | Accion con `code: 'read'` y `ReadActionSettings` |
| `create` | Accion con `code: 'create'` y `CreateActionSettings` |
| `update` | Accion con `code: 'update'` y `UpdateActionSettings` |
| `delete` | Accion con `code: 'delete'` y `DeleteActionSettings` |
| `view` | Accion con `code: 'view'` y `GenericActionSettings` |
| `export` | Accion con `code: 'export'` y `GenericActionSettings` |

**El codigo de la accion coincide exactamente con el codigo del permiso.**

### Ejemplo: Usuario con solo READ

```json
{
  "modules": [{
    "code": "objetivos",
    "type": "crud",
    "entity": "Objetivo",
    "endpoint": "/api/goals",
    "actions": [
      {
        "code": "read",
        "label": "Ver",
        "settings": {
          "type": "read",
          "listColumns": [...]
        }
      }
    ]
  }]
}
```
No recibe acciones de `create`, `update`, ni `delete`.

### Ejemplo: Usuario con READ + CREATE

```json
{
  "modules": [{
    "code": "objetivos",
    "type": "crud",
    "entity": "Objetivo",
    "endpoint": "/api/goals",
    "actions": [
      {
        "code": "read",
        "label": "Ver",
        "settings": {
          "type": "read",
          "listColumns": [...]
        }
      },
      {
        "code": "create",
        "label": "Crear",
        "settings": {
          "type": "create",
          "fields": [...]
        }
      }
    ]
  }]
}
```

## Tabla de Modulos

| Codigo | Tipo | Descripcion |
|--------|------|-------------|
| `users` | crud | Gestion de usuarios |
| `properties` | crud | Copropiedades |
| `apartments` | crud | Apartamentos |
| `goals` | crud | Objetivos de recaudo |
| `activities` | crud | Actividades de recaudo |
| `commitments` | crud | Compromisos |
| `contributions` | crud | Aportes reales |
| `pqr` | crud | Peticiones, Quejas, Reclamos |
| `reports` | specialized | Reportes y graficos |
| `audit` | specialized | Logs de auditoria (solo lectura) |
| `notifications` | crud | Centro de notificaciones |
| `settings` | specialized | Configuracion del sistema |

## Beneficios

1. **Sin sincronizacion** - No hay endpoint publico, todo viene en /api/auth/me
2. **Seguridad** - Usuario solo recibe metadata de lo que puede hacer
3. **Menos codigo** - Modulos CRUD no requieren codigo especifico
4. **Flexibilidad** - Modulos complejos se construyen a medida
5. **Type safety en backend** - Backend mantiene los enums, frontend usa strings
6. **Principio de minimo privilegio** - Solo la informacion necesaria

## Notas Tecnicas

- /api/auth/me se llama una vez despues de login
- Datos se cachean en memoria hasta logout o refresh
- SuperAdmin recibe TODOS los modulos con TODAS las acciones
- El backend valida permisos en cada request (defense in depth)
- El frontend solo oculta UI - la seguridad real esta en backend
