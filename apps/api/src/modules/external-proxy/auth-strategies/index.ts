import { Injectable } from '@nestjs/common';

import { AuthType } from '../../../entities/integration.entity';
import type { ExternalAuthStrategy } from './external-auth-strategy.interface';
import { NoneAuthStrategy } from './none.strategy';
import { BearerAuthStrategy } from './bearer.strategy';
import { BasicAuthStrategy } from './basic.strategy';
import { ApiKeyAuthStrategy } from './api-key.strategy';
import { DeviseTokenAuthStrategy } from './devise-token-auth.strategy';

export type { ExternalAuthStrategy, ExternalCredentials } from './external-auth-strategy.interface';

/**
 * Factory that creates the appropriate auth strategy based on AuthType.
 *
 * Strategies are singletons — the same instance is reused across requests
 * (important for DeviseTokenAuth which caches tokens).
 */
@Injectable()
export class ExternalAuthStrategyFactory {
  private readonly strategies = new Map<AuthType, ExternalAuthStrategy>();

  constructor() {
    this.strategies.set(AuthType.NONE, new NoneAuthStrategy());
    this.strategies.set(AuthType.BEARER, new BearerAuthStrategy());
    this.strategies.set(AuthType.BASIC, new BasicAuthStrategy());
    this.strategies.set(AuthType.API_KEY, new ApiKeyAuthStrategy());
    this.strategies.set(AuthType.DEVISE_TOKEN_AUTH, new DeviseTokenAuthStrategy());
  }

  create(authType: AuthType): ExternalAuthStrategy {
    const strategy = this.strategies.get(authType);
    if (!strategy) {
      throw new Error(`Unsupported auth type: ${authType}`);
    }
    return strategy;
  }
}
