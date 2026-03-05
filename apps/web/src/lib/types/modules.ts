/**
 * Module types for the frontend
 *
 * Re-exports types from @/types/business and adds frontend-specific types.
 */

export type {
  PostActionStep,
  LinkUiConfig,
  ModuleActionConfig,
  ModuleHttpMethodWithConfig,
  ModuleResourceWithActionsResponse,
  ModuleWithActionsResponse,
  ListColumnConfig,
  ListFilterConfig,
  FormFieldConfig,
  ListUiConfig,
  DetailUiConfig,
  FormUiConfig,
  ConfirmUiConfig,
  ModalFormUiConfig,
  ResourceUiConfig,
} from '@/types/business';

export {
  isListUiConfig,
  isDetailUiConfig,
  isFormUiConfig,
  isConfirmUiConfig,
  isModalFormUiConfig,
} from '@/types/business';

import type { ModuleWithActionsResponse } from '@/types/business';

// ============================================
// HATEOAS & Action types
// ============================================

/** Single HATEOAS link value as returned by the API */
export interface HateoasLinkValue {
  href: string;
  method: string;
}

/** HATEOAS links as returned by the API: rel → { href, method } */
export type HateoasLinks = Record<string, HateoasLinkValue>;

/** Data item with optional HATEOAS links */
export interface HateoasDataItem {
  id: string;
  _links?: HateoasLinks;
  [key: string]: unknown;
}

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
