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
 * 2. resource.requiresExternalAuth = false → allow
 * 3. resource.integration is null → allow
 * 4. integration.managesUsers = false → allow
 * 5. integration.internalPermissions = false → allow
 * 6. Require externalUserId header → 403 if missing
 * 7. Check resource-level access → allow if granted (attach responseFilter)
 * 8. Fall back to module-level access → allow if granted
 * 9. Deny
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

    // 2. Resource doesn't require external auth
    if (!resource.requiresExternalAuth) return true;

    // 3. No integration attached
    const integration = resource.integration;
    if (!integration) return true;

    // 4. Integration doesn't manage external users
    if (!integration.managesUsers) return true;

    // 5. Integration doesn't enforce internal permissions
    if (!integration.internalPermissions) return true;

    // 6. External user ID is required from this point
    const externalUserId =
      (req.headers['x-external-user-id'] as string) ?? req.externalUserId;

    if (!externalUserId) {
      this.logger.warn('Missing external user ID for protected resource');
      throw new ForbiddenException(
        'External user identification is required for this resource',
      );
    }

    // 7. Check resource-level access (most specific)
    const { allowed, responseFilter } =
      await this.externalPermissions.checkResourceAccess(
        externalUserId,
        integration.id,
        resource.id,
        resourceHttpMethod.id,
      );

    if (allowed) {
      if (responseFilter) {
        req.responseFilter = responseFilter;
      }
      return true;
    }

    // 8. Fall back to module-level access via resource's module association
    const moduleCode = resource.code;
    const hasModule = await this.externalPermissions.hasModuleAccess(
      externalUserId,
      integration.id,
      moduleCode,
    );

    if (hasModule) return true;

    // 9. Deny
    this.logger.warn(
      `External user ${externalUserId} denied access to ${resource.code} ${resourceHttpMethod.httpMethod?.method}`,
    );
    throw new ForbiddenException(
      'You do not have permission to access this resource',
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
