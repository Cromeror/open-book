/**
 * Types for module actions and metadata
 * Used by /api/auth/me to return segregated actions based on user permissions
 *
 * Key principle: action code = permission code
 * If a user has permission 'read', they receive the action with code 'read'
 */

// ============================================
// Action Settings Types
// ============================================

/**
 * Base settings for all action types
 */
export type ActionSettings = CrudActionSettings | GenericActionSettings;

/**
 * Settings for CRUD actions (typed)
 */
export type CrudActionSettings =
  | ReadActionSettings
  | CreateActionSettings
  | UpdateActionSettings
  | DeleteActionSettings;

/**
 * Settings for 'read' action
 */
export interface ReadActionSettings {
  type: 'read';
  listColumns: ColumnDefinition[];
  filters?: FilterDefinition[];
  sortable?: string[];
  defaultSort?: { field: string; order: 'asc' | 'desc' };
  search?: {
    enabled: boolean;
    placeholder?: string;
    fields?: string[];
  };
  pagination?: {
    enabled: boolean;
    defaultPageSize?: number;
    pageSizeOptions?: number[];
  };
}

/**
 * Settings for 'create' action
 */
export interface CreateActionSettings {
  type: 'create';
  fields: FieldDefinition[];
  submitLabel?: string;
  layout?: 'single-column' | 'two-columns';
  validation?: ValidationRules;
}

/**
 * Settings for 'update' action
 */
export interface UpdateActionSettings {
  type: 'update';
  fields: FieldDefinition[];
  submitLabel?: string;
  layout?: 'single-column' | 'two-columns';
  validation?: ValidationRules;
  readOnlyFields?: string[];
}

/**
 * Settings for 'delete' action
 */
export interface DeleteActionSettings {
  type: 'delete';
  confirmation: string;
  soft?: boolean;
}

/**
 * Settings for specialized (non-CRUD) actions
 */
export interface GenericActionSettings {
  type: 'generic';
  [key: string]: unknown;
}

// ============================================
// Module Action
// ============================================

/**
 * A module action with its settings
 * The action code matches the permission code
 */
export interface ModuleAction {
  code: string; // 'read', 'create', 'update', 'delete', 'view', 'export', etc.
  label: string; // 'Ver', 'Crear', 'Editar', 'Eliminar'
  description?: string;
  settings: ActionSettings;
}

// ============================================
// Module with Actions (API Response)
// ============================================

/**
 * Module with segregated actions based on user permissions
 * Returned by /api/auth/me
 */
export interface ModuleWithActions {
  code: string; // 'objetivos', 'aportes', etc.
  label: string; // 'Objetivos de Recaudo'
  description: string;
  icon: string; // 'Target' (lucide icon name)
  type: 'crud' | 'specialized';

  nav: {
    path: string; // '/goals' or '/m/objetivos'
    order: number;
  };

  // CRUD-specific fields
  entity?: string; // 'Objetivo' (only for CRUD)
  endpoint?: string; // '/api/goals' (only for CRUD)

  // Specialized-specific fields
  component?: string; // 'ReportsModule' (only for specialized)

  // Segregated actions (only those the user has permission for)
  actions: ModuleAction[];
}

// ============================================
// Field and Column Definitions
// ============================================

/**
 * Field definition for forms
 * Matches @openbook/business-core CreateActionSettings.fields
 */
export interface FieldDefinition {
  name: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'select'
    | 'textarea'
    | 'boolean'
    | 'money'
    | 'email'
    | 'password'
    | 'checkbox'
    | 'multiselect';
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
}

/**
 * Column definition for lists/tables
 */
export interface ColumnDefinition {
  field: string;
  label: string;
  sortable?: boolean;
  format?: 'date' | 'money' | 'boolean';
}

/**
 * Filter definition for lists
 */
export interface FilterDefinition {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: Array<{ value: string; label: string }>;
}

/**
 * Validation rules for forms
 */
export interface ValidationRules {
  [field: string]: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// ============================================
// Auth Me Response (Extended)
// ============================================

/**
 * Extended auth/me response with modules and actions
 */
export interface AuthMeResponseWithModules {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: ModuleWithActions[];
}
