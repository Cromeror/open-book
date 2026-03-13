# Widgets

Los widgets son componentes visuales configurables que se renderizan dentro de los modulos del sistema. Cada widget se registra en el frontend con un nombre unico y un schema Zod que valida su configuracion.

## Arquitectura

```
Base de datos (modules)
  ├── component        → nombre del widget (e.g. "MosaicWidget")
  └── component_config → datos de entrada del widget (JSON, validado por Zod)
           ↓
API (/api/auth/me)
  → Incluye component + componentConfig en la respuesta del modulo
           ↓
Frontend (GenericModule)
  → Resuelve el widget via component-registry
  → Pasa componentConfig como props al widget
  → Renderiza el widget ARRIBA del contenido generico del modulo
```

## Crear un widget

### 1. Crear el componente

Crear el archivo en `apps/web/src/components/widgets/`:

```typescript
// apps/web/src/components/widgets/MyWidget.tsx
'use client';

export interface MyWidgetProps {
  title: string;
  items: Array<{ id: string; label: string }>;
}

export function MyWidget(
  props: MyWidgetProps | { moduleCode: string; componentConfig: Record<string, unknown> }
) {
  // Extraer config: puede venir directo o via componentConfig
  const config: MyWidgetProps = 'componentConfig' in props
    ? (props.componentConfig as unknown as MyWidgetProps)
    : props;

  return (
    <div>
      <h2>{config.title}</h2>
      {config.items.map((item) => (
        <div key={item.id}>{item.label}</div>
      ))}
    </div>
  );
}
```

**Importante:** El widget debe aceptar dos formas de props:
- **Uso directo:** `MyWidgetProps` (cuando se usa programaticamente)
- **Uso via modulo:** `{ moduleCode, componentConfig }` (cuando se renderiza desde GenericModule)

### 2. Crear el schema Zod

Crear el schema en `apps/web/src/components/widgets/`:

```typescript
// apps/web/src/components/widgets/my-widget.schema.ts
import { z } from 'zod';

export const myWidgetSchema = z.object({
  title: z.string().min(1, 'title es requerido'),
  items: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
  })).min(1, 'Se requiere al menos un item'),
});
```

El schema Zod se usa para:
- Validar `componentConfig` en el formulario de admin antes de guardar
- Mostrar errores de validacion en tiempo real al editar la configuracion

### 3. Registrar en el component-registry

Editar `apps/web/src/components/modules/component-registry.ts`:

```typescript
import { MyWidget } from '@/components/widgets/MyWidget';
import { myWidgetSchema } from '@/components/widgets/my-widget.schema';

const registry: Record<string, WidgetRegistryEntry> = {
  // ... widgets existentes
  MyWidget: {
    component: MyWidget as unknown as ComponentType<WidgetProps>,
    schema: myWidgetSchema,
  },
};
```

### 4. Exportar desde el index

Editar `apps/web/src/components/widgets/index.ts`:

```typescript
export { MyWidget } from './MyWidget';
export type { MyWidgetProps } from './MyWidget';
```

## Configurar un widget en un modulo

### Via admin UI

1. Ir a la edicion del modulo en el panel de administracion
2. En el campo **Componente**, seleccionar el widget deseado
3. Aparecera la seccion **Configuracion del Widget** con un editor JSON
4. Escribir la configuracion (se valida en tiempo real contra el schema Zod)
5. Guardar el modulo

### Via API

```bash
PATCH /api/admin/modules/:id
{
  "component": "MosaicWidget",
  "componentConfig": {
    "items": [
      { "id": "1", "title": "Usuarios", "value": 42, "variant": "primary" },
      { "id": "2", "title": "Pendientes", "value": 5, "variant": "warning" }
    ],
    "columns": { "xs": 1, "sm": 2, "md": 3 },
    "gap": "md"
  }
}
```

### Via migracion

```typescript
await queryRunner.query(`
  UPDATE modules SET
    component = 'MosaicWidget',
    component_config = '${JSON.stringify({
      items: [
        { id: "1", title: "Dashboard", value: "12", variant: "primary" }
      ],
      columns: { xs: 1, sm: 2 }
    })}'::jsonb
  WHERE code = 'mi_modulo'
`);
```

## Widgets disponibles

### MosaicWidget

Renderiza tiles en un grid responsive tipo mosaico.

**Props (`MosaicWidgetProps`):**

| Prop | Tipo | Requerido | Default | Descripcion |
|------|------|-----------|---------|-------------|
| `items` | `MosaicItemConfig[]` | Si | — | Items a renderizar |
| `columns` | `ResponsiveColumns` | No | `{ xs: 1, sm: 2, md: 3 }` | Columnas por breakpoint |
| `gap` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | Espaciado entre items |

**`MosaicItemConfig`:**

| Prop | Tipo | Requerido | Descripcion |
|------|------|-----------|-------------|
| `id` | `string` | Si | Identificador unico |
| `title` | `string` | Si | Titulo del tile |
| `description` | `string` | No | Texto secundario |
| `icon` | `string` | No | Nombre de icono Lucide |
| `value` | `string \| number` | No | Valor destacado |
| `href` | `string` | No | Link (hace el tile clickeable) |
| `variant` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | No | Estilo visual |
| `colSpan` | `ResponsiveSpan` | No | Span por breakpoint |

**`ResponsiveColumns` / `ResponsiveSpan`:** `{ xs?: number, sm?: number, md?: number, lg?: number, xl?: number }`

**Ejemplo de configuracion:**

```json
{
  "items": [
    { "id": "1", "title": "Total Usuarios", "value": 142, "variant": "primary" },
    { "id": "2", "title": "Pendientes", "value": 5, "variant": "warning", "href": "/m/pqr" },
    { "id": "3", "title": "Recaudado", "value": "$3.200.000", "variant": "success", "colSpan": { "xs": 1, "md": 2 } }
  ],
  "columns": { "xs": 1, "sm": 2, "md": 3, "lg": 4 },
  "gap": "md"
}
```

## Flujo de datos

1. **Admin configura** `component` + `componentConfig` en el modulo
2. **API valida** `componentConfig` como `Record<string, unknown>` (schema libre en el backend)
3. **Frontend recibe** los datos en `/api/auth/me` dentro de `ModuleWithActionsResponse`
4. **GenericModule** resuelve el widget via `resolveModuleComponent(metadata.component)`
5. **Widget recibe** `{ moduleCode, componentConfig }` y extrae sus props tipados
6. **Widget renderiza** arriba del contenido generico del modulo

## Archivos clave

| Archivo | Proposito |
|---------|-----------|
| `apps/web/src/components/modules/component-registry.ts` | Registro de widgets: nombre → componente + schema |
| `apps/web/src/components/widgets/` | Directorio de widgets |
| `apps/web/src/components/widgets/<name>.schema.ts` | Schema Zod por widget |
| `apps/web/src/components/modules/GenericModule.tsx` | Renderiza el widget arriba del contenido generico |
| `apps/web/src/components/organisms/module-form/ModuleEditForm.tsx` | Editor de config en el admin |
| `apps/api/src/entities/module.entity.ts` | Entidad con campos `component` y `component_config` |
