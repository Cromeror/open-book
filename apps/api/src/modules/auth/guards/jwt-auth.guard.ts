import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { setAuditContext, clearAuditContext } from '../../../subscribers/audit.subscriber';
import { RequestUser } from '../strategies/jwt.strategy';

/**
 * JWT Authentication Guard
 *
 * Protects routes that require authentication.
 * Uses Passport JWT strategy to validate tokens.
 *
 * Routes marked with @Public() decorator will bypass this guard.
 *
 * @example
 * ```typescript
 * @Controller('users')
 * @UseGuards(JwtAuthGuard)
 * export class UsersController {
 *   @Get('me')
 *   getProfile(@CurrentUser() user: RequestUser) {
 *     return user;
 *   }
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Check if request can proceed
   * Allows public routes to bypass authentication
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      clearAuditContext();
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<T = RequestUser>(err: unknown, user: T, info: unknown, context: ExecutionContext): T {
    const result = super.handleRequest(err, user, info, context);

    if (result) {
      const req = context.switchToHttp().getRequest<Request>();
      const ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown';

      setAuditContext({
        userId: (result as RequestUser).id,
        ipAddress,
        userAgent: req.headers['user-agent'],
      });
    }

    return result;
  }
}
