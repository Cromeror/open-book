import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for public routes
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public (no authentication required)
 *
 * Use this decorator on routes that should be accessible
 * without authentication when using JwtAuthGuard.
 *
 * @example
 * ```typescript
 * @Controller('auth')
 * @UseGuards(JwtAuthGuard)
 * export class AuthController {
 *   @Public()
 *   @Post('login')
 *   login() {
 *     // This route doesn't require authentication
 *   }
 *
 *   @Get('me')
 *   getMe() {
 *     // This route requires authentication
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
