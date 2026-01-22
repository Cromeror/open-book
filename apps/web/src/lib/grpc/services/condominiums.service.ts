/**
 * Condominiums gRPC Service
 *
 * Client for the Condominiums gRPC service.
 */

import { PROTO_FILES } from '../config';
import type {
  Condominium,
  CondominiumListResponse,
  CreateCondominiumInput,
  UpdateCondominiumInput,
  ListCondominiumsOptions,
  Manager,
  ManagerListResponse,
  AssignManagerInput,
  UpdateManagerInput,
} from '../types';
import { BaseGrpcService } from './base.service';

export class CondominiumsService extends BaseGrpcService {
  constructor() {
    super(
      PROTO_FILES.condominiums,
      'openbook.condominiums',
      'CondominiumsService'
    );
  }

  // ============================================
  // User Methods
  // ============================================

  /**
   * Get all condominiums for the authenticated user
   */
  async getUserCondominiums(token: string): Promise<CondominiumListResponse> {
    return this.call('GetUserCondominiums', {}, token);
  }

  /**
   * Get a specific condominium by ID
   */
  async getCondominium(token: string, condominiumId: string): Promise<Condominium> {
    return this.call('GetCondominium', { condominiumId }, token);
  }

  /**
   * Get the primary condominium for the authenticated user
   */
  async getPrimaryCondominium(token: string): Promise<Condominium> {
    return this.call('GetPrimaryCondominium', {}, token);
  }

  // ============================================
  // Admin Methods (SuperAdmin only)
  // ============================================

  /**
   * List all condominiums with pagination
   */
  async listAll(
    token: string,
    options?: ListCondominiumsOptions
  ): Promise<CondominiumListResponse> {
    return this.call(
      'ListAllCondominiums',
      {
        search: options?.search || '',
        isActive: options?.isActive,
        page: options?.page || 1,
        limit: options?.limit || 20,
        orderBy: options?.orderBy || 'createdAt',
        order: options?.order || 'desc',
      },
      token
    );
  }

  /**
   * Get condominium by ID (SuperAdmin - no access check)
   */
  async getById(token: string, id: string): Promise<Condominium> {
    return this.call('GetCondominiumById', { id }, token);
  }

  /**
   * Create a new condominium
   */
  async create(token: string, data: CreateCondominiumInput): Promise<Condominium> {
    return this.call('CreateCondominium', data, token);
  }

  /**
   * Update a condominium
   */
  async update(
    token: string,
    id: string,
    data: UpdateCondominiumInput
  ): Promise<Condominium> {
    return this.call('UpdateCondominium', { id, ...data }, token);
  }

  /**
   * Delete (soft) a condominium
   */
  async delete(token: string, id: string): Promise<void> {
    return this.call('DeleteCondominium', { id }, token);
  }

  /**
   * Toggle condominium active status
   */
  async toggle(token: string, id: string): Promise<Condominium> {
    return this.call('ToggleCondominium', { id }, token);
  }

  // ============================================
  // Manager Methods (SuperAdmin only)
  // ============================================

  /**
   * List managers for a condominium
   */
  async listManagers(
    token: string,
    condominiumId: string,
    isActive?: boolean
  ): Promise<ManagerListResponse> {
    return this.call(
      'ListManagers',
      { condominiumId, isActive },
      token
    );
  }

  /**
   * Assign a manager to a condominium
   */
  async assignManager(token: string, data: AssignManagerInput): Promise<Manager> {
    return this.call('AssignManager', data, token);
  }

  /**
   * Update a manager assignment
   */
  async updateManager(
    token: string,
    managerId: string,
    condominiumId: string,
    data: UpdateManagerInput
  ): Promise<Manager> {
    return this.call(
      'UpdateManager',
      { managerId, condominiumId, ...data },
      token
    );
  }

  /**
   * Unassign a manager from a condominium
   */
  async unassignManager(
    token: string,
    managerId: string,
    condominiumId: string
  ): Promise<void> {
    return this.call('UnassignManager', { managerId, condominiumId }, token);
  }
}
