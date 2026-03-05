// Components
export { ModuleCreateForm } from './ModuleCreateForm';
export { ModuleEditForm } from './ModuleEditForm';
export { ActionsConfigEditor } from './ActionsConfigEditor';

// Types
export type {
  ModulePermission,
  NavConfig,
  ActionSettings,
  ActionSettingsList,
  ActionSettingsDetail,
  ActionSettingsForm,
  ActionSettingsConfirm,
  ActionSettingsModalForm,
  UiComponentType,
  ListColumn,
  ListColumnFormat,
  ListFilter,
  FilterType,
  SortConfig,
  SortOrder,
  FormField,
  FormFieldType,
  ModuleAction,
  ModuleType,
  ModuleFormData,
  ValidationError,
  ValidationResult,
  ModuleFormBaseProps,
  ModuleCreateFormProps,
  ModuleEditFormProps,
} from './types';

// Type Constants
export {
  UI_COMPONENTS,
  LIST_COLUMN_FORMATS,
  FILTER_TYPES,
  SORT_ORDERS,
  FORM_FIELD_TYPES,
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
