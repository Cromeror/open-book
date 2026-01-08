/**
 * Module and Action type definitions
 *
 * These types define the structure of modules and their available actions.
 * Used by both API (to serve) and Web (to consume) for type safety.
 */

/**
 * A module with its available actions for a user
 */
export interface ModuleWithActions {
  /** Unique module code (e.g., 'goals', 'users') */
  code: string;
  /** Display label for the module */
  label: string;
  /** Description */
  description: string;
  /** Icon name (Lucide icon) */
  icon: string;
  /** Module type */
  type: 'crud' | 'specialized';
  /** Navigation configuration */
  nav: {
    path: string;
    order: number;
  };
  /** API endpoint for this module (for CRUD modules) */
  endpoint?: string;
  /** Entity name (singular, for display, for CRUD modules) */
  entity?: string;
  /** Component name (for specialized modules) */
  component?: string;
  /** Actions available for this module */
  actions: ModuleAction[];
}

/**
 * An action within a module
 */
export interface ModuleAction {
  /** Action code (also serves as permission code) */
  code: string;
  /** Display label for the action */
  label: string;
  /** Optional description */
  description?: string;
  /** Action-specific settings (typed per action) */
  settings?: unknown;
}

/**
 * Settings for 'read' action (list view)
 */
export interface ReadActionSettings {
  /** Type discriminator */
  type: 'read';
  /** Columns to display in the list */
  listColumns: Array<{
    field: string;
    label: string;
    sortable?: boolean;
    format?: 'date' | 'money' | 'boolean';
  }>;
  /** Optional filters for the list */
  filters?: Array<{
    field: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'dateRange';
    options?: Array<{ value: string; label: string }>;
  }>;
  /** Fields that can be sorted */
  sortable?: string[];
  /** Default sort configuration */
  defaultSort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  /** Optional search configuration */
  search?: {
    enabled: boolean;
    placeholder?: string;
    fields?: string[];
  };
  /** Optional pagination settings */
  pagination?: {
    enabled: boolean;
    defaultPageSize?: number;
    pageSizeOptions?: number[];
  };
}

/**
 * Settings for 'create' action (form view)
 */
export interface CreateActionSettings {
  /** Type discriminator */
  type: 'create';
  /** Fields for the create form */
  fields: Array<{
    name: string; // Changed from 'key' to 'name' for compatibility
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'password' | 'checkbox' | 'multiselect' | 'boolean' | 'money';
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
  }>;
  /** Optional custom submit label */
  submitLabel?: string;
  /** Optional form layout */
  layout?: 'single-column' | 'two-columns';
  /** Validation rules */
  validation?: {
    [field: string]: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  };
}

/**
 * Settings for 'update' action (edit form)
 * Similar to CreateActionSettings but with type 'update'
 */
export interface UpdateActionSettings {
  /** Type discriminator */
  type: 'update';
  /** Fields for the edit form */
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'password' | 'checkbox' | 'multiselect' | 'boolean' | 'money';
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
  }>;
  /** Optional custom submit label */
  submitLabel?: string;
  /** Optional form layout */
  layout?: 'single-column' | 'two-columns';
  /** Validation rules */
  validation?: {
    [field: string]: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  };
  /** Fields that cannot be edited */
  readOnlyFields?: string[];
}

/**
 * Settings for 'delete' action
 */
export interface DeleteActionSettings {
  /** Type discriminator */
  type: 'delete';
  /** Confirmation message to show before deleting */
  confirmation: string;
  /** Whether to perform soft delete */
  soft?: boolean;
}

/**
 * Settings for 'export' action
 */
export interface ExportActionSettings {
  /** Available export formats */
  formats: Array<'csv' | 'xlsx' | 'pdf' | 'json'>;
  /** Default format */
  defaultFormat?: 'csv' | 'xlsx' | 'pdf' | 'json';
  /** Fields to include in export */
  fields?: string[];
}

/**
 * Type helper to get action with typed settings
 */
export type TypedModuleAction<T> = ModuleAction & {
  settings: T;
};
