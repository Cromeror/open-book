import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserState } from '../../entities/user-state.entity';
import { CondominiumsService } from '../condominiums/condominiums.service';

/**
 * Response DTO for UserState
 */
export interface UserStateResponse {
  id: string;
  userId: string;
  selectedCondominiumId: string | null;
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  language: string;
}

/**
 * Update DTO for UserState
 */
export interface UpdateUserStateDto {
  selectedCondominiumId?: string | null;
  theme?: 'light' | 'dark' | 'system';
  sidebarCollapsed?: boolean;
  language?: string;
}

/**
 * Service for managing user state
 *
 * Handles CRUD operations for user preferences and state.
 * Automatically creates user state if it doesn't exist.
 */
@Injectable()
export class UserStateService {
  constructor(
    @InjectRepository(UserState)
    private readonly userStateRepository: Repository<UserState>,
    private readonly condominiumsService: CondominiumsService,
  ) {}

  /**
   * Get user state, creating it if it doesn't exist
   *
   * When creating a new state:
   * - Sets selectedCondominiumId to user's primary condominium
   * - Uses default values for other fields
   */
  async getOrCreate(userId: string): Promise<UserStateResponse> {
    let state = await this.userStateRepository.findOne({
      where: { userId },
    });

    if (!state) {
      state = await this.createDefaultState(userId);
    }

    return this.toResponse(state);
  }

  /**
   * Update user state
   *
   * Creates state if it doesn't exist, then applies updates.
   */
  async update(
    userId: string,
    dto: UpdateUserStateDto,
  ): Promise<UserStateResponse> {
    let state = await this.userStateRepository.findOne({
      where: { userId },
    });

    if (!state) {
      state = await this.createDefaultState(userId);
    }

    // Apply updates
    if (dto.selectedCondominiumId !== undefined) {
      state.selectedCondominiumId = dto.selectedCondominiumId || undefined;
    }
    if (dto.theme !== undefined) {
      state.theme = dto.theme;
    }
    if (dto.sidebarCollapsed !== undefined) {
      state.sidebarCollapsed = dto.sidebarCollapsed;
    }
    if (dto.language !== undefined) {
      state.language = dto.language;
    }

    state = await this.userStateRepository.save(state);

    return this.toResponse(state);
  }

  /**
   * Set selected condominium
   *
   * Shortcut method for the most common operation.
   * Validates that the user has access to the condominium.
   */
  async setSelectedCondominium(
    userId: string,
    condominiumId: string | null,
  ): Promise<UserStateResponse> {
    // Validate access if setting a condominium
    if (condominiumId) {
      const hasAccess = await this.condominiumsService.userHasAccess(
        userId,
        condominiumId,
      );
      if (!hasAccess) {
        throw new NotFoundException(
          'Condominio no encontrado o sin acceso',
        );
      }
    }

    return this.update(userId, { selectedCondominiumId: condominiumId });
  }

  /**
   * Create default state for a user
   */
  private async createDefaultState(userId: string): Promise<UserState> {
    // Get user's primary condominium
    const primaryCondominium =
      await this.condominiumsService.getPrimaryForUser(userId);

    const state = this.userStateRepository.create({
      userId,
      selectedCondominiumId: primaryCondominium?.id,
      theme: 'system',
      sidebarCollapsed: false,
      language: 'es',
    });

    return this.userStateRepository.save(state);
  }

  /**
   * Convert entity to response DTO
   */
  private toResponse(state: UserState): UserStateResponse {
    return {
      id: state.id,
      userId: state.userId,
      selectedCondominiumId: state.selectedCondominiumId || null,
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      language: state.language,
    };
  }
}
