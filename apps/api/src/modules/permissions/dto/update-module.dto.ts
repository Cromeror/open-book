import { z } from 'zod';

import { MODULE_TYPES } from './create-module.dto';

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
  type: z.enum(MODULE_TYPES).optional(),
  entity: z.string().max(100).nullable().optional(),
  endpoint: z.string().max(255).nullable().optional(),
  component: z.string().max(100).nullable().optional(),
  navConfig: navConfigSchema.nullable().optional(),
  actionsConfig: z.array(moduleActionSchema).nullable().optional(),
  order: z.number().int().min(0).optional(),
  tags: z.array(z.string().max(50)).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateModuleDto = z.infer<typeof updateModuleSchema>;

/**
 * Validate update module DTO
 */
export function validateUpdateModuleDto(data: unknown): UpdateModuleDto {
  return updateModuleSchema.parse(data);
}

/**
 * Validate actionsConfig for CRUD modules
 * - Only allows CRUD action codes (read, create, update, delete)
 * - Validates action code matches settings type
 * - Validates no duplicate action codes
 *
 * @param actionsConfig - Array of actions to validate
 * @param existingPermissionCodes - Array of permission codes from module_permissions
 */
export function validateCrudActionsConfig(
  actionsConfig: ModuleActionDto[],
  existingPermissionCodes: string[],
): void {
  for (const action of actionsConfig) {
    // Check if action code is valid for CRUD
    if (!CRUD_ACTION_CODES.includes(action.code as CrudActionCode)) {
      throw new Error(
        `Codigo de accion '${action.code}' no es valido para modulos CRUD. ` +
          `Codigos permitidos: ${CRUD_ACTION_CODES.join(', ')}`,
      );
    }

    // Validate settings type matches action code for CRUD actions
    if (action.settings.type !== 'generic' && action.settings.type !== action.code) {
      throw new Error(
        `El tipo de settings '${action.settings.type}' no coincide con el codigo de accion '${action.code}'`,
      );
    }

    // Validate action code exists in module_permissions
    if (!existingPermissionCodes.includes(action.code)) {
      throw new Error(
        `El codigo de accion '${action.code}' no existe como permiso del modulo. ` +
          `Permisos disponibles: ${existingPermissionCodes.join(', ')}`,
      );
    }
  }

  // Check for duplicate action codes
  const codes = actionsConfig.map((a) => a.code);
  const uniqueCodes = new Set(codes);
  if (codes.length !== uniqueCodes.size) {
    throw new Error('No se permiten codigos de accion duplicados');
  }
}

/**
 * Validate actionsConfig for specialized modules
 * - Allows any action code
 * - Settings type should be 'generic'
 * - Validates action code exists in module_permissions
 *
 * @param actionsConfig - Array of actions to validate
 * @param existingPermissionCodes - Array of permission codes from module_permissions
 */
export function validateSpecializedActionsConfig(
  actionsConfig: ModuleActionDto[],
  existingPermissionCodes: string[],
): void {
  for (const action of actionsConfig) {
    // Validate action code exists in module_permissions
    if (!existingPermissionCodes.includes(action.code)) {
      throw new Error(
        `El codigo de accion '${action.code}' no existe como permiso del modulo. ` +
          `Permisos disponibles: ${existingPermissionCodes.join(', ')}`,
      );
    }
  }

  // Check for duplicate action codes
  const codes = actionsConfig.map((a) => a.code);
  const uniqueCodes = new Set(codes);
  if (codes.length !== uniqueCodes.size) {
    throw new Error('No se permiten codigos de accion duplicados');
  }
}
