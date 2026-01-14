/**
 * Types for CondominiumDetail organism
 */

export interface CondominiumDetailData {
  id: string;
  name: string;
  nit?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Manager info for display in detail view
 */
export interface CondominiumManagerInfo {
  id: string;
  isPrimary: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface CondominiumDetailProps {
  /** Condominium data to display */
  condominium: CondominiumDetailData;
  /** List of managers assigned to this condominium */
  managers?: CondominiumManagerInfo[];
  /** Whether managers are being loaded */
  loadingManagers?: boolean;
  /** Whether the component is in a loading state */
  loading?: boolean;
  /** Callback when edit button is clicked */
  onEdit?: (condominium: CondominiumDetailData) => void;
  /** Callback when toggle status button is clicked */
  onToggleStatus?: () => void;
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** Callback when managers button is clicked (opens assignment modal) */
  onManageManagers?: () => void;
  /** Callback when a manager is removed */
  onRemoveManager?: (managerId: string) => void;
}

export interface DetailFieldProps {
  label: string;
  value: string | null | undefined;
  fallback?: string;
}

export interface ManagerAvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface ManagersListProps {
  managers: CondominiumManagerInfo[];
  loading?: boolean;
  onRemove?: (managerId: string) => void;
  onAdd?: () => void;
}
