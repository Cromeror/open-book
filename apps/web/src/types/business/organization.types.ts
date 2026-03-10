import type { Integration } from './integration.types';

export interface Organization {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  externalId?: string | null;
  integrationId?: string | null;
  integration?: Integration | null;
  hasCredentials?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExternalUser {
  id: number;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  [key: string]: unknown;
}
