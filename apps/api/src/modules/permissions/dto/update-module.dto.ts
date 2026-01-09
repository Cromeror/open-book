import { z } from 'zod';
import { MODULE_TYPES } from '@openbook/business-core';

/**
 * Schema for module navigation configuration
 */
const navConfigSchema = z.object({
  path: z.string().min(1, 'Path es requerido'),
  order: z.number().int().min(0, 'Order debe ser un entero positivo'),
});

/**
 * Schema for updating a module
 */
export const updateModuleSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  type: z.enum(MODULE_TYPES).optional(),
  entity: z.string().max(100).nullable().optional(),
  endpoint: z.string().max(255).nullable().optional(),
  component: z.string().max(100).nullable().optional(),
  navConfig: navConfigSchema.nullable().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateModuleDto = z.infer<typeof updateModuleSchema>;

export function validateUpdateModuleDto(data: unknown): UpdateModuleDto {
  return updateModuleSchema.parse(data);
}
