/**
 * Response types for /api/auth/me — modules and actions visible to the user.
 *
 * action.code    = permission code (e.g. 'read', 'create') — matches module_permission.code.
 * action.httpMethod = HTTP verb that executes this action (e.g. 'GET', 'POST').
 * uiConfig is opaque in the API: validated by Zod on write, passed through as-is on read.
 * The frontend owns the typed definitions of uiConfig internals.
 */

/** One action the user can perform in a module. */
export interface ModuleActionConfig {
  code: string;       // permission code, e.g. 'read', 'create' — matches module_permission.code
  httpMethod: string; // HTTP verb that executes this action, e.g. 'GET', 'POST'
  label?: string;     // display label, e.g. 'Ver'
  uiConfig?: Record<string, unknown>; // frontend UI config (list columns, form fields, etc.)
  linkConfig?: Record<string, Record<string, unknown>>; // UI config per HATEOAS link rel (opaque, frontend-owned)
}

/** HTTP method enabled on a resource. */
export interface ModuleHttpMethodResponse {
  method: string; // 'GET' | 'POST' | 'PATCH' | 'DELETE'
  isActive: boolean;
}

/** HTTP method with its associated action config (UI config + permission). */
export interface ModuleHttpMethodWithConfig {
  method: string;           // 'GET' | 'POST' | 'PATCH' | 'DELETE'
  action: ModuleActionConfig; // config associated to this method
}

/** Resource exposed by a module, with its active HTTP methods. */
export interface ModuleResourceResponse {
  code: string;
  templateUrl: string; // resolved URL, ready to use (no placeholders)
  role?: string; // resource role within the module: 'primary' | 'detail' | 'related'
  httpMethods: ModuleHttpMethodResponse[];
}

/** Resource with only the HTTP methods that have an actionsConfig entry for the user. */
export interface ModuleResourceWithActionsResponse {
  code: string;
  templateUrl: string;
  role?: string;
  httpMethods: ModuleHttpMethodWithConfig[]; // only methods with a configured action
}

/** Module entry returned by /api/auth/me — only modules and actions the user can access. */
export interface ModuleWithActionsResponse {
  code: string; // e.g. 'goals', 'users'
  label: string; // e.g. 'Objetivos de Recaudo'
  description: string;
  icon: string; // Lucide icon name, e.g. 'Target'
  /** Specialized frontend component name (e.g. 'UsersModule'). Null if generic. */
  component?: string | null;
  /** Configuration data (props) for the specialized component. Null if generic. */
  componentConfig?: Record<string, unknown> | null;
  nav: {
    path: string; // e.g. '/goals' or '/m/goals'
    order: number;
  };
  resources: ModuleResourceWithActionsResponse[];
}

/** Full /api/auth/me response shape. */
export interface AuthMeResponseWithModules {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: ModuleWithActionsResponse[];
}
