import { z } from 'zod';

/**
 * Schema for module navigation configuration
 */
const navConfigSchema = z.object({
  path: z.string().min(1, 'Path es requerido'),
  order: z.number().int().min(0, 'Order debe ser un entero positivo'),
});

/**
 * CRUD action codes - these are the only valid codes for CRUD modules
 */
export const CRUD_ACTION_CODES = ['read', 'create', 'update', 'delete'] as const;
export type CrudActionCode = (typeof CRUD_ACTION_CODES)[number];

/**
 * Schema for column definition (read action)
 */
const columnDefinitionSchema = z.object({
  field: z.string().min(1),
  label: z.string().min(1),
  sortable: z.boolean().optional(),
  format: z.enum(['date', 'money', 'boolean']).optional(),
});

/**
 * Schema for filter definition (read action)
 */
const filterDefinitionSchema = z.object({
  field: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'select', 'date', 'dateRange']),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .optional(),
});

/**
 * Schema for field definition (create/update actions)
 */
const fieldDefinitionSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum([
    'text',
    'number',
    'date',
    'select',
    'textarea',
    'boolean',
    'money',
    'email',
    'password',
    'checkbox',
    'multiselect',
  ]),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
      custom: z.string().optional(),
    })
    .optional(),
});

/**
 * Schema for list UI config — renders a paginated table
 */
const listUiConfigSchema = z.object({
  component: z.literal('list'),
  columns: z.array(columnDefinitionSchema),
  filters: z.array(filterDefinitionSchema).optional(),
  defaultSort: z
    .object({
      field: z.string(),
      order: z.enum(['asc', 'desc']),
    })
    .optional(),
  search: z
    .object({
      enabled: z.boolean(),
      placeholder: z.string().optional(),
      fields: z.array(z.string()).optional(),
    })
    .optional(),
  pagination: z
    .object({
      enabled: z.boolean(),
      defaultPageSize: z.number().optional(),
      pageSizeOptions: z.array(z.number()).optional(),
    })
    .optional(),
});

/**
 * Schema for detail UI config — renders a key-value detail view
 */
const detailUiConfigSchema = z.object({
  component: z.literal('detail'),
  fields: z.array(
    z.object({
      field: z.string().min(1),
      label: z.string().min(1),
      format: z.enum(['date', 'money', 'boolean']).optional(),
    }),
  ),
});

/**
 * Schema for form UI config — renders a create/edit form
 */
const formUiConfigSchema = z.object({
  component: z.literal('form'),
  fields: z.array(fieldDefinitionSchema),
  submitLabel: z.string().optional(),
  layout: z.enum(['single-column', 'two-columns']).optional(),
  readOnlyFields: z.array(z.string()).optional(),
});

/**
 * Schema for confirm UI config — renders a confirmation dialog
 */
const confirmUiConfigSchema = z.object({
  component: z.literal('confirm'),
  message: z.string().min(1, 'Mensaje de confirmacion requerido'),
  variant: z.enum(['danger', 'warning', 'success']).optional(),
  icon: z.string().optional(),
});

/**
 * Schema for modal-form UI config — renders a small modal with a form
 */
const modalFormUiConfigSchema = z.object({
  component: z.literal('modal-form'),
  fields: z.array(fieldDefinitionSchema),
  submitLabel: z.string().optional(),
});

/**
 * All resource UI configs - discriminated union by `component`
 */
const resourceUiConfigSchema = z.discriminatedUnion('component', [
  listUiConfigSchema,
  detailUiConfigSchema,
  formUiConfigSchema,
  confirmUiConfigSchema,
  modalFormUiConfigSchema,
]);

/**
 * Schema for a single step in a post-action chain
 */
const postActionStepSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('confirm'), message: z.string().min(1), variant: z.enum(['danger', 'warning']).optional() }),
  z.object({ type: z.literal('execute') }),
  z.object({ type: z.literal('navigate'), target: z.enum(['_self', '_blank']).optional(), url: z.string().min(1).max(500).optional() }),
  z.object({ type: z.literal('refresh') }),
]);

/**
 * Schema for link UI config — per-rel display configuration
 */
const linkUiConfigSchema = z.object({
  icon: z.string().max(50).optional(),
  label: z.string().max(100).optional(),
  variant: z.enum(['default', 'danger', 'warning', 'success']).optional(),
  postAction: z.array(postActionStepSchema).optional(),
});

/**
 * Schema for a module action config
 */
const moduleActionSchema = z.object({
  code: z.string().min(1, 'Codigo de accion requerido').max(50),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  label: z.string().min(1).max(100).optional(),
  uiConfig: resourceUiConfigSchema.optional(),
  linkConfig: z.record(z.string(), linkUiConfigSchema).optional(),
});

export type ModuleActionDto = z.infer<typeof moduleActionSchema>;

/**
 * Schema for updating a module
 */
export const updateModuleSchema = z.object({
  code: z
    .string()
    .min(1, 'Codigo es requerido')
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Solo letras minusculas, numeros y guion bajo')
    .optional(),
  name: z.string().min(1, 'Nombre es requerido').max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  entity: z.string().max(100).nullable().optional(),
  endpoint: z.string().max(255).nullable().optional(),
  component: z.string().max(100).nullable().optional(),
  componentConfig: z.record(z.string(), z.unknown()).nullable().optional(),
  navConfig: navConfigSchema.nullable().optional(),
  actionsConfig: z.array(moduleActionSchema).nullable().optional(),
  order: z.number().int().min(0).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isActive: z.boolean().optional(),
  /** Resource codes to associate with this module (replaces existing associations) */
  resourceCodes: z.array(z.string().min(1).max(50)).optional(),
});

export type UpdateModuleDto = z.infer<typeof updateModuleSchema>;

/**
 * Validate update module DTO
 */
export function validateUpdateModuleDto(data: unknown): UpdateModuleDto {
  return updateModuleSchema.parse(data);
}

/**
 * Validate actionsConfig
 * - Validates action code exists in module_permissions
 * - Validates no duplicate action codes
 *
 * @param actionsConfig - Array of actions to validate
 * @param existingPermissionCodes - Array of permission codes from module_permissions
 */
export function validateActionsConfig(
  actionsConfig: ModuleActionDto[],
  existingPermissionCodes: string[],
): void {
  for (const action of actionsConfig) {
    if (!existingPermissionCodes.includes(action.code)) {
      throw new Error(
        `El codigo de accion '${action.code}' no existe como permiso del modulo. ` +
          `Permisos disponibles: ${existingPermissionCodes.join(', ')}`,
      );
    }
  }

  const codes = actionsConfig.map((a) => a.code);
  const uniqueCodes = new Set(codes);
  if (codes.length !== uniqueCodes.size) {
    throw new Error('No se permiten codigos de accion duplicados');
  }
}
