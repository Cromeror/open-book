import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { UserState } from '../../entities/user-state.entity';
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
  private readonly logger = new Logger(UserStateService.name);

  constructor(
    @InjectRepository(UserState)
    private readonly userStateRepository: Repository<UserState>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  /**
   * Get user state, creating it if it doesn't exist
   *
   * When creating a new state, uses default values for all fields
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

    // Invalidate session context cache
    await this.invalidateSessionCache(userId);

    return this.toResponse(state);
  }

  /**
   * Create default state for a user
   */
  private async createDefaultState(userId: string): Promise<UserState> {
    const state = this.userStateRepository.create({
      userId,
      theme: 'system',
      sidebarCollapsed: false,
      language: 'es',
    });

    return this.userStateRepository.save(state);
  }

  /**
   * Invalidate session context cache for a user
   */
  private async invalidateSessionCache(userId: string): Promise<void> {
    await this.cache.del(`session-context:${userId}`);
    this.logger.debug(`Session context cache invalidated for user: ${userId}`);
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
