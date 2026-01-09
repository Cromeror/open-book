# OB-003: Gestion de Condominios y Propiedades

## Metadata

| Campo | Valor |
|-------|-------|
| Status | in_progress |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2026-01-09 |
| Labels | epic, condominios, propiedades, agrupaciones, dominio |
| Depends on | OB-001, OB-002 |
| Progress | ~25% |

## Descripcion

Esta epica cubre la gestion de condominios y su estructura jerarquica flexible. Un condominio puede contener agrupaciones (torres, bloques, pisos, etc.) en N niveles de profundidad, donde las **propiedades** son siempre las hojas del arbol (entidad mas pequena).

## Modelo Conceptual

```
Condominium (raiz)
├── Group: "Torre A"
│   ├── Group: "Piso 1"
│   │   ├── Property: "Apt 101"
│   │   ├── Property: "Apt 102"
│   │   └── Property: "Apt 103"
│   └── Group: "Piso 2"
│       ├── Property: "Apt 201"
│       └── Property: "Apt 202"
├── Group: "Torre B"
│   └── Property: "Local 1"      # Sin sub-agrupacion
└── Property: "Parqueadero 1"    # Directamente bajo condominio
```

### Conceptos Clave

| Concepto | Descripcion |
|----------|-------------|
| **Condominium** | Entidad raiz que agrupa todo. Creada solo por SuperAdmin. |
| **Group** | Agrupacion intermedia (torre, bloque, piso, etc.). Puede contener otros grupos o propiedades. |
| **Property** | Entidad hoja (apartamento, local, parqueadero). No puede contener hijos. Siempre asociada a un condominio. |

### Reglas del Modelo

1. **Condominios** son creados exclusivamente por **SuperAdmin**
2. **SuperAdmin** puede configurar limites por condominio:
   - Maximo de grupos
   - Maximo de subgrupos por grupo
   - Profundidad maxima de anidacion
3. **Usuarios con permisos** pueden configurar la estructura interna (grupos y propiedades)
4. **Propiedades** son siempre hojas - no pueden tener hijos
5. **Groups** pueden anidarse hasta el nivel permitido por la configuracion

## Objetivo

Implementar un sistema flexible de condominios con agrupaciones jerarquicas de N niveles, donde los SuperAdmin crean condominios y definen limites, y los usuarios con permisos configuran la estructura interna.

## Estado Actual de Implementacion

### Completado
- Entidad `Condominium` creada con campos base (name, nit, address, city, unitCount, isActive)
- Migracion de tabla `condominiums` aplicada
- Relacion con entidad `Goal` establecida
- Infraestructura de `AdminModule` para endpoints bajo `/admin/*`
- Sistema de permisos con `@RequirePermission()` y `@RequireModule()` decoradores

### Pendiente (Requiere Rediseno)
- Reemplazar modelo Tower/Apartment por modelo flexible Group/Property
- Entidad `Group` para agrupaciones de N niveles
- Entidad `Property` como entidad hoja
- Configuracion de limites en Condominium
- Entidad `PropertyResident` para asociacion de usuarios

## Arquitectura de Endpoints

El proyecto implementa dos niveles de acceso:

| Prefijo | Acceso | Descripcion |
|---------|--------|-------------|
| `/admin/*` | SuperAdmin | Creacion de condominios, configuracion de limites |
| `/*` | Usuarios con permisos | Configuracion de estructura interna |

### Estructura de Endpoints

```
# SuperAdmin endpoints (creacion y limites)
POST   /admin/condominiums                    - Crear condominio (solo SuperAdmin)
GET    /admin/condominiums                    - Listar todos los condominios
GET    /admin/condominiums/:id                - Ver condominio
PATCH  /admin/condominiums/:id                - Actualizar condominio
PATCH  /admin/condominiums/:id/limits         - Configurar limites de anidacion
DELETE /admin/condominiums/:id                - Desactivar condominio

# User endpoints (configuracion de estructura - requiere permisos)
GET    /condominiums/:id/groups               - Listar grupos raiz
POST   /condominiums/:id/groups               - Crear grupo raiz
GET    /condominiums/:id/groups/:gid          - Ver grupo con hijos
PATCH  /condominiums/:id/groups/:gid          - Actualizar grupo
DELETE /condominiums/:id/groups/:gid          - Eliminar grupo (si vacio)
POST   /condominiums/:id/groups/:gid/groups   - Crear subgrupo
POST   /condominiums/:id/groups/:gid/properties - Crear propiedad en grupo

GET    /condominiums/:id/properties           - Listar todas las propiedades
POST   /condominiums/:id/properties           - Crear propiedad (raiz o en grupo)
GET    /condominiums/:id/properties/:pid      - Ver propiedad
PATCH  /condominiums/:id/properties/:pid      - Actualizar propiedad
DELETE /condominiums/:id/properties/:pid      - Desactivar propiedad

# Asociacion de residentes
POST   /condominiums/:cid/properties/:pid/residents - Asociar residente
GET    /condominiums/:cid/properties/:pid/residents - Listar residentes
```

