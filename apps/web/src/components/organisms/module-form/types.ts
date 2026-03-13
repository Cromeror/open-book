/**
 * Types and interfaces for module forms
 * Shared between ModuleCreateForm and ModuleEditForm
 */

// ============================================
// Base Types
// ============================================

export interface ModulePermission {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface NavConfig {
  path: string;
  order: number;
}

// ============================================
// UI Component Constants
// ============================================

export const UI_COMPONENTS = {
  LIST: 'list',
  DETAIL: 'detail',
  FORM: 'form',
  CONFIRM: 'confirm',
  MODAL_FORM: 'modal-form',
} as const;

export type UiComponentType = (typeof UI_COMPONENTS)[keyof typeof UI_COMPONENTS];

export const LIST_COLUMN_FORMATS = {
  DATE: 'date',
  MONEY: 'money',
  BOOLEAN: 'boolean',
} as const;

export type ListColumnFormat = (typeof LIST_COLUMN_FORMATS)[keyof typeof LIST_COLUMN_FORMATS];

export const FILTER_TYPES = {
  TEXT: 'text',
  SELECT: 'select',
  DATE: 'date',
  DATE_RANGE: 'dateRange',
} as const;

export type FilterType = (typeof FILTER_TYPES)[keyof typeof FILTER_TYPES];

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = (typeof SORT_ORDERS)[keyof typeof SORT_ORDERS];

export const FORM_FIELD_TYPES = {
  TEXT: 'text',
  TEXTAREA: 'textarea',
  NUMBER: 'number',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  DATE: 'date',
  BOOLEAN: 'boolean',
  CHECKBOX: 'checkbox',
  EMAIL: 'email',
  PASSWORD: 'password',
  MONEY: 'money',
} as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[keyof typeof FORM_FIELD_TYPES];

// ============================================
// UI Config Interfaces (mirror of ResourceUiConfig in module.types.ts)
// ============================================

/**
 * Column configuration for list views
 */
export interface ListColumn {
  field: string;
  label: string;
  sortable?: boolean;
  format?: ListColumnFormat;
}

/**
 * Filter configuration for list views
 */
export interface ListFilter {
  field: string;
  label: string;
  type: FilterType;
  options?: Array<{ value: string; label: string }>;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  order: SortOrder;
}

/**
 * Field configuration for forms
 */
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  placeholder?: string;
  helpText?: string;
}

/**
 * Settings for list component
 */
export interface ActionSettingsList {
  component: typeof UI_COMPONENTS.LIST;
  columns: ListColumn[];
  filters?: ListFilter[];
  defaultSort?: SortConfig;
  search?: { enabled: boolean; placeholder?: string; fields?: string[] };
  pagination?: { enabled: boolean; defaultPageSize?: number; pageSizeOptions?: number[] };
}

/**
 * Settings for detail component
 */
export interface ActionSettingsDetail {
  component: typeof UI_COMPONENTS.DETAIL;
  fields: Array<{ field: string; label: string; format?: ListColumnFormat }>;
}

/**
 * Settings for form component (create/edit)
 */
export interface ActionSettingsForm {
  component: typeof UI_COMPONENTS.FORM;
  fields: FormField[];
  submitLabel?: string;
  layout?: 'single-column' | 'two-columns';
  readOnlyFields?: string[];
}

/**
 * Settings for confirm component
 */
export interface ActionSettingsConfirm {
  component: typeof UI_COMPONENTS.CONFIRM;
  message: string;
  variant?: 'danger' | 'warning' | 'success';
  icon?: string;
}

/**
 * Settings for modal-form component
 */
export interface ActionSettingsModalForm {
  component: typeof UI_COMPONENTS.MODAL_FORM;
  fields: FormField[];
  submitLabel?: string;
}

/**
 * Union type for all action settings
 */
export type ActionSettings =
  | ActionSettingsList
  | ActionSettingsDetail
  | ActionSettingsForm
  | ActionSettingsConfirm
  | ActionSettingsModalForm;

export interface ModuleAction {
  code: string;
  label: string;
  description?: string;
  settings?: ActionSettings;
}

// ============================================
// Form Data Types
// ============================================

export type ModuleType = 'crud' | 'specialized';

export interface ModuleFormData {
  code: string;
  name: string;
  description?: string;
  icon?: string;
  type?: ModuleType;
  entity?: string;
  endpoint?: string;
  component?: string;
  componentConfig?: Record<string, unknown>;
  navConfig?: NavConfig;
  actionsConfig?: ModuleAction[];
  order?: number;
  tags?: string[];
}

// ============================================
// Validation Types
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================
// Form Props Types
// ============================================

export interface ModuleFormBaseProps {
  onSubmit: (data: ModuleFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface ModuleCreateFormProps extends ModuleFormBaseProps {
  initialOrder?: number;
}

export interface ModuleEditFormProps extends ModuleFormBaseProps {
  initialData: ModuleFormData;
  permissions?: ModulePermission[];
}
