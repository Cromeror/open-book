/**
 * Converts PayloadMetadata (OpenAPI-like schema) into:
 * 1. A Zod validation schema for react-hook-form
 * 2. A flat list of field descriptors for rendering
 */

import { z, type ZodObject } from 'zod';
import type { PayloadMetadata, PropertySchema } from '@/types/business';

export interface MetadataFieldDescriptor {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'password' | 'textarea' | 'checkbox' | 'select';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
}

interface PayloadMetadataResult {
  schema: ZodObject;
  fields: MetadataFieldDescriptor[];
}

/**
 * Map a PropertySchema type+format to a field rendering type.
 */
function resolveFieldType(prop: PropertySchema): MetadataFieldDescriptor['type'] {
  if (prop.enum && prop.enum.length > 0) return 'select';

  switch (prop.type) {
    case 'boolean':
      return 'checkbox';
    case 'number':
    case 'integer':
      return 'number';
    case 'string':
      switch (prop.format) {
        case 'date':
        case 'date-time':
          return 'date';
        case 'email':
          return 'email';
        case 'password':
          return 'password';
        default:
          return prop.maxLength && prop.maxLength > 255 ? 'textarea' : 'text';
      }
    default:
      return 'text';
  }
}

/**
 * Build a Zod schema from a single PropertySchema.
 */
function propertyToZod(prop: PropertySchema, required: boolean): z.ZodType {
  let schema: z.ZodType;

  switch (prop.type) {
    case 'string': {
      let s = z.string();
      if (required) s = s.min(1, 'Campo requerido');
      if (prop.minLength) s = s.min(prop.minLength);
      if (prop.maxLength) s = s.max(prop.maxLength);
      if (prop.pattern) s = s.regex(new RegExp(prop.pattern));
      if (prop.format === 'email') s = s.email('Email invalido');
      if (prop.format === 'uuid') s = s.uuid();
      if (prop.enum) s = s.refine((v) => prop.enum!.includes(v), { message: `Debe ser uno de: ${prop.enum.join(', ')}` });
      schema = s;
      break;
    }
    case 'number':
    case 'integer': {
      let n = z.coerce.number();
      if (prop.minimum !== undefined) n = n.min(prop.minimum);
      if (prop.maximum !== undefined) n = n.max(prop.maximum);
      schema = n;
      break;
    }
    case 'boolean':
      schema = z.boolean();
      break;
    default:
      schema = z.unknown();
  }

  if (!required) {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Convert PayloadMetadata's requestBody schema into a Zod object schema
 * and a list of field descriptors for form rendering.
 */
export function payloadMetadataToForm(metadata: PayloadMetadata): PayloadMetadataResult {
  const properties = metadata.requestBody?.schema?.properties;

  if (!properties) {
    return { schema: z.object({}), fields: [] };
  }

  const zodShape: Record<string, z.ZodType> = {};
  const fields: MetadataFieldDescriptor[] = [];

  for (const [name, prop] of Object.entries(properties)) {
    const required = prop.required ?? false;

    zodShape[name] = propertyToZod(prop, required);

    fields.push({
      name,
      label: prop.description ?? name,
      type: resolveFieldType(prop),
      required,
      placeholder: prop.example != null ? String(prop.example) : undefined,
      options: prop.enum?.map((v) => ({ value: v, label: v })),
      min: prop.minimum,
      max: prop.maximum,
    });
  }

  return {
    schema: z.object(zodShape),
    fields,
  };
}
