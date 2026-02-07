import { Controller, UseGuards, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

import { SessionContextService } from '../../modules/session-context/session-context.service';
import { GrpcJwtAuthGuard } from '../guards/grpc-jwt-auth.guard';
import { GrpcCurrentUser } from '../decorators/grpc-user.decorator';
import { RequestUser } from '../../modules/auth/strategies/jwt.strategy';
import { GrpcExceptionFilter } from '../filters/grpc-exception.filter';

/**
 * gRPC Controller for Session Context
 *
 * Implements the SessionContextService proto definition.
 * Returns a flat object with all resolved user context data.
 * Requires JWT authentication.
 */
@Controller()
@UseGuards(GrpcJwtAuthGuard)
@UseFilters(GrpcExceptionFilter)
export class SessionContextGrpcController {
  constructor(
    private readonly sessionContextService: SessionContextService,
  ) {}

  /**
   * Get session context for the authenticated user
   */
  @GrpcMethod('SessionContextService', 'GetSessionContext')
  async getSessionContext(
    _request: Record<string, never>,
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    const context = await this.sessionContextService.getContext(user.id);

    return {
      userId: context.userId,
      userEmail: context.userEmail,
      userFirstName: context.userFirstName,
      userLastName: context.userLastName,
      isSuperAdmin: context.isSuperAdmin,
      condominiumId: context.condominiumId,
      condominiumName: context.condominiumName,
      userStateTheme: context.userStateTheme,
      userStateLanguage: context.userStateLanguage,
      userStateSidebarCollapsed: context.userStateSidebarCollapsed,
    };
  }
}
