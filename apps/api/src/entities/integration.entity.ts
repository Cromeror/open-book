import { Entity, Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';

export enum AuthType {
  NONE = 'none',
  BEARER = 'bearer',
  BASIC = 'basic',
  API_KEY = 'api_key',
  DEVISE_TOKEN_AUTH = 'devise_token_auth',
}

export enum ConnectionType {
  PASSTHROUGH = 'passthrough',
  OAUTH = 'oauth',
  API_KEY_STORED = 'api_key_stored',
}

@Entity('integrations')
export class Integration extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  @Index('idx_integrations_code', { unique: true })
  code!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string | null;

  @Column({
    name: 'base_url',
    type: 'varchar',
    length: 500,
  })
  baseUrl!: string;

  @Column({
    name: 'auth_type',
    type: 'enum',
    enum: AuthType,
    default: AuthType.NONE,
  })
  authType!: AuthType;

  @Column({
    name: 'auth_config',
    type: 'jsonb',
    nullable: true,
  })
  authConfig?: Record<string, unknown> | null;

  @Column({
    name: 'connection_type',
    type: 'enum',
    enum: ConnectionType,
    default: ConnectionType.PASSTHROUGH,
  })
  connectionType!: ConnectionType;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;
}
