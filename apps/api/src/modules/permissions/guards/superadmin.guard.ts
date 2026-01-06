import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

import { PermissionsService } from '../permissions.service';

/**
 * Guard that restricts access to SuperAdmin only
 *
 * Use this guard on endpoints that should only be accessible
 * by the SuperAdmin (e.g., permission management endpoints).
 *
 * @example
 * ```typescript
 * @Controller('admin/permissions')
 * @UseGuards(JwtAuthGuard, SuperAdminGuard)
 * export class AdminPermissionsController {
 *   // Only SuperAdmin can access these endpoints
 * }
 * ```
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('No autenticado');
    }

    const isSuperAdmin = await this.permissionsService.isSuperAdmin(user.id);

    if (!isSuperAdmin) {
      throw new ForbiddenException(
        'Solo el SuperAdmin puede realizar esta acción',
      );
    }

    return true;
  }
}
