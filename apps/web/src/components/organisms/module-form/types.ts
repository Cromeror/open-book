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

export interface ActionSettings {
  type: string;
  listColumns?: Array<{
    field: string;
    label: string;
    sortable?: boolean;
    format?: string;
  }>;
  filters?: Array<{
    field: string;
    type: string;
    label: string;
    options?: Array<{ value: string; label: string }>;
  }>;
  defaultSort?: { field: string; order: string };
  fields?: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
    min?: number;
    max?: number;
  }>;
  confirmation?: string;
  soft?: boolean;
}

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
