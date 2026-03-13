import { z } from 'zod';

const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

const responsiveColumnsSchema = z
  .object(Object.fromEntries(breakpoints.map((bp) => [bp, z.number().int().min(1).max(12).optional()])))
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), {
    message: 'Al menos un breakpoint debe tener columnas definidas',
  });

const responsiveSpanSchema = z.object(
  Object.fromEntries(breakpoints.map((bp) => [bp, z.number().int().min(1).max(12).optional()])),
).optional();

const mosaicItemSchema = z.object({
  id: z.string().min(1, 'id es requerido'),
  title: z.string().min(1, 'title es requerido'),
  description: z.string().optional(),
  icon: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  href: z.string().optional(),
  variant: z.enum(['default', 'primary', 'success', 'warning', 'danger']).optional(),
  colSpan: responsiveSpanSchema,
  rowSpan: responsiveSpanSchema,
});

/**
 * Zod schema for MosaicWidget props.
 * Used to validate componentConfig when this widget is selected.
 */
export const mosaicWidgetSchema = z.object({
  items: z.array(mosaicItemSchema).min(1, 'Se requiere al menos un item'),
  columns: responsiveColumnsSchema.optional(),
  gap: z.enum(['sm', 'md', 'lg']).optional(),
});
