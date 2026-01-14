import { PropertyType } from '../PropertyList';

export interface PropertyFormData {
  identifier: string;
  type: PropertyType;
  description?: string;
  floor?: number;
  area?: number;
  condominiumId: string;
  groupId?: string | null;
  displayOrder?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
