# Resumen Ejecutivo: Sistema de Permisos OpenBook

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
