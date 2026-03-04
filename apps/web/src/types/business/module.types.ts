/**
 * Module type definitions — mirror of the API response types for /api/auth/me.
 *
 * action.code    = permission code (e.g. 'read', 'create') — matches module_permission.code.
 * action.httpMethod = HTTP verb that executes this action (e.g. 'GET', 'POST').
 * uiConfig internals are owned by the frontend — the API passes them through as-is.
 */

// NOTE: Modules used to have a `type` field ('crud' | 'specialized') and related fields
// (endpoint, entity, component) that were removed from the API. If in the future we need
// to differentiate module rendering behavior, a new flag or convention should be introduced.

/** One action the user can perform in a module. */
export interface ModuleActionConfig {
  /** Permission code — matches module_permission.code, e.g. 'read', 'create' */
  code: string;
  /** HTTP verb that executes this action, e.g. 'GET', 'POST' */
  httpMethod: string;
  /** Display label, e.g. 'Ver' */
  label?: string;
  /** Frontend UI config (list columns, form fields, etc.) — opaque from API perspective */
  uiConfig?: Record<string, unknown>;
}

/** HTTP method paired with its action config — only methods with a configured action are included. */
export interface ModuleHttpMethodWithConfig {
  /** HTTP verb, e.g. 'GET', 'POST', 'PATCH', 'DELETE' */
  method: string;
  /** Action config associated to this method */
  action: ModuleActionConfig;
}

/** Resource with only the HTTP methods that have an actionsConfig entry for the user. */
export interface ModuleResourceWithActionsResponse {
  code: string;
  /** Resolved URL, ready to use (no placeholders) */
  templateUrl: string;
  /** Resource role within the module: 'primary' | 'detail' | 'related' */
  role?: string;
  /** Only methods with a configured action allowed for the user */
  httpMethods: ModuleHttpMethodWithConfig[];
}

/** Module entry returned by /api/auth/me — only modules and resources the user can access. */
export interface ModuleWithActionsResponse {
  /** Unique module code, e.g. 'goals', 'users' */
  code: string;
  /** Display label, e.g. 'Objetivos de Recaudo' */
  label: string;
  description: string;
  /** Lucide icon name, e.g. 'Target' */
  icon: string;
  nav: {
    path: string;
    order: number;
  };
  resources: ModuleResourceWithActionsResponse[];
}

// ---------------------------------------------------------------------------
// UI config types — owned by the frontend, used to interpret uiConfig fields
// ---------------------------------------------------------------------------

export interface ReadResourceUiConfig {
  type: 'read';
  listColumns: Array<{
    field: string;
    label: string;
    sortable?: boolean;
    format?: 'date' | 'money' | 'boolean';
  }>;
  filters?: Array<{
    field: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'dateRange';
    options?: Array<{ value: string; label: string }>;
  }>;
  sortable?: string[];
  defaultSort?: { field: string; order: 'asc' | 'desc' };
  search?: { enabled: boolean; placeholder?: string; fields?: string[] };
  pagination?: { enabled: boolean; defaultPageSize?: number; pageSizeOptions?: number[] };
}

export interface CreateResourceUiConfig {
  type: 'create';
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
    validation?: { min?: number; max?: number; minLength?: number; maxLength?: number; pattern?: string; custom?: string };
  }>;
  submitLabel?: string;
  layout?: 'single-column' | 'two-columns';
  validation?: Record<string, { required?: boolean; min?: number; max?: number; pattern?: string; message?: string }>;
}

export interface UpdateResourceUiConfig {
  type: 'update';
  fields: CreateResourceUiConfig['fields'];
  submitLabel?: string;
  layout?: 'single-column' | 'two-columns';
  validation?: Record<string, { required?: boolean; min?: number; max?: number; pattern?: string; message?: string }>;
  readOnlyFields?: string[];
}

export interface DeleteResourceUiConfig {
  type: 'delete';
  confirmation: string;
  soft?: boolean;
}

export interface GenericResourceUiConfig {
  type: 'generic';
  [key: string]: unknown;
}

export type ResourceUiConfig =
  | ReadResourceUiConfig
  | CreateResourceUiConfig
  | UpdateResourceUiConfig
  | DeleteResourceUiConfig
  | GenericResourceUiConfig;

// Type guards
export function isReadUiConfig(c: ResourceUiConfig): c is ReadResourceUiConfig { return c.type === 'read'; }
export function isCreateUiConfig(c: ResourceUiConfig): c is CreateResourceUiConfig { return c.type === 'create'; }
export function isUpdateUiConfig(c: ResourceUiConfig): c is UpdateResourceUiConfig { return c.type === 'update'; }
export function isDeleteUiConfig(c: ResourceUiConfig): c is DeleteResourceUiConfig { return c.type === 'delete'; }
