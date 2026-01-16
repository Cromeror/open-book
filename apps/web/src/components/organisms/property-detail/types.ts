import type { Property } from '../PropertyList';

export type ResidentRelationType = 'OWNER' | 'TENANT' | 'OTHER';
export type ResidentStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

export interface PropertyResident {
  id: string;
  userId: string;
  relationType: ResidentRelationType;
  status: ResidentStatus;
  isPrimary: boolean;
  startDate?: string;
  endDate?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface PropertyDetailProps {
  /** Property to display */
  property: Property;
  /** Residents assigned to the property */
  residents?: PropertyResident[];
  /** Whether data is loading */
  loading?: boolean;
  /** Callback when edit button is clicked */
  onEdit?: (property: Property) => void;
  /** Callback when toggle status is clicked */
  onToggleStatus?: () => void;
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** Callback when add resident is clicked */
  onAddResident?: () => void;
  /** Callback when remove resident is clicked */
  onRemoveResident?: (residentId: string) => void;
  /** Callback when set primary resident is clicked */
  onSetPrimaryResident?: (residentId: string) => void;
}

export interface DetailFieldProps {
  label: string;
  value?: string | number | null;
  fallback?: string;
}
