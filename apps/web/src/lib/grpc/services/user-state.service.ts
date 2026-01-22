/**
 * UserState gRPC Service
 *
 * Client for the UserState gRPC service.
 * Manages user preferences and state across sessions.
 */

import { PROTO_FILES } from '../config';
import type { UserState, UpdateUserStateInput } from '../types';
import { BaseGrpcService } from './base.service';

export class UserStateService extends BaseGrpcService {
  constructor() {
    super(PROTO_FILES.userState, 'openbook.userstate', 'UserStateService');
  }

  /**
   * Get user state
   * Creates default state if it doesn't exist
   * Default selectedCondominiumId is the user's primary condominium
   */
  async getUserState(token: string): Promise<UserState> {
    const response = await this.call<Record<string, never>, UserStateProto>(
      'GetUserState',
      {},
      token
    );
    return this.fromProto(response);
  }

  /**
   * Update user state
   * Partial update - only provided fields are updated
   */
  async updateUserState(
    token: string,
    data: UpdateUserStateInput
  ): Promise<UserState> {
    const request: UpdateUserStateProto = {};

    if (data.selectedCondominiumId !== undefined) {
      request.selectedCondominiumId =
        data.selectedCondominiumId === null ? '' : data.selectedCondominiumId;
    }
    if (data.theme !== undefined) {
      request.theme = data.theme;
    }
    if (data.sidebarCollapsed !== undefined) {
      request.sidebarCollapsed = data.sidebarCollapsed;
    }
    if (data.language !== undefined) {
      request.language = data.language;
    }

    const response = await this.call<UpdateUserStateProto, UserStateProto>(
      'UpdateUserState',
      request,
      token
    );
    return this.fromProto(response);
  }

  /**
   * Set selected condominium
   * Shortcut for the most common operation
   * Validates user has access to the condominium
   *
   * @param token - JWT token
   * @param condominiumId - Condominium ID to select, or null to clear
   */
  async setSelectedCondominium(
    token: string,
    condominiumId: string | null
  ): Promise<UserState> {
    const response = await this.call<
      { condominiumId: string },
      UserStateProto
    >('SetSelectedCondominium', { condominiumId: condominiumId || '' }, token);
    return this.fromProto(response);
  }

  /**
   * Convert proto response to TypeScript type
   */
  private fromProto(proto: UserStateProto): UserState {
    return {
      id: proto.id,
      userId: proto.userId,
      selectedCondominiumId: proto.selectedCondominiumId || null,
      theme: proto.theme as UserState['theme'],
      sidebarCollapsed: proto.sidebarCollapsed,
      language: proto.language,
    };
  }
}

/**
 * Proto response type (from gRPC)
 */
interface UserStateProto {
  id: string;
  userId: string;
  selectedCondominiumId?: string;
  theme: string;
  sidebarCollapsed: boolean;
  language: string;
}

/**
 * Proto request type (to gRPC)
 */
interface UpdateUserStateProto {
  selectedCondominiumId?: string;
  theme?: string;
  sidebarCollapsed?: boolean;
  language?: string;
}
