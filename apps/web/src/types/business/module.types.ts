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

/** A single step in a post-action chain */
export type PostActionStep =
  | { type: 'confirm'; message: string; variant?: 'danger' | 'warning' }
  | { type: 'execute' }
  | { type: 'navigate'; target?: '_self' | '_blank'; url?: string }
  | { type: 'refresh' };

/** UI configuration for a single HATEOAS link within an action */
export interface LinkUiConfig {
  /** Lucide icon name, e.g. 'Eye', 'Pencil', 'Trash2' */
  icon?: string;
  /** Display label, e.g. 'Ver detalle', 'Editar' */
  label?: string;
  /** Visual variant for the action button */
  variant?: 'default' | 'danger' | 'warning' | 'success';
  /** Chain of steps to execute when the action is triggered */
  postAction?: PostActionStep[];
}

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
  /** UI config per HATEOAS link rel, e.g. { self: { icon: 'Eye' }, delete: { icon: 'Trash2', variant: 'danger' } } */
  linkConfig?: Record<string, LinkUiConfig>;
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
// UI config types — owned by the frontend, used to interpret uiConfig fields.
//
// The `component` field tells the frontend WHICH component to render.
// The `httpMethod` on the action tells HOW to call the endpoint (GET, POST, etc.).
// Together they fully describe what to render and how to interact with the API.
// ---------------------------------------------------------------------------

/** Column definition for list/table components */
export interface ListColumnConfig {
  field: string;
  label: string;
  sortable?: boolean;
  format?: 'date' | 'money' | 'boolean';
}

/** Filter definition for list components */
export interface ListFilterConfig {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: Array<{ value: string; label: string }>;
}

/** Field definition for form components */
export interface FormFieldConfig {
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
}

/** Renders a paginated table/list */
export interface ListUiConfig {
  component: 'list';
  columns: ListColumnConfig[];
  filters?: ListFilterConfig[];
  defaultSort?: { field: string; order: 'asc' | 'desc' };
  search?: { enabled: boolean; placeholder?: string; fields?: string[] };
  pagination?: { enabled: boolean; defaultPageSize?: number; pageSizeOptions?: number[] };
}

/** Renders a detail view (key-value display) */
export interface DetailUiConfig {
  component: 'detail';
  fields: Array<{ field: string; label: string; format?: 'date' | 'money' | 'boolean' }>;
}

/** Renders a form (for create or edit) */
export interface FormUiConfig {
  component: 'form';
  fields: FormFieldConfig[];
  submitLabel?: string;
  layout?: 'single-column' | 'two-columns';
  readOnlyFields?: string[];
}

/** Renders a confirmation dialog before executing the action */
export interface ConfirmUiConfig {
  component: 'confirm';
  message: string;
  variant?: 'danger' | 'warning' | 'success';
  icon?: string;
}

/** Renders a small modal with a form before executing the action */
export interface ModalFormUiConfig {
  component: 'modal-form';
  fields: FormFieldConfig[];
  submitLabel?: string;
}

/** Union of all known UI config types */
export type ResourceUiConfig =
  | ListUiConfig
  | DetailUiConfig
  | FormUiConfig
  | ConfirmUiConfig
  | ModalFormUiConfig;

// Type guards
export function isListUiConfig(c: ResourceUiConfig): c is ListUiConfig { return c.component === 'list'; }
export function isDetailUiConfig(c: ResourceUiConfig): c is DetailUiConfig { return c.component === 'detail'; }
export function isFormUiConfig(c: ResourceUiConfig): c is FormUiConfig { return c.component === 'form'; }
export function isConfirmUiConfig(c: ResourceUiConfig): c is ConfirmUiConfig { return c.component === 'confirm'; }
export function isModalFormUiConfig(c: ResourceUiConfig): c is ModalFormUiConfig { return c.component === 'modal-form'; }
