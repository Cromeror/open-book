import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PermissionsService } from '../../modules/permissions/permissions.service';
import {
  PERMISSION_KEY,
  PERMISSIONS_OPTIONS_KEY,
  PermissionOptions,
} from '../../modules/permissions/decorators/require-permission.decorator';
import { MODULE_KEY } from '../../modules/permissions/decorators/require-module.decorator';
import { RequestUser } from '../../modules/auth/strategies/jwt.strategy';

/**
 * gRPC Permissions Guard
 *
 * Extracts permission requirements from decorator metadata and delegates
 * validation to the existing PermissionsService.
 *
 * Module access is inferred from having at least one permission for that module.
 */
@Injectable()
export class GrpcPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract user from gRPC context (attached by GrpcJwtAuthGuard)
    const rpcContext = context.switchToRpc().getContext();
    const user = rpcContext.user as RequestUser;

    if (!user) {
      throw new UnauthorizedException('No autenticado');
    }

    // Check for required module (from @RequireModule decorator)
    const requiredModule = this.reflector.getAllAndOverride<string>(
      MODULE_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Check for required permission (from @RequirePermission decorator)
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no requirements, allow access
    if (!requiredModule && !requiredPermission) {
      return true;
    }

    // SuperAdmin bypass (same logic as HTTP)
    if (await this.permissionsService.isSuperAdmin(user.id)) {
      return true;
    }

    // Check module access if required
    if (requiredModule) {
      const hasModule = await this.permissionsService.hasModuleAccess(
        user.id,
        requiredModule
      );

      if (!hasModule) {
        throw new ForbiddenException(
          `No tiene acceso al módulo '${requiredModule}'`
        );
      }
    }

    // Check granular permission if required
    if (requiredPermission) {
      // Get permission options
      const options = this.reflector.getAllAndOverride<PermissionOptions>(
        PERMISSIONS_OPTIONS_KEY,
        [context.getHandler(), context.getClass()]
      );

      const hasPermission = await this.permissionsService.hasPermission(
        user.id,
        requiredPermission
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `No tiene el permiso '${requiredPermission}'`
        );
      }

      // If checkOwnership is enabled, attach ownership check flag to context
      if (options?.checkOwnership) {
        rpcContext.checkOwnership = true;
      }
    }

    return true;
  }
}
