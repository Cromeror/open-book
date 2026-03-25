import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';

import { ResourceMatcherService } from '../resource-matcher.service';
import { ExternalPermissionsService } from '../external-permissions.service';

/**
 * Guard that enforces external user permissions on the /ext/* proxy routes.
 *
 * Matches the request to a resource, then applies the decision chain:
 * 1. No resource match → allow (proxy service will 404)
 * 2. If external user is identified → always check resource access and
 *    attach responseFilter (even if auth is not required)
 * 3. If auth not required (requiresExternalAuth/managesUsers/internalPermissions) → allow
 * 4. If auth required: check resource-level access → allow if granted
 * 5. Fall back to module-level access → allow if granted
 * 6. Deny
 */
@Injectable()
export class ExternalAuthGuard implements CanActivate {
  private readonly logger = new Logger(ExternalAuthGuard.name);

  constructor(
    private readonly resourceMatcher: ResourceMatcherService,
    private readonly externalPermissions: ExternalPermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    // Match request to a resource
    const { path, method } = this.extractPathAndMethod(req);
    const match = await this.resourceMatcher.match(path, method);

    if (!match) return true;

    // Attach to request so the proxy service doesn't re-match
    req.resourceMatch = match;

    const { resource, resourceHttpMethod } = match;

    const integration = resource.integration;
    const requiresAuth =
      resource.requiresExternalAuth &&
      integration?.managesUsers &&
      integration?.internalPermissions;

    // Resolve external user (optional when auth is not required)
    const externalUserId =
      (req.headers['x-external-user-id'] as string) ?? req.externalUserId;

    // If there's an external user and an integration, always try to attach
    // the response filter — even when auth is not strictly required.
    if (externalUserId && integration) {
      const { allowed, responseFilter } =
        await this.externalPermissions.checkResourceAccess(
          externalUserId,
          integration.id,
          resource.id,
          resourceHttpMethod.id,
        );

      if (responseFilter) {
        req.responseFilter = responseFilter;
      }

      // Auth not required → allow (filter already attached)
      if (!requiresAuth) return true;

      // Auth required and access granted
      if (allowed) return true;

      // Fall back to module-level access
      const moduleCode = resource.code;
      const hasModule = await this.externalPermissions.hasModuleAccess(
        externalUserId,
        integration.id,
        moduleCode,
      );

      if (hasModule) return true;

      // Deny
      this.logger.warn(
        `External user ${externalUserId} denied access to ${resource.code} ${resourceHttpMethod.httpMethod?.method}`,
      );
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    // No external user provided
    if (!requiresAuth) return true;

    // Auth required but no external user ID
    this.logger.warn('Missing external user ID for protected resource');
    throw new ForbiddenException(
      'External user identification is required for this resource',
    );
  }

  private extractPathAndMethod(req: Request): { path: string; method: string } {
    const originalUrl = req.originalUrl;
    const extIndex = originalUrl.indexOf('/ext/');
    if (extIndex === -1) {
      throw new BadRequestException('Invalid proxy path');
    }

    const pathWithQuery = originalUrl.substring(extIndex + 4);
    const queryStart = pathWithQuery.indexOf('?');
    const path = queryStart === -1 ? pathWithQuery : pathWithQuery.substring(0, queryStart);

    return { path, method: req.method.toUpperCase() };
  }
}
