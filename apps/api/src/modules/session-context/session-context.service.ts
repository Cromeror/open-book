import { Injectable, Logger } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { UserStateService } from '../user-state/user-state.service';
import { CondominiumsService } from '../condominiums/condominiums.service';

/**
 * Resolved session context for a user
 */
export interface ResolvedSessionContext {
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  isSuperAdmin: boolean;
  condominiumId: string;
  condominiumName: string;
  userStateTheme: string;
  userStateLanguage: string;
  userStateSidebarCollapsed: boolean;
}

/**
 * Service for assembling user session context
 *
 * Gathers data from multiple sources (User, UserState, Condominium)
 * and returns a flat object with all resolved values.
 */
@Injectable()
export class SessionContextService {
  private readonly logger = new Logger(SessionContextService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly userStateService: UserStateService,
    private readonly condominiumsService: CondominiumsService,
  ) {}

  /**
   * Resolve the full session context for a user
   *
   * Loads user data, preferences, and selected condominium.
   * If any source fails, uses empty defaults for that section.
   */
  async getContext(userId: string): Promise<ResolvedSessionContext> {
    // Load user
    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.warn(`User not found for session context: ${userId}`);
      return this.emptyContext(userId);
    }

    // Load user state (preferences)
    const userState = await this.userStateService.getOrCreate(userId);

    // Load selected condominium if available
    let condominiumId = '';
    let condominiumName = '';

    if (userState.selectedCondominiumId) {
      try {
        const condominium = await this.condominiumsService.findOne(
          userState.selectedCondominiumId,
          userId,
        );
        condominiumId = condominium.id;
        condominiumName = condominium.name;
      } catch {
        this.logger.debug(
          `Could not resolve condominium ${userState.selectedCondominiumId} for user ${userId}`,
        );
      }
    }

    return {
      userId: user.id,
      userEmail: user.email,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin,
      condominiumId,
      condominiumName,
      userStateTheme: userState.theme,
      userStateLanguage: userState.language,
      userStateSidebarCollapsed: userState.sidebarCollapsed,
    };
  }

  private emptyContext(userId: string): ResolvedSessionContext {
    return {
      userId,
      userEmail: '',
      userFirstName: '',
      userLastName: '',
      isSuperAdmin: false,
      condominiumId: '',
      condominiumName: '',
      userStateTheme: 'system',
      userStateLanguage: 'es',
      userStateSidebarCollapsed: false,
    };
  }
}
