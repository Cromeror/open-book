// Components
export { ModuleCreateForm } from './ModuleCreateForm';
export { ModuleEditForm } from './ModuleEditForm';
export { ActionsConfigEditor } from './ActionsConfigEditor';

// Types
export type {
  ModulePermission,
  NavConfig,
  ActionSettings,
  ModuleAction,
  ModuleType,
  ModuleFormData,
  ValidationError,
  ValidationResult,
  ModuleFormBaseProps,
  ModuleCreateFormProps,
  ModuleEditFormProps,
} from './types';

// Validation utilities
export {
  validateModuleForm,
  validateCode,
  validateName,
  normalizeCode,
  normalizeTags,
} from './validation';

// Constants
export {
  CRUD_ACTION_CODES,
  DEFAULT_CRUD_ACTIONS,
  SPECIALIZED_ACTION_TEMPLATES,
  getDefaultSettingsForCode,
  getDefaultLabelForCode,
  isCrudActionCode,
} from './constants';
