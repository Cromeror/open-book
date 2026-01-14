/**
 * Types for condominium forms
 */

export interface CondominiumFormData {
  name: string;
  nit?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface CondominiumFormBaseProps {
  onSubmit: (data: CondominiumFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface CondominiumCreateFormProps extends CondominiumFormBaseProps {}

export interface CondominiumEditFormProps extends CondominiumFormBaseProps {
  initialData: CondominiumFormData;
}
