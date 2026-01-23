# Validation Schemas

This directory contains all Zod validation schemas for the frontend application.

## Structure

```
validations/
├── index.ts              # Central export file
├── auth.schema.ts        # Authentication forms (login, register, password recovery)
├── resource.schema.ts    # HATEOAS resource configuration
└── README.md            # This file
```

## Guidelines

### 1. Schema Organization

- Each domain/feature should have its own schema file (e.g., `auth.schema.ts`, `goals.schema.ts`)
- Use descriptive names ending with `.schema.ts`
- Export both the schema and the inferred type

```typescript
// ✅ Good
export const loginSchema = z.object({
  email: z.string().email('El formato del correo no es válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ❌ Bad - inline in component
const loginSchema = z.object({ ... });
```

### 2. Error Messages

- Write error messages in Spanish (user-facing)
- Be specific and actionable
- Use consistent language

```typescript
// ✅ Good
z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')

// ❌ Bad
z.string().min(8, 'Invalid')
```

### 3. Complex Validations

For cross-field validations, use `.refine()`:

```typescript
export const registerSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
```

### 4. Usage with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';

const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  defaultValues: { ... },
});
```

### 5. Importing Schemas

Always import from the domain-specific schema file or from the index:

```typescript
// ✅ Good - from specific file
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';

// ✅ Good - from index
import { loginSchema, type LoginFormData } from '@/lib/validations';

// ❌ Bad - don't define inline
const schema = z.object({ ... });
```

## Schema Naming Convention

- **Schema:** `{domain}{Action}Schema` (e.g., `loginSchema`, `createGoalSchema`)
- **Type:** `{Domain}{Action}FormData` (e.g., `LoginFormData`, `CreateGoalFormData`)

## Adding New Schemas

1. Create a new file in this directory: `{domain}.schema.ts`
2. Define your schemas and export types
3. Add exports to `index.ts`
4. Document complex validations with JSDoc comments

```typescript
/**
 * Goal creation form validation schema
 *
 * Validates:
 * - Target amount must be positive
 * - End date must be after start date
 * - Name must be unique (checked server-side)
 */
export const createGoalSchema = z.object({ ... });
```

## Related Files

- **Backend validation:** `apps/api/src/modules/{module}/dto/*.dto.ts`
- **Frontend types:** `apps/web/src/types/*.ts`
- **Environment validation:** `apps/web/src/config/env.ts`
