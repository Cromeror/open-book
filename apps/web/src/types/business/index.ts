/**
 * Business Domain Types
 *
 * Pure business domain types for OpenBook.
 * These are the source of truth for business concepts used in the frontend.
 *
 * IMPORTANT: This folder contains ONLY business types.
 * - NO transport types (HTTP responses, gRPC messages)
 * - NO framework-specific code (validation, decorators)
 * - NO DTOs (those go in api.types.ts or grpc/types.ts)
 *
 * @see README.md for guidelines
 */

// User
export type { User, PublicUser } from './user.types';

// Resources (HATEOAS)
export type {
  Resource,
  ResourceCapability,
  ResourceScope,
  HttpMethod,
  HateoasLink,
} from './resource.types';

// Capability Presets
export type { CapabilityPreset, PresetCapability } from './capability-preset.types';
export { presetToResourceCapabilities } from './capability-preset.types';

// Permissions
export type { Permission, PermissionModule, PermissionContext } from './permission.types';
export { Scope } from './permission.types';

// Modules
export type {
  ModuleType,
  ModuleWithActions,
  ModuleAction,
  ReadActionSettings,
  CreateActionSettings,
  UpdateActionSettings,
  DeleteActionSettings,
  ExportActionSettings,
  TypedModuleAction,
} from './module.types';
export { MODULE_TYPES } from './module.types';
