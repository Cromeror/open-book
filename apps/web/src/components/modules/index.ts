/**
 * Module components for dynamic CRUD rendering
 *
 * These components render UI based on backend-provided action settings.
 * Key principle: action code = permission code
 */

export { GenericCRUDModule, type ModuleProps } from './GenericCRUDModule';
export { GenericList } from './GenericList';
export { GenericForm } from './GenericForm';
export { GenericDetail } from './GenericDetail';
export { ModuleHeader } from './ModuleHeader';
export { DynamicField } from './fields';
