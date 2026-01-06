import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestUser } from '../strategies/jwt.strategy';

/**
 * Get current authenticated user from request
 *
 * Use this decorator in controller methods to access
 * the authenticated user attached by JwtAuthGuard.
 *
 * @example
 * ```typescript
 * @Get('me')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: RequestUser) {
 *   return user;
 * }
 *
 * // Get specific field
 * @Get('my-id')
 * @UseGuards(JwtAuthGuard)
 * getMyId(@CurrentUser('id') userId: string) {
 *   return { userId };
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;

    return data ? user?.[data] : user;
  }
);
