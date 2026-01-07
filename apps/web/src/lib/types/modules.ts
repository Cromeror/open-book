/**
 * Module types for the frontend
 *
 * These types mirror the backend ModuleWithActions structure.
 * Action code = Permission code (e.g., 'read', 'create', 'update', 'delete')
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
}

/**
 * Settings for 'create' action
 */
export interface CreateActionSettings {
  type: 'create';
  fields: FieldDefinition[];
  validation?: ValidationRules;
}

/**
 * Settings for 'update' action
 */
export interface UpdateActionSettings {
  type: 'update';
  fields: FieldDefinition[];
  validation?: ValidationRules;
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
// Module with Actions (from API)
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
// Navigation
// ============================================

/**
 * Navigation item derived from module
 */
export interface NavItem {
  path: string;
  label: string;
  icon: string;
  module: string;
}

// ============================================
// Available Modules (for admin registration)
// ============================================

/**
 * Specialized module available for registration
 * Used by admin panel to show available modules
 */
export interface AvailableModule {
  code: string; // 'reportes', 'auditoria', etc.
  name: string; // 'ReportsModule'
  label: string; // 'Modulo de Reportes'
  description: string; // 'Graficos y exportacion de datos'
  defaultActions: ModuleAction[]; // Default actions with settings
  defaultIcon: string; // 'BarChart3'
}

// ============================================
// Component Props
// ============================================

/**
 * Props for specialized module components
 */
export interface ModuleProps {
  moduleCode: string;
  metadata: ModuleWithActions;
}

/**
 * Type for a module component
 */
export type ModuleComponent = React.ComponentType<ModuleProps>;

// ============================================
// Field and Column Definitions
// ============================================

/**
 * Field definition for forms
 */
export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean' | 'money';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  placeholder?: string;
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
// Auth Me Response (with modules)
// ============================================

/**
 * Response from GET /api/auth/me
 */
export interface AuthMeResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  };
  modules: ModuleWithActions[];
}
