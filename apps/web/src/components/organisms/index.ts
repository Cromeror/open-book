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
