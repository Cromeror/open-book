# OB-003-A: Modelo y gestion de copropiedades

## Metadata

| Campo | Valor |
|-------|-------|
| Epic | OB-003 - Gestion de Copropiedades y Apartamentos |
| Status | in_progress |
| Priority | critical |
| Created | 2025-12-31 |
| Updated | 2026-01-09 |
| Labels | story, copropiedad, modelo |
| Depends on | OB-001-B, OB-002-C |
| Progress | ~40% |

## User Story

**Como** administrador del sistema
**Quiero** poder crear y gestionar copropiedades
**Para** organizar los apartamentos y actividades de recaudo por unidad residencial

## Descripcion

Esta story cubre la creacion del modelo de copropiedad y los endpoints para su gestion. Una copropiedad representa una unidad residencial completa (edificio, conjunto residencial, etc.).

## Estado Actual de Implementacion

### Completado
- Entidad `Condominium` creada en `apps/api/src/entities/condominium.entity.ts`
- Migracion de tabla `condominiums` con todos los campos requeridos
- Campos de auditoria heredados de `BaseEntity` (createdAt, createdBy, updatedAt, updatedBy, deletedAt, deletedBy)
- Relacion `OneToMany` con `Goal` establecida
- Infraestructura de AdminModule con RouterModule para `/admin/*`

### Pendiente
- Endpoints CRUD de copropiedades bajo `/admin/condominiums`
- Entidad `Tower` para torres/bloques
- Entidad `CondominiumAdmin` para vinculacion de administradores
- Agregar relaciones faltantes en Condominium (towers, apartments, admins)

## Tareas

| ID | Titulo | Status | Notas |
|----|--------|--------|-------|
| [OB-003-A-001](./OB-003-A-001.md) | Crear entidad Condominium con TypeORM | completed | Implementada, falta relaciones extras |
| [OB-003-A-002](./OB-003-A-002.md) | Implementar CRUD de copropiedades | pending | Requiere CondominiumsModule bajo /admin |
| [OB-003-A-003](./OB-003-A-003.md) | Vincular administradores a copropiedades | pending | Requiere entidad CondominiumAdmin |
| [OB-003-A-004](./OB-003-A-004.md) | Implementar configuracion de torres/bloques | pending | Requiere entidad Tower |

## Criterios de Aceptacion

- [x] Modelo Condominium creado con campos requeridos
- [x] Campos de auditoria completos via BaseEntity
- [x] Soft delete soportado via deletedAt
- [ ] CRUD completo (crear, leer, actualizar, desactivar)
- [ ] Solo administradores pueden crear/editar copropiedades
- [ ] Un administrador puede gestionar multiples copropiedades

## Notas Tecnicas

### Implementacion Actual
```typescript
// apps/api/src/entities/condominium.entity.ts
@Entity('condominiums')
export class Condominium extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Index('idx_condominiums_nit', { unique: true, where: 'nit IS NOT NULL' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  nit?: string;

  @Column({ type: 'varchar', length: 500 })
  address!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ name: 'unit_count', type: 'integer' })
  unitCount!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany('Goal', 'condominium')
  goals!: Goal[];
}
```

### Relaciones Pendientes por Agregar
```typescript
@OneToMany(() => Apartment, (apt) => apt.condominium)
apartments: Apartment[];

@OneToMany(() => Tower, (tower) => tower.condominium)
towers: Tower[];

@OneToMany(() => CondominiumAdmin, (admin) => admin.condominium)
administrators: CondominiumAdmin[];
```

### Estructura de Endpoints
```
# Admin (acceso completo) - usar AdminModule con RouterModule
POST   /admin/condominiums           - Crear copropiedad
GET    /admin/condominiums           - Listar todas
GET    /admin/condominiums/:id       - Obtener una
PATCH  /admin/condominiums/:id       - Actualizar
DELETE /admin/condominiums/:id       - Soft delete

# Endpoints anidados bajo admin
GET    /admin/condominiums/:id/towers
POST   /admin/condominiums/:id/towers
GET    /admin/condominiums/:id/admins
POST   /admin/condominiums/:id/admins
```

## Dependencias

- **Depende de**: OB-001-B, OB-002-C
- **Bloquea a**: OB-003-B (apartamentos requieren copropiedad)
