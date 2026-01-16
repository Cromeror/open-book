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
// Action Settings Constants
// ============================================

export const ACTION_SETTINGS_TYPES = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  GENERIC: 'generic',
} as const;

export type ActionSettingsType = (typeof ACTION_SETTINGS_TYPES)[keyof typeof ACTION_SETTINGS_TYPES];

export const LIST_COLUMN_FORMATS = {
  TEXT: 'text',
  CURRENCY: 'currency',
  DATE: 'date',
  DATETIME: 'datetime',
  BOOLEAN: 'boolean',
  BADGE: 'badge',
} as const;

export type ListColumnFormat = (typeof LIST_COLUMN_FORMATS)[keyof typeof LIST_COLUMN_FORMATS];

export const FILTER_TYPES = {
  TEXT: 'text',
  SELECT: 'select',
  DATE: 'date',
  DATE_RANGE: 'dateRange',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
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
  DATE: 'date',
  DATETIME: 'datetime',
  BOOLEAN: 'boolean',
  EMAIL: 'email',
  PASSWORD: 'password',
  CURRENCY: 'currency',
} as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[keyof typeof FORM_FIELD_TYPES];

// ============================================
// Action Settings Interfaces
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
  type: FilterType;
  label: string;
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
  defaultValue?: unknown;
}

/**
 * Settings for READ actions (list/detail views)
 */
export interface ActionSettingsRead {
  type: typeof ACTION_SETTINGS_TYPES.READ;
  listColumns: ListColumn[];
  filters?: ListFilter[];
  defaultSort?: SortConfig;
  pageSize?: number;
  showDetail?: boolean;
}

/**
 * Settings for CREATE actions
 */
export interface ActionSettingsCreate {
  type: typeof ACTION_SETTINGS_TYPES.CREATE;
  fields: FormField[];
  successMessage?: string;
  redirectAfter?: string;
}

/**
 * Settings for UPDATE actions
 */
export interface ActionSettingsUpdate {
  type: typeof ACTION_SETTINGS_TYPES.UPDATE;
  fields: FormField[];
  successMessage?: string;
  redirectAfter?: string;
}

/**
 * Settings for DELETE actions
 */
export interface ActionSettingsDelete {
  type: typeof ACTION_SETTINGS_TYPES.DELETE;
  confirmation: string;
  soft: boolean;
  successMessage?: string;
}

/**
 * Settings for GENERIC/specialized actions
 */
export interface ActionSettingsGeneric {
  type: typeof ACTION_SETTINGS_TYPES.GENERIC;
  [key: string]: unknown;
}

/**
 * Union type for all action settings
 */
export type ActionSettings =
  | ActionSettingsRead
  | ActionSettingsCreate
  | ActionSettingsUpdate
  | ActionSettingsDelete
  | ActionSettingsGeneric;

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
  type: ModuleType;
  entity?: string;
  endpoint?: string;
  component?: string;
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
