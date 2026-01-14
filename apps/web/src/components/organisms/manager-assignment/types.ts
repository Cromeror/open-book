/**
 * Types for ManagerAssignment organism
 */

/**
 * Simplified user info for manager assignment
 */
export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

/**
 * Simplified condominium info for manager assignment
 */
export interface CondominiumInfo {
  id: string;
  name: string;
  nit?: string;
  isActive: boolean;
}

/**
 * Manager assignment record
 */
export interface ManagerAssignmentRecord {
  id: string;
  userId: string;
  condominiumId: string;
  isPrimary: boolean;
  isActive: boolean;
  assignedAt: string;
  assignedBy: string;
  user?: UserInfo;
  condominium?: CondominiumInfo;
}

/**
 * DTO for assigning a manager
 */
export interface AssignManagerDto {
  userId: string;
  isPrimary?: boolean;
}

/**
 * Props for the ManagerAssignment component
 */
export interface ManagerAssignmentProps {
  /** Condominium to assign managers to (optional) */
  condominium?: CondominiumInfo;
  /** User to assign to condominiums (optional) */
  user?: UserInfo;
  /** Callback when assignment is successful */
  onAssignmentSuccess?: (assignment: ManagerAssignmentRecord) => void;
  /** Callback when assignment fails */
  onAssignmentError?: (error: string) => void;
  /** Whether the component is in a loading state externally */
  externalLoading?: boolean;
}

/**
 * Search result for users
 */
export interface UserSearchResult {
  data: UserInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Search result for condominiums
 */
export interface CondominiumSearchResult {
  data: CondominiumInfo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
