import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from '../../../entities/user.entity';

/**
 * Parameter decorator to get the current authenticated user
 *
 * Extracts the user object from the request, which is populated
 * by the authentication guard (JwtAuthGuard).
 *
 * @example
 * ```typescript
 * @Controller('profile')
 * @UseGuards(JwtAuthGuard)
 * export class ProfileController {
 *   @Get()
 *   getProfile(@CurrentUser() user: User) {
 *     return {
 *       id: user.id,
 *       email: user.email,
 *       firstName: user.firstName,
 *       lastName: user.lastName,
 *     };
 *   }
 *
 *   @Post('settings')
 *   updateSettings(
 *     @CurrentUser() user: User,
 *     @Body() dto: UpdateSettingsDto,
 *   ) {
 *     return this.service.updateSettings(user.id, dto);
 *   }
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
