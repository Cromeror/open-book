export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password?: string;
  isSuperAdmin?: boolean;
  isActive?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}
