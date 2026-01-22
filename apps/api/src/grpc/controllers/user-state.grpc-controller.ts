import { Controller, UseGuards, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

import { UserStateService } from '../../modules/user-state/user-state.service';
import { GrpcJwtAuthGuard } from '../guards/grpc-jwt-auth.guard';
import { GrpcCurrentUser } from '../decorators/grpc-user.decorator';
import { RequestUser } from '../../modules/auth/strategies/jwt.strategy';
import { GrpcExceptionFilter } from '../filters/grpc-exception.filter';

/**
 * gRPC Controller for UserState
 *
 * Implements the UserStateService proto definition.
 * All endpoints require JWT authentication.
 */
@Controller()
@UseGuards(GrpcJwtAuthGuard)
@UseFilters(GrpcExceptionFilter)
export class UserStateGrpcController {
  constructor(private readonly userStateService: UserStateService) {}

  /**
   * Get user state
   * Creates default state if it doesn't exist
   */
  @GrpcMethod('UserStateService', 'GetUserState')
  async getUserState(
    _request: Record<string, never>,
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    const state = await this.userStateService.getOrCreate(user.id);

    return this.toProtoResponse(state);
  }

  /**
   * Update user state
   */
  @GrpcMethod('UserStateService', 'UpdateUserState')
  async updateUserState(
    request: {
      selected_condominium_id?: string;
      theme?: string;
      sidebar_collapsed?: boolean;
      language?: string;
    },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    const updateDto: Parameters<typeof this.userStateService.update>[1] = {};

    // Handle selected_condominium_id (empty string means clear)
    if (request.selected_condominium_id !== undefined) {
      updateDto.selectedCondominiumId =
        request.selected_condominium_id === ''
          ? null
          : request.selected_condominium_id;
    }

    if (request.theme !== undefined) {
      updateDto.theme = request.theme as 'light' | 'dark' | 'system';
    }

    if (request.sidebar_collapsed !== undefined) {
      updateDto.sidebarCollapsed = request.sidebar_collapsed;
    }

    if (request.language !== undefined) {
      updateDto.language = request.language;
    }

    const state = await this.userStateService.update(user.id, updateDto);

    return this.toProtoResponse(state);
  }

  /**
   * Set selected condominium
   */
  @GrpcMethod('UserStateService', 'SetSelectedCondominium')
  async setSelectedCondominium(
    request: { condominium_id: string },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    const condominiumId =
      request.condominium_id === '' ? null : request.condominium_id;

    const state = await this.userStateService.setSelectedCondominium(
      user.id,
      condominiumId,
    );

    return this.toProtoResponse(state);
  }

  /**
   * Convert service response to proto format
   */
  private toProtoResponse(state: Awaited<ReturnType<typeof this.userStateService.getOrCreate>>) {
    return {
      id: state.id,
      user_id: state.userId,
      selected_condominium_id: state.selectedCondominiumId || '',
      theme: state.theme,
      sidebar_collapsed: state.sidebarCollapsed,
      language: state.language,
    };
  }
}
