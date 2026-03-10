import { Logger } from '@nestjs/common';
import type { Request } from 'express';

import { ConnectionType, type Integration } from '../../../entities/integration.entity';
import type { ExternalAuthStrategy, ExternalCredentials } from './external-auth-strategy.interface';

const DEVISE_HEADERS = ['access-token', 'client', 'uid', 'token-type', 'expiry'] as const;

interface CachedAuth {
  headers: Record<string, string>;
  expiresAt: number;
  promise?: Promise<Record<string, string>>;
}

/**
 * Devise Token Auth strategy.
 *
 * - **Passthrough**: Forwards the Devise Token Auth headers from the incoming
 *   request directly to the external system (the client already authenticated).
 * - **Other connection types**: Authenticates by POSTing to `{baseUrl}/auth/sign_in`
 *   with email/password, caches the resulting tokens, and attaches them.
 */
export class DeviseTokenAuthStrategy implements ExternalAuthStrategy {
  private readonly logger = new Logger(DeviseTokenAuthStrategy.name);
  private readonly cache = new Map<string, CachedAuth>();

  async getAuthHeaders(
    integration: Integration,
    credentials: ExternalCredentials | null,
    req?: Request,
  ): Promise<Record<string, string>> {
    if (integration.connectionType === ConnectionType.PASSTHROUGH) {
      return this.extractHeadersFromRequest(req);
    }

    return this.authenticateWithCredentials(integration, credentials);
  }

  private extractHeadersFromRequest(req?: Request): Record<string, string> {
    if (!req) {
      throw new Error('Request is required for passthrough devise_token_auth');
    }

    const headers: Record<string, string> = {};
    for (const name of DEVISE_HEADERS) {
      const value = req.headers[name];
      if (typeof value === 'string' && value) {
        headers[name] = value;
      }
    }

    if (!headers['access-token'] || !headers['client'] || !headers['uid']) {
      throw new Error(
        'Missing required Devise Token Auth headers (access-token, client, uid)',
      );
    }

    return headers;
  }

  private async authenticateWithCredentials(
    integration: Integration,
    credentials: ExternalCredentials | null,
  ): Promise<Record<string, string>> {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('No credentials configured for devise_token_auth');
    }

    const key = `${integration.id}:${credentials.email}`;
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.headers;
    }

    if (cached?.promise) {
      return cached.promise;
    }

    const promise = this.authenticate(integration, credentials, key);
    this.cache.set(key, { headers: {}, expiresAt: 0, promise });

    try {
      return await promise;
    } catch (err) {
      this.cache.delete(key);
      throw err;
    }
  }

  private async authenticate(
    integration: Integration,
    credentials: ExternalCredentials,
    cacheKey: string,
  ): Promise<Record<string, string>> {
    const baseUrl = integration.baseUrl.replace(/\/+$/, '');
    const signInUrl = `${baseUrl}/auth/sign_in`;

    this.logger.debug(`Authenticating with devise_token_auth at ${signInUrl}`);

    const response = await fetch(signInUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(
        `External authentication failed: ${response.status} ${body}`,
      );
    }

    const headers: Record<string, string> = {
      'access-token': response.headers.get('access-token') ?? '',
      'client': response.headers.get('client') ?? '',
      'uid': response.headers.get('uid') ?? '',
      'token-type': response.headers.get('token-type') ?? 'Bearer',
      'expiry': response.headers.get('expiry') ?? '',
    };

    const expiry = parseInt(headers['expiry'] ?? '', 10);
    const ttlMs = expiry
      ? Math.max((expiry * 1000 - Date.now()) * 0.9, 30_000)
      : 300_000;

    this.cache.set(cacheKey, {
      headers,
      expiresAt: Date.now() + ttlMs,
    });

    this.logger.debug(`Cached devise_token_auth token for ${cacheKey} (TTL: ${Math.round(ttlMs / 1000)}s)`);

    return headers;
  }
}
