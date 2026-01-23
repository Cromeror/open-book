/**
 * Validation schemas index
 *
 * Centralized exports for all Zod validation schemas
 */

// Authentication schemas
export {
  loginSchema,
  registerSchema,
  passwordRecoverySchema,
  resetPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type PasswordRecoveryFormData,
  type ResetPasswordFormData,
} from './auth.schema';

// Resource schemas (HATEOAS configuration)
export {
  capabilitySchema,
  resourceFormSchema,
  type ResourceFormData,
  type CapabilityFormData,
} from './resource.schema';
