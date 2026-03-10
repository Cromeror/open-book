export type AuthType = 'none' | 'bearer' | 'basic' | 'api_key' | 'devise_token_auth';

export type ConnectionType = 'passthrough' | 'oauth' | 'api_key_stored';

export interface Integration {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  baseUrl: string;
  authType: AuthType;
  authConfig?: Record<string, unknown> | null;
  connectionType: ConnectionType;
  managesUsers: boolean;
  internalPermissions: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
