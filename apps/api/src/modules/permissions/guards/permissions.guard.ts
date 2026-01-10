import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionsService } from '../permissions.service';
import { PERMISSION_KEY, PERMISSIONS_OPTIONS_KEY, PermissionOptions } from '../decorators/require-permission.decorator';
import { MODULE_KEY } from '../decorators/require-module.decorator';
import { PermissionContext } from '../../../types/permissions.enum';

/**
 * Guard that checks user permissions
 *
 * Works with @RequirePermission and @RequireModule decorators
 * to verify that the authenticated user has the required permissions.
 *
 * Permission check flow:
 * 1. Extract required permissions from decorator metadata
 * 2. If no permissions required, allow access
 * 3. Check if user is SuperAdmin (bypass all checks)
 * 4. Check module access
 * 5. Check granular permission
 * 6. Verify scope against request context
 *
 * @example
 * ```typescript
 * @Controller('goals')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * export class GoalsController {
 *   @Post()
 *   @RequirePermission('goals:create')
 *   create() {}
 *
 *   @Get()
 *   @RequireModule('goals')
 *   findAll() {}
 * }
 * ```
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('No autenticado');
    }

    // Check for required module
    const requiredModule = this.reflector.getAllAndOverride<string>(
      MODULE_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Check for required permission
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no requirements, allow access
    if (!requiredModule && !requiredPermission) {
      return true;
    }

    // SuperAdmin bypass
    if (await this.permissionsService.isSuperAdmin(user.id)) {
      return true;
    }

    // Extract context from request
    const permissionContext = this.extractContext(request);

    // Check module access if required
    if (requiredModule) {
      const hasModule = await this.permissionsService.hasModuleAccess(
        user.id,
        requiredModule,
      );

      if (!hasModule) {
        throw new ForbiddenException(
          `No tiene acceso al módulo '${requiredModule}'`,
        );
      }
    }

    // Check granular permission if required
    if (requiredPermission) {
      // Get permission options
      const options = this.reflector.getAllAndOverride<PermissionOptions>(
        PERMISSIONS_OPTIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

      const hasPermission = await this.permissionsService.hasPermission(
        user.id,
        requiredPermission,
        permissionContext,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `No tiene el permiso '${requiredPermission}'`,
        );
      }

      // If checkOwnership is enabled, attach ownership check flag to request
      if (options?.checkOwnership) {
        request.checkOwnership = true;
      }
    }

    return true;
  }

  /**
   * Extract permission context from request
   */
  private extractContext(request: Request & {
    params?: Record<string, string>;
    body?: Record<string, unknown>;
    query?: Record<string, string>;
  }): PermissionContext {
    const params = request.params || {};
    const body = (request.body || {}) as Record<string, string>;
    const query = request.query || {};

    return {
      copropiedadId:
        params.copropiedadId || body.copropiedadId || query.copropiedadId,
      apartamentoId:
        params.apartamentoId || body.apartamentoId || query.apartamentoId,
      resourceOwnerId: params.userId || body.userId,
    };
  }
}
