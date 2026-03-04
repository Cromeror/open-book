/**
 * Module types for the frontend
 *
 * Re-exports types from @/types/business and adds frontend-specific types.
 */

export type {
  ModuleActionConfig,
  ModuleHttpMethodWithConfig,
  ModuleResourceWithActionsResponse,
  ModuleWithActionsResponse,
  ReadResourceUiConfig,
  CreateResourceUiConfig,
  UpdateResourceUiConfig,
  DeleteResourceUiConfig,
  GenericResourceUiConfig,
  ResourceUiConfig,
} from '@/types/business';

export {
  isReadUiConfig,
  isCreateUiConfig,
  isUpdateUiConfig,
  isDeleteUiConfig,
} from '@/types/business';

import type { ModuleWithActionsResponse } from '@/types/business';

// ============================================
// Frontend-specific types
// ============================================

/** Navigation item derived from module */
export interface NavItem {
  path: string;
  label: string;
  icon: string;
  module: string;
}

/** Props for module components */
export interface ModuleProps {
  moduleCode: string;
  metadata: ModuleWithActionsResponse;
}

/** Type for a module component */
export type ModuleComponent = React.ComponentType<ModuleProps>;
