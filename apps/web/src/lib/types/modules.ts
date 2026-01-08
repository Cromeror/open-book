/**
 * Module types for the frontend
 *
 * Re-exports types from @openbook/business-core and adds frontend-specific types
 */

// Re-export shared types from business-core
export type {
  ModuleWithActions,
  ModuleAction,
  ReadActionSettings,
  CreateActionSettings,
  UpdateActionSettings,
  DeleteActionSettings,
  ExportActionSettings,
  TypedModuleAction,
} from '@openbook/business-core/modules';

// Import for local use
import type { ModuleAction, ModuleWithActions } from '@openbook/business-core/modules';

// ============================================
// Frontend-specific types
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

/**
 * Specialized module available for registration
 * Used by admin panel to show available modules
 */
export interface AvailableModule {
  code: string;
  name: string;
  label: string;
  description: string;
  defaultActions: ModuleAction[];
  defaultIcon: string;
}

/**
 * Props for module components
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
// Backward compatibility aliases
// ============================================

/**
 * @deprecated Use types from @openbook/business-core/modules directly
 * Kept for backward compatibility during migration
 */
export type ActionSettings = unknown;

/**
 * @deprecated Use ColumnDefinition from ReadActionSettings instead
 */
export interface ColumnDefinition {
  field: string;
  label: string;
  sortable?: boolean;
  format?: 'date' | 'money' | 'boolean';
}

/**
 * @deprecated Use FilterDefinition from ReadActionSettings instead
 */
export interface FilterDefinition {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: Array<{ value: string; label: string }>;
}

/**
 * @deprecated Use field definitions from CreateActionSettings instead
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
 * @deprecated Use validation from CreateActionSettings instead
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
