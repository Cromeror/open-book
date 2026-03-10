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
  ResourcePublic,
  ResourceHttpMethod,
  ResourceHttpMethodPublic,
  ResourceHttpMethodLink,
  ResourceLinkParamMapping,
  HttpMethod,
  HateoasLink,
} from './resource.types';
export { HTTP_METHODS } from './resource.types';

// Resource Metadata (payload/response schemas)
export type {
  PayloadMetadata,
  ResponseMetadata,
  PropertySchema,
  ParameterDefinition,
  RequestBodyDefinition,
  SuccessResponseDefinition,
} from './resource-metadata.types';

// Capability Presets
export type { CapabilityPreset, PresetCapability } from './capability-preset.types';
export { presetToResourceHttpMethods } from './capability-preset.types';

// Permissions
export type { Permission, PermissionModule } from './permission.types';

// Session Context
export type { SessionContext, SessionContextFieldDescriptor } from './session-context.types';

// Integrations
export type { Integration, AuthType, ConnectionType } from './integration.types';

// Organizations
export type { Organization, ExternalUser } from './organization.types';

// Modules
export type {
  PostActionStep,
  LinkUiConfig,
  ModuleActionConfig,
  ModuleHttpMethodWithConfig,
  ModuleResourceWithActionsResponse,
  ModuleWithActionsResponse,
  ListColumnConfig,
  ListFilterConfig,
  FormFieldConfig,
  ListUiConfig,
  DetailUiConfig,
  FormUiConfig,
  ConfirmUiConfig,
  ModalFormUiConfig,
  ResourceUiConfig,
} from './module.types';
export {
  isListUiConfig,
  isDetailUiConfig,
  isFormUiConfig,
  isConfirmUiConfig,
  isModalFormUiConfig,
} from './module.types';
