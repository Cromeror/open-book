import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import type { Request } from 'express';

import { ResourceMatcherService } from './resource-matcher.service';
import { ExternalAuthStrategyFactory } from './auth-strategies';
import { applyResponseFilter } from './response-filter.util';

export interface ProxyResult {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
}

/**
 * Orchestration service for the external proxy endpoint.
 *
 * Handles the full proxy flow:
 * 1. Read resource match from guard (or match inline as fallback)
 * 2. Authenticate with the external system
 * 3. Forward the request
 * 4. Apply response filter if set by guard
 */
@Injectable()
export class ExternalProxyService {
  private readonly logger = new Logger(ExternalProxyService.name);

  constructor(
    private readonly resourceMatcher: ResourceMatcherService,
    private readonly authStrategyFactory: ExternalAuthStrategyFactory,
  ) {}

  async handleRequest(req: Request): Promise<ProxyResult> {
    const path = this.extractPath(req);
    const method = req.method.toUpperCase();

    this.logger.debug(`Proxy request: ${method} ${path}`);

    // 1. Use resource match from guard, or match inline as fallback
    const match =
      req.resourceMatch ?? (await this.resourceMatcher.match(path, method));
    if (!match) {
      throw new NotFoundException(`No resource found for path: ${path}`);
    }

    const { resource } = match;

    const integration = resource.integration;
    if (!integration) {
      throw new BadRequestException('No integration configured for this resource');
    }

    // 2. Authenticate with external system
    let authHeaders: Record<string, string>;
    try {
      const strategy = this.authStrategyFactory.create(integration.authType);
      authHeaders = await strategy.getAuthHeaders(integration, null, req);
    } catch (err) {
      throw new BadGatewayException(
        `External authentication failed: ${(err as Error).message}`,
      );
    }

    // 3. Forward request to external system
    const targetUrl = this.buildTargetUrl(integration.baseUrl, path, req);

    this.logger.debug(`Forwarding to: ${method} ${targetUrl}`);

    let externalResponse: Response;
    try {
      const forwardHeaders = this.buildForwardHeaders(req, authHeaders);

      externalResponse = await fetch(targetUrl, {
        method,
        headers: forwardHeaders,
        body: ['GET', 'HEAD', 'DELETE'].includes(method)
          ? undefined
          : JSON.stringify(req.body),
      });
    } catch (err) {
      throw new BadGatewayException(
        `External request failed: ${(err as Error).message}`,
      );
    }

    // 4. Parse response
    const contentType = externalResponse.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    let body: unknown;
    if (isJson) {
      body = await externalResponse.json().catch(() => null);
    } else {
      body = await externalResponse.text();
    }

    // 5. Apply response filter if set by ExternalAuthGuard
    if (req.responseFilter && isJson && body != null) {
      body = applyResponseFilter(body, req.responseFilter);
    }

    // Forward relevant headers
    const responseHeaders: Record<string, string> = {};
    if (contentType) responseHeaders['content-type'] = contentType;

    return {
      statusCode: externalResponse.status,
      headers: responseHeaders,
      body,
    };
  }

  private extractPath(req: Request): string {
    const originalUrl = req.originalUrl;
    const extIndex = originalUrl.indexOf('/ext/');
    if (extIndex === -1) {
      throw new BadRequestException('Invalid proxy path');
    }

    const pathWithQuery = originalUrl.substring(extIndex + 4);
    const queryStart = pathWithQuery.indexOf('?');
    return queryStart === -1 ? pathWithQuery : pathWithQuery.substring(0, queryStart);
  }

  /**
   * Build headers for the external system request.
   * Only forwards whitelisted headers — this is a server-to-server connection,
   * browser headers (origin, referer, sec-*, cookie, user-agent) are never forwarded.
   */
  private buildForwardHeaders(
    req: Request,
    authHeaders: Record<string, string>,
  ): Record<string, string> {
    const forwarded: Record<string, string> = {
      'content-type': req.headers['content-type'] || 'application/json',
    };

    // Auth headers from the strategy (e.g. Devise tokens, Bearer, API key)
    Object.assign(forwarded, authHeaders);

    return forwarded;
  }

  private buildTargetUrl(
    baseUrl: string,
    path: string,
    req: Request,
  ): string {
    const cleanBase = baseUrl.replace(/\/+$/, '');
    const originalUrl = req.originalUrl;
    const extIndex = originalUrl.indexOf('/ext/');
    const pathWithQuery = originalUrl.substring(extIndex + 4);
    return `${cleanBase}${pathWithQuery}`;
  }
}
