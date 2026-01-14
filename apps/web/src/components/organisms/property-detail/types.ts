import type { Property } from '../PropertyList';

export interface PropertyDetailProps {
  /** Property to display */
  property: Property;
  /** Whether data is loading */
  loading?: boolean;
  /** Callback when edit button is clicked */
  onEdit?: (property: Property) => void;
  /** Callback when toggle status is clicked */
  onToggleStatus?: () => void;
  /** Callback when back button is clicked */
  onBack?: () => void;
}

export interface DetailFieldProps {
  label: string;
  value?: string | number | null;
  fallback?: string;
}
