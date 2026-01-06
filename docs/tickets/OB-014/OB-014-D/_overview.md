# OB-014-D: Scaffolding de modulos con permisos

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-014 - Configuracion de Vistas por Permisos y Modulos |
| Status | pending |
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
| [OB-014-D-001](./OB-014-D-001.md) | Scaffold modulo Objetivos de Recaudo | pending |
| [OB-014-D-002](./OB-014-D-002.md) | Scaffold modulo Actividades de Recaudo | pending |
| [OB-014-D-003](./OB-014-D-003.md) | Scaffold modulo Compromisos | pending |
| [OB-014-D-004](./OB-014-D-004.md) | Scaffold modulo Aportes Reales | pending |
| [OB-014-D-005](./OB-014-D-005.md) | Scaffold modulo PQR | pending |
| [OB-014-D-006](./OB-014-D-006.md) | Scaffold modulo Estados de Cuenta | pending |
| [OB-014-D-007](./OB-014-D-007.md) | Scaffold modulo Reportes | pending |
| [OB-014-D-008](./OB-014-D-008.md) | Scaffold modulo Copropiedades y Apartamentos | pending |
| [OB-014-D-009](./OB-014-D-009.md) | Scaffold modulo Usuarios y Perfiles | pending |
| [OB-014-D-010](./OB-014-D-010.md) | Scaffold modulo Auditoria | pending |
| [OB-014-D-011](./OB-014-D-011.md) | Scaffold modulo Notificaciones | pending |
| [OB-014-D-012](./OB-014-D-012.md) | Crear componentes compartidos de permisos | pending |

## Criterios de Aceptacion

- [ ] Cada modulo tiene su estructura de carpetas creada
- [ ] Todas las paginas verifican permisos antes de renderizar
- [ ] Paginas placeholder indican claramente que implementar
- [ ] Types basicos definidos para cada modulo
- [ ] Navegacion ya conectada a cada modulo
- [ ] Build pasa sin errores

## Modulos a Crear

### 1. Objetivos de Recaudo (OB-004)
```
(dashboard)/objetivos/
├── page.tsx                    # Lista objetivos - requireModule('objetivos')
├── nuevo/page.tsx              # Crear objetivo - requirePermission('objetivos:create')
├── [id]/
│   ├── page.tsx                # Detalle objetivo - requirePermission('objetivos:read')
│   ├── editar/page.tsx         # Editar objetivo - requirePermission('objetivos:update')
│   └── estados/page.tsx        # Gestionar estados - requirePermission('objetivos:manage')
└── _components/                # Componentes locales del modulo
```

### 2. Actividades de Recaudo (OB-005)
```
(dashboard)/actividades/
├── page.tsx                    # Lista actividades - requireModule('actividades')
├── nueva/page.tsx              # Crear actividad - requirePermission('actividades:create')
├── [id]/
│   ├── page.tsx                # Detalle actividad
│   ├── editar/page.tsx         # Editar actividad
│   └── metas/page.tsx          # Configurar metas
└── _components/
```

### 3. Compromisos (OB-006)
```
(dashboard)/compromisos/
├── page.tsx                    # Lista compromisos - requireModule('compromisos')
├── nuevo/page.tsx              # Crear compromiso - requirePermission('compromisos:create')
├── [id]/
│   ├── page.tsx                # Detalle compromiso
│   └── aportes/page.tsx        # Ver aportes asociados
└── _components/
```

### 4. Aportes Reales (OB-007)
```
(dashboard)/aportes/
├── page.tsx                    # Lista aportes - requireModule('aportes')
├── registrar/page.tsx          # Registrar aporte - requirePermission('aportes:create')
├── [id]/
│   ├── page.tsx                # Detalle aporte
│   └── anular/page.tsx         # Anular aporte - requirePermission('aportes:manage')
└── _components/
```

