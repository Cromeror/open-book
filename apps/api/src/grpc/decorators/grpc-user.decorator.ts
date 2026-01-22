import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestUser } from '../../modules/auth/strategies/jwt.strategy';

/**
 * Get current authenticated user from gRPC context
 *
 * This is the gRPC equivalent of @CurrentUser() decorator.
 * Use this decorator in gRPC controller methods to access
 * the authenticated user attached by GrpcJwtAuthGuard.
 *
 * The user data is extracted from the gRPC call context,
 * where it was placed by the authentication guard after
 * validating the JWT token from metadata.
 *
 * @example
 * ```typescript
 * @GrpcMethod('CondominiumsService', 'GetUserCondominiums')
 * @UseGuards(GrpcJwtAuthGuard)
 * getUserCondominiums(@GrpcCurrentUser() user: RequestUser) {
 *   return this.service.findAllForUser(user.id);
 * }
 *
 * // Get specific field
 * @GrpcMethod('CondominiumsService', 'GetUserProfile')
 * @UseGuards(GrpcJwtAuthGuard)
 * getUserProfile(@GrpcCurrentUser('id') userId: string) {
 *   return this.service.findUserProfile(userId);
 * }
 * ```
 */
export const GrpcCurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    // Switch context to gRPC and get the call context
    const rpcContext = ctx.switchToRpc().getContext();

    // The user is attached to the context by GrpcJwtAuthGuard
    const user = rpcContext.user as RequestUser;

    // Return full user or specific field if data parameter is provided
    return data ? user?.[data] : user;
  }
);
