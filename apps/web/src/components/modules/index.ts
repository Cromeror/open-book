/**
 * Module components for dynamic CRUD rendering
 *
 * These components render UI based on backend-provided action settings.
 * Key principle: action code = permission code
 */

export { GenericModule, type ModuleProps } from './GenericModule';
export { GenericList } from './GenericList';
export { GenericForm } from './GenericForm';
export { GenericDetail } from './GenericDetail';
export { ModuleHeader } from './ModuleHeader';
export { DynamicField } from './fields';
export { resolveModuleComponent, resolveWidgetSchema, registeredComponentNames } from './component-registry';
export type { WidgetProps } from './component-registry';