### 5. PQR (OB-010)
```
(dashboard)/pqr/
├── page.tsx                    # Mis PQR - requireModule('pqr')
├── nuevo/page.tsx              # Crear PQR - requirePermission('pqr:create')
├── gestionar/page.tsx          # Gestionar PQR - requirePermission('pqr:manage')
├── [numero]/
│   ├── page.tsx                # Detalle PQR
│   └── responder/page.tsx      # Responder PQR - requirePermission('pqr:manage')
└── _components/
```

### 6. Estados de Cuenta (OB-011)
```
(dashboard)/estados-cuenta/
├── page.tsx                    # Mi estado de cuenta - requireModule('estados_cuenta')
├── configuracion/page.tsx      # Privacidad publica/privada
├── publicos/page.tsx           # Ver estados publicos (si soy publico)
└── _components/
```

### 7. Reportes (OB-009)
```
(dashboard)/reportes/
├── page.tsx                    # Centro de reportes - requireModule('reportes')
├── aportes/page.tsx            # Reporte de aportes - requirePermission('reportes:read')
├── compromisos/page.tsx        # Reporte de compromisos
├── avance/page.tsx             # Reporte de avance
├── exportar/page.tsx           # Exportar datos - requirePermission('reportes:export')
└── _components/
```

### 8. Copropiedades y Apartamentos (OB-003)
```
(dashboard)/copropiedades/
├── page.tsx                    # Lista copropiedades - requireModule('copropiedades')
├── [id]/
│   ├── page.tsx                # Detalle copropiedad
│   └── apartamentos/page.tsx   # Apartamentos de la copropiedad
└── _components/

(dashboard)/apartamentos/
├── page.tsx                    # Lista apartamentos - requireModule('apartamentos')
├── nuevo/page.tsx              # Crear apartamento - requirePermission('apartamentos:create')
├── [id]/
│   ├── page.tsx                # Detalle apartamento
│   └── residentes/page.tsx     # Residentes asignados
└── _components/
```

### 9. Usuarios y Perfiles (OB-002)
```
(dashboard)/usuarios/
├── page.tsx                    # Lista usuarios - requireModule('users')
├── [id]/
│   ├── page.tsx                # Detalle usuario
│   ├── permisos/page.tsx       # Gestionar permisos - requireSuperAdmin()
│   └── privacidad/page.tsx     # Cambiar privacidad - requirePermission('users:manage')
└── _components/

(dashboard)/perfil/
├── page.tsx                    # Mi perfil (siempre accesible)
├── editar/page.tsx             # Editar mi perfil
└── notificaciones/page.tsx     # Preferencias de notificacion
```

### 10. Auditoria (OB-012)
```
(dashboard)/auditoria/
├── page.tsx                    # Logs de auditoria - requireModule('auditoria')
├── [recurso]/
│   └── [id]/page.tsx           # Historial de un recurso
└── _components/
```

### 11. Notificaciones (OB-013)
```
(dashboard)/notificaciones/
├── page.tsx                    # Centro de notificaciones - requireModule('notificaciones')
├── preferencias/page.tsx       # Configurar preferencias
└── _components/
```

### 12. Administracion (Solo SuperAdmin)
```
(dashboard)/admin/
├── page.tsx                    # Panel admin - requireSuperAdmin()
├── pools/page.tsx              # Pools de usuarios
├── permisos/page.tsx           # Gestion de permisos
├── modulos/page.tsx            # Modulos del sistema
└── _components/
```

## Estructura de Pagina Placeholder

Cada pagina placeholder seguira este patron:

```typescript
// Ejemplo: (dashboard)/objetivos/nuevo/page.tsx
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/permissions.server';

export default async function CrearObjetivoPage() {
  try {
    await requirePermission('objetivos:create');
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
            Permiso requerido: objetivos:create
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
- Cada modulo tiene su carpeta `_components/` para componentes locales
- Las paginas son Server Components por defecto
- Los placeholders indican claramente que epic implementa cada funcionalidad
- El build debe pasar sin errores despues de crear el scaffolding