## Alcance

### Incluido
- Modelo de condominio con configuracion de limites
- Modelo de agrupaciones jerarquicas (Group) de N niveles
- Modelo de propiedades (Property) como hojas
- Asociacion de usuarios (residentes) a propiedades
- CRUD completo con permisos apropiados
- Validacion de limites de anidacion

### Excluido
- Gestion de multiples condominios por usuario residente
- Coeficientes de copropiedad (puede ser fase futura)
- Planos o ubicacion geografica de propiedades

## Estructura

### Stories
| Story | Titulo | Estado | Progreso |
|-------|--------|--------|----------|
| [OB-003-A](./OB-003-A/) | Modelo y gestion de condominios | in_progress | ~40% |
| [OB-003-B](./OB-003-B/) | Modelo de agrupaciones jerarquicas | pending | 0% |
| [OB-003-C](./OB-003-C/) | Modelo y gestion de propiedades | pending | 0% |
| [OB-003-D](./OB-003-D/) | Asociacion de usuarios a propiedades | pending | 0% |

## Criterios de Aceptacion Globales

- [x] Entidad Condominium creada con auditoria
- [ ] SuperAdmin puede crear condominios y configurar limites
- [ ] Usuarios con permisos pueden configurar estructura interna
- [ ] Agrupaciones soportan N niveles de profundidad
- [ ] Propiedades son siempre hojas del arbol
- [ ] Validacion de limites de anidacion
- [ ] Los residentes estan asociados a propiedades
- [x] Campos de auditoria heredados de BaseEntity

## Dependencias

- **Depende de**: OB-001 (infraestructura), OB-002 (usuarios)
- **Bloquea a**: OB-004, OB-005, OB-006, OB-007 (requieren propiedades)

## Notas Tecnicas de Implementacion

### Convenciones de Nombrado
El codigo usa nombrado en ingles segun CLAUDE.md:

| Dominio (Espanol) | Codigo (Ingles) | Tabla BD |
|-------------------|-----------------|----------|
| Condominio | Condominium | condominiums |
| Agrupacion | Group | groups |
| Propiedad | Property | properties |
| PropiedadResidente | PropertyResident | property_residents |

### Modelo de Datos Propuesto

```typescript
// Condominium - con limites de configuracion
interface Condominium {
  id: string;
  name: string;
  // ... campos existentes
  maxGroups: number;           // Limite de grupos (0 = sin limite)
  maxSubgroupsPerGroup: number; // Limite de subgrupos por grupo
  maxDepth: number;            // Profundidad maxima (1 = solo grupos raiz)
}

// Group - agrupacion recursiva
interface Group {
  id: string;
  condominiumId: string;
  parentId: string | null;     // null = grupo raiz
  name: string;
  depth: number;               // Nivel de profundidad (1, 2, 3...)
  path: string;                // Materialized path: "uuid1.uuid2.uuid3"
}

// Property - siempre hoja
interface Property {
  id: string;
  condominiumId: string;
  groupId: string | null;      // null = directamente bajo condominio
  identifier: string;          // "101", "Local 5", etc.
  type: PropertyType;          // APARTMENT, OFFICE, PARKING, etc.
}
```

### Archivos Existentes Relevantes
- `apps/api/src/entities/condominium.entity.ts` - Entidad principal (requiere agregar limites)
- `apps/api/src/modules/admin/admin.module.ts` - Modulo admin con RouterModule
- `apps/api/src/modules/goals/` - Ejemplo de modulo con endpoints bajo condominium

## Referencias

- SUMMARY.md - Seccion 4.3: Apartamentos / Unidades Residenciales
- `apps/api/src/entities/condominium.entity.ts` - Implementacion actual
