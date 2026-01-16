export { ModuleList } from './ModuleList';
export type {
  ModuleListItem,
  ModuleListProps,
  ModulePermission as ModuleListPermission,
  NavConfig as ModuleListNavConfig,
} from './ModuleList';

// Module Form components
export { ModuleCreateForm, ModuleEditForm, ActionsConfigEditor } from './module-form';
export type {
  ModuleFormData,
  ModuleCreateFormProps,
  ModuleEditFormProps,
  ModulePermission,
  NavConfig,
  ModuleAction,
  ActionSettings,
  ModuleType,
} from './module-form';

// Condominium components
export { CondominiumList } from './CondominiumList';
export type {
  Condominium,
  PaginationInfo,
  CondominiumListProps,
} from './CondominiumList';

export { CondominiumForm } from './condominium-form';
export type { CondominiumFormData } from './condominium-form';

export { CondominiumDetail } from './condominium-detail';
export type {
  CondominiumDetailProps,
  CondominiumDetailData,
  CondominiumManagerInfo,
} from './condominium-detail';

// Manager Assignment components
export { ManagerAssignment } from './manager-assignment';
export type {
  ManagerAssignmentProps,
  ManagerAssignmentRecord,
  UserInfo as ManagerUserInfo,
  CondominiumInfo as ManagerCondominiumInfo,
} from './manager-assignment';

// Property components
export { PropertyList } from './PropertyList';
export type {
  Property,
  PropertyPaginationInfo,
  PropertyListProps,
} from './PropertyList';
export { PropertyType, PropertyTypeLabels, PropertyTypeIcons } from './PropertyList';

export { PropertyForm } from './property-form';
export type { PropertyFormData } from './property-form';

export { PropertyDetail } from './property-detail';
export type {
  PropertyDetailProps,
  PropertyResident,
  ResidentRelationType,
  ResidentStatus,
} from './property-detail';

// Pool components
export { PoolList } from './pool-list';
export type { UserPool, PoolListProps } from './pool-list';

export { PoolForm } from './pool-form';
export type { PoolFormData } from './pool-form';

export { PoolDetail } from './pool-detail';
export type { PoolDetailProps, PoolMemberInfo, PoolModuleInfo } from './pool-detail';
