import { z } from 'zod';

/**
 * Module types constant
 * Defines the available module type options
 */
export const MODULE_TYPES = ['crud', 'specialized'] as const;

/**
 * Schema for module navigation configuration
 */
const navConfigSchema = z.object({
  path: z.string().min(1, 'Path es requerido'),
  order: z.number().int().min(0, 'Order debe ser un entero positivo'),
});

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
 * Schema for read action settings
 */
const readActionSettingsSchema = z.object({
  type: z.literal('read'),
  listColumns: z.array(columnDefinitionSchema),
  filters: z.array(filterDefinitionSchema).optional(),
  sortable: z.array(z.string()).optional(),
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
 * Schema for validation rules
 */
const validationRuleSchema = z.object({
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Schema for create action settings
 */
const createActionSettingsSchema = z.object({
  type: z.literal('create'),
  fields: z.array(fieldDefinitionSchema),
  submitLabel: z.string().optional(),
  layout: z.enum(['single-column', 'two-columns']).optional(),
  validation: z.record(z.string(), validationRuleSchema).optional(),
});

/**
 * Schema for update action settings
 */
const updateActionSettingsSchema = z.object({
  type: z.literal('update'),
  fields: z.array(fieldDefinitionSchema),
  submitLabel: z.string().optional(),
  layout: z.enum(['single-column', 'two-columns']).optional(),
  validation: z.record(z.string(), validationRuleSchema).optional(),
  readOnlyFields: z.array(z.string()).optional(),
});

/**
 * Schema for delete action settings
 */
const deleteActionSettingsSchema = z.object({
  type: z.literal('delete'),
  confirmation: z.string().min(1, 'Mensaje de confirmacion requerido'),
  soft: z.boolean().optional(),
});

/**
 * Schema for generic action settings (specialized modules)
 */
const genericActionSettingsSchema = z
  .object({
    type: z.literal('generic'),
  })
  .passthrough(); // Allow additional properties for specialized modules

/**
 * All action settings - discriminated union
 */
const actionSettingsSchema = z.discriminatedUnion('type', [
  readActionSettingsSchema,
  createActionSettingsSchema,
  updateActionSettingsSchema,
  deleteActionSettingsSchema,
  genericActionSettingsSchema,
]);

/**
 * Schema for a module action
 */
const moduleActionSchema = z.object({
  code: z.string().min(1, 'Codigo de accion requerido').max(50),
  label: z.string().min(1, 'Etiqueta requerida').max(100),
  description: z.string().max(500).optional(),
  settings: actionSettingsSchema,
});

export type ModuleActionDto = z.infer<typeof moduleActionSchema>;

/**
 * Schema for creating a module
 * All fields are required except nullable fields
 */
export const createModuleSchema = z.object({
  code: z
    .string()
    .min(1, 'Codigo es requerido')
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Solo letras minusculas, numeros y guion bajo'),
  name: z.string().min(1, 'Nombre es requerido').max(100),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  type: z.enum(MODULE_TYPES),
  entity: z.string().max(100).nullable().optional(),
  endpoint: z.string().max(255).nullable().optional(),
  component: z.string().max(100).nullable().optional(),
  navConfig: navConfigSchema.nullable().optional(),
  actionsConfig: z.array(moduleActionSchema).nullable().optional(),
  order: z.number().int().min(0).default(0),
  tags: z.array(z.string().max(50)).default([]),
});

export type CreateModuleDto = z.infer<typeof createModuleSchema>;

/**
 * Validate create module DTO
 */
export function validateCreateModuleDto(data: unknown): CreateModuleDto {
  return createModuleSchema.parse(data);
}
