# Resumen Ejecutivo: Sistema de Permisos G.D.O.M.

## Modelo de Permisos (3 niveles de granularidad)

| Nivel | Alcance | Ejemplo |
|-------|---------|---------|
| **Modulo** | Acceso al modulo completo | Usuario puede ver "Objetivos" en el menu |
| **Accion** | Operacion especifica dentro del modulo | `goals:create`, `goals:read`, `reports:export` |
| **Link (HATEOAS)** | Visibilidad de acciones en la UI | Usuario con permiso `read` solo ve el boton "Ver", no "Editar" ni "Eliminar" |

El formato de permiso es `modulo:accion` (ej: `goals:create`, `pqr:manage`, `reports:export`). Existen **12 modulos** predefinidos con acciones CRUD + acciones especiales como `export` y `manage`.

---

## Asignacion de Permisos

- **Directa**: Un SuperAdmin otorga permisos individuales a un usuario, con fecha de expiracion opcional.
- **Por Pool**: Se crea un grupo (pool), se le asignan permisos, y todos los miembros del pool heredan esos permisos automaticamente. Un usuario en multiples pools recibe la **union** de todos los permisos.

---

## Sistema de Pools de Usuarios

Los pools son **grupos reutilizables de permisos** gestionados exclusivamente por SuperAdmins:

- Crear pool -> asignar permisos al pool -> agregar miembros
- Desactivar un pool revoca inmediatamente los permisos heredados a todos sus miembros
- Ideal para roles tipo "Administrador de copropiedad", "Auditor", "Residente con acceso extendido"

---

## Manejo por Copropiedad

- Un usuario pertenece a un condominio si es **administrador activo** (`condominium_managers`) o **residente** de una propiedad
- El `CondominiumMemberGuard` verifica membresia antes de evaluar permisos
- Los administradores de copropiedad se asignan explicitamente con campo `isPrimary` para el contacto principal
- **SuperAdmin** tiene bypass total: accede a todos los condominios y todas las acciones sin restriccion

---

## Jerarquia de Acceso

```
SuperAdmin          -> Acceso total, bypass de todos los guards
  └─ Usuario
       ├─ Permisos directos (con expiracion opcional)
       └─ Permisos heredados de pools (sin expiracion)
           └─ Filtrado por copropiedad (membresia)
```

---

## Caracteristicas Clave

- **Auditoria completa**: Cada permiso registra quien lo otorgo y cuando
- **Soft delete**: Los permisos se desactivan, no se eliminan (trazabilidad)
- **Cache con invalidacion**: Performance optimizado en verificacion de permisos
- **Integracion HATEOAS**: Los links de accion en la UI se filtran automaticamente segun permisos del usuario — el frontend no necesita logica adicional

---

## Deuda Tecnica: Paridad con Control de Acceso Externo

El sistema externo (`EXTERNAL_ACCESS_CONTROL.md`) implementa un nivel de granularidad que el sistema interno aun no tiene: **acceso a nivel de recurso**. Para alcanzar paridad entre ambos sistemas, se requiere:

| Capacidad | Externo | Interno | Estado |
|-----------|---------|---------|--------|
| Permisos a nivel de modulo:accion | `external_user_permissions` | `user_permissions` | Implementado |
| Permisos por pool (modulo:accion) | `pool_permissions` (heredado) | `pool_permissions` (heredado) | Implementado |
| Acceso a nivel de recurso (directo) | `external_user_resource_access` | — | Pendiente |
| Acceso a nivel de recurso (por pool) | `pool_resource_access` | — | Pendiente |
| Response filter sobre respuestas | Aplicado via `ExternalProxyService` | — | Pendiente |
| API de gestion para permisos de modulo externos | — | N/A | Pendiente |

### Que falta implementar

1. **Acceso a recurso para usuarios internos**: Entidad equivalente a `external_user_resource_access` pero para `User`, que permita otorgar acceso granular a recursos especificos con metodo HTTP y response filter.
2. **API para `external_user_permissions`**: La entidad existe y el guard la verifica como fallback (paso 8), pero no hay endpoint ni UI para gestionar estos permisos.
3. **Permisos de modulo externos via pool**: Los pools otorgan `pool_permissions` pero el `ExternalPermissionsService` no los consulta para verificar acceso a modulos — solo verifica `external_user_permissions` directos.
