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
import { PermissionContext } from '../../types/permissions.enum';
import { RequestUser } from '../../modules/auth/strategies/jwt.strategy';

/**
 * gRPC Permissions Guard
 *
 * This guard is an adapter that extracts permission requirements from
 * decorator metadata and delegates validation to the existing PermissionsService.
 *
 * Flow:
 * 1. Extract user from gRPC context (attached by GrpcJwtAuthGuard)
 * 2. Extract required module/permission from decorator metadata
 * 3. Call PermissionsService methods (same as HTTP)
 * 4. Verify scope against request context
 *
 * This ensures 100% code reuse with HTTP authorization:
 * - Same permission checking logic
 * - Same @RequireModule() and @RequirePermission() decorators
 * - Same RBAC rules (scope: OWN, COPROPIEDAD, ALL)
 *
 * @example
 * ```typescript
 * @Controller()
 * @UseGuards(GrpcJwtAuthGuard, GrpcPermissionsGuard)
 * export class CondominiumsGrpcController {
 *   @GrpcMethod('CondominiumsService', 'GetUserCondominiums')
 *   @RequireModule('properties')
 *   getUserCondominiums() {}
 *
 *   @GrpcMethod('CondominiumsService', 'CreateCondominium')
 *   @RequirePermission('properties:create')
 *   createCondominium() {}
 * }
 * ```
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

    // Extract context from gRPC request
    const permissionContext = this.extractContext(context);

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
        requiredPermission,
        permissionContext
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

  /**
   * Extract permission context from gRPC request
   * Similar to HTTP, but extracts from gRPC data structure
   */
  private extractContext(context: ExecutionContext): PermissionContext {
    // Get gRPC request data
    const data = context.switchToRpc().getData() as Record<string, unknown>;

    // Extract context IDs from request data
    // These field names should match the proto message field names
    return {
      copropiedadId: data.copropiedadId as string | undefined,
      apartamentoId: data.apartamentoId as string | undefined,
      resourceOwnerId: data.userId as string | undefined,
    };
  }
}
