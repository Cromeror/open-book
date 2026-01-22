import { Controller, UseGuards, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';

import { CondominiumsService as UserCondominiumsService } from '../../modules/condominiums/condominiums.service';
import { CondominiumsService as AdminCondominiumsService } from '../../modules/admin/condominiums/condominiums.service';
import { CondominiumManagersService } from '../../modules/admin/condominiums/condominium-managers.service';
import { GrpcJwtAuthGuard } from '../guards/grpc-jwt-auth.guard';
import { GrpcPermissionsGuard } from '../guards/grpc-permissions.guard';
import { GrpcCurrentUser } from '../decorators/grpc-user.decorator';
import { RequestUser } from '../../modules/auth/strategies/jwt.strategy';
import { GrpcExceptionFilter } from '../filters/grpc-exception.filter';

/**
 * gRPC Controller for Condominiums
 *
 * Implements the complete CondominiumsService proto definition.
 * Includes both user endpoints and admin endpoints (CRUD + managers).
 *
 * This is a THIN WRAPPER that reuses existing services for all business logic.
 *
 * Authentication:
 * - All endpoints require JWT authentication via GrpcJwtAuthGuard
 * - Admin endpoints additionally require SuperAdmin role via GrpcPermissionsGuard
 */
@Controller()
@UseGuards(GrpcJwtAuthGuard)
@UseFilters(GrpcExceptionFilter)
export class CondominiumsGrpcController {
  constructor(
    private readonly userCondominiumsService: UserCondominiumsService,
    private readonly adminCondominiumsService: AdminCondominiumsService,
    private readonly managersService: CondominiumManagersService,
  ) {}

  // ========================================
  // USER ENDPOINTS (Regular users)
  // ========================================

  @GrpcMethod('CondominiumsService', 'GetUserCondominiums')
  async getUserCondominiums(
    _request: Record<string, never>,
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    const condominiums = await this.userCondominiumsService.findAllForUser(
      user.id,
    );

    return {
      condominiums: condominiums.map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        city: c.city,
        nit: c.nit || '',
        unit_count: c.unitCount,
        is_primary: c.isPrimary,
        is_active: true,
      })),
    };
  }

  @GrpcMethod('CondominiumsService', 'GetCondominium')
  async getCondominium(
    request: { condominium_id: string },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    const condominium = await this.userCondominiumsService.findOne(
      request.condominium_id,
      user.id,
    );

    return {
      id: condominium.id,
      name: condominium.name,
      address: condominium.address,
      city: condominium.city,
      nit: condominium.nit || '',
      unit_count: condominium.unitCount,
      is_active: condominium.isActive,
      created_at: condominium.createdAt,
      updated_at: condominium.createdAt,
    };
  }

  @GrpcMethod('CondominiumsService', 'GetPrimaryCondominium')
  async getPrimaryCondominium(
    _request: Record<string, never>,
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    const condominium = await this.userCondominiumsService.getPrimaryForUser(
      user.id,
    );

    if (!condominium) {
      throw new Error('No primary condominium found for user');
    }

    return {
      id: condominium.id,
      name: condominium.name,
      address: condominium.address,
      city: condominium.city,
      nit: condominium.nit || '',
      unit_count: condominium.unitCount,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  // ========================================
  // ADMIN ENDPOINTS (SuperAdmin only)
  // ========================================

  @GrpcMethod('CondominiumsService', 'ListAllCondominiums')
  @UseGuards(GrpcPermissionsGuard)
  async listAllCondominiums(
    request: {
      search?: string;
      is_active?: boolean;
      page?: number;
      limit?: number;
      order_by?: string;
      order?: string;
    },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    // Only SuperAdmin can access this
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    const result = await this.adminCondominiumsService.findAll({
      search: request.search,
      isActive: request.is_active,
      page: request.page || 1,
      limit: Math.min(request.limit || 20, 100),
      orderBy: (request.order_by as any) || 'createdAt',
      order: (request.order as any) || 'desc',
    });

    return {
      condominiums: result.data.map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        city: c.city,
        nit: c.nit || '',
        unit_count: c.unitCount || 0,
        is_active: c.isActive,
        created_at: c.createdAt,
        updated_at: c.createdAt,
      })),
      meta: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        total_pages: result.pagination.totalPages,
      },
    };
  }

  @GrpcMethod('CondominiumsService', 'GetCondominiumById')
  @UseGuards(GrpcPermissionsGuard)
  async getCondominiumById(
    request: { id: string },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    const condominium = await this.adminCondominiumsService.findById(
      request.id,
    );

    if (!condominium) {
      throw new Error(`Condominium with ID ${request.id} not found`);
    }

    return {
      id: condominium.id,
      name: condominium.name,
      address: condominium.address,
      city: condominium.city,
      nit: condominium.nit || '',
      unit_count: condominium.unitCount || 0,
      is_active: condominium.isActive,
      created_at: condominium.createdAt,
      updated_at: condominium.createdAt,
    };
  }

  @GrpcMethod('CondominiumsService', 'CreateCondominium')
  @UseGuards(GrpcPermissionsGuard)
  async createCondominium(
    request: {
      name: string;
      nit?: string;
      address: string;
      city: string;
    },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    // Check for duplicate NIT
    if (request.nit) {
      const exists = await this.adminCondominiumsService.existsByNit(
        request.nit,
      );
      if (exists) {
        throw new Error(`NIT ${request.nit} already exists`);
      }
    }

    const condominium = await this.adminCondominiumsService.create({
      name: request.name,
      nit: request.nit,
      address: request.address,
      city: request.city,
    });

    return {
      id: condominium.id,
      name: condominium.name,
      address: condominium.address,
      city: condominium.city,
      nit: condominium.nit || '',
      unit_count: 0,
      is_active: condominium.isActive,
      created_at: condominium.createdAt,
      updated_at: condominium.createdAt,
    };
  }

  @GrpcMethod('CondominiumsService', 'UpdateCondominium')
  @UseGuards(GrpcPermissionsGuard)
  async updateCondominium(
    request: {
      id: string;
      name?: string;
      nit?: string;
      address?: string;
      city?: string;
      is_active?: boolean;
    },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    // Check for duplicate NIT (if updating NIT)
    if (request.nit) {
      const exists = await this.adminCondominiumsService.existsByNit(
        request.nit,
        request.id,
      );
      if (exists) {
        throw new Error(`NIT ${request.nit} already exists`);
      }
    }

    const condominium = await this.adminCondominiumsService.update(request.id, {
      name: request.name,
      nit: request.nit,
      address: request.address,
      city: request.city,
      isActive: request.is_active,
    });

    if (!condominium) {
      throw new Error(`Condominium with ID ${request.id} not found`);
    }

    return {
      id: condominium.id,
      name: condominium.name,
      address: condominium.address,
      city: condominium.city,
      nit: condominium.nit || '',
      unit_count: condominium.unitCount || 0,
      is_active: condominium.isActive,
      created_at: condominium.createdAt,
      updated_at: condominium.createdAt,
    };
  }

  @GrpcMethod('CondominiumsService', 'DeleteCondominium')
  @UseGuards(GrpcPermissionsGuard)
  async deleteCondominium(
    request: { id: string },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    const deleted = await this.adminCondominiumsService.delete(request.id);

    if (!deleted) {
      throw new Error(`Condominium with ID ${request.id} not found`);
    }

    return {};
  }

  @GrpcMethod('CondominiumsService', 'ToggleCondominium')
  @UseGuards(GrpcPermissionsGuard)
  async toggleCondominium(
    request: { id: string },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    const condominium = await this.adminCondominiumsService.toggle(request.id);

    if (!condominium) {
      throw new Error(`Condominium with ID ${request.id} not found`);
    }

    return {
      id: condominium.id,
      name: condominium.name,
      address: condominium.address,
      city: condominium.city,
      nit: condominium.nit || '',
      unit_count: condominium.unitCount || 0,
      is_active: condominium.isActive,
      created_at: condominium.createdAt,
      updated_at: condominium.createdAt,
    };
  }

  // ========================================
  // MANAGER ENDPOINTS (SuperAdmin only)
  // ========================================

  @GrpcMethod('CondominiumsService', 'ListManagers')
  @UseGuards(GrpcPermissionsGuard)
  async listManagers(
    request: {
      condominium_id: string;
      is_active?: boolean;
    },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    // Verify condominium exists
    const condominium = await this.adminCondominiumsService.findById(
      request.condominium_id,
    );
    if (!condominium) {
      throw new Error(
        `Condominium with ID ${request.condominium_id} not found`,
      );
    }

    const managers = await this.managersService.findByCondominium(
      request.condominium_id,
      {
        isActive: request.is_active,
      },
    );

    return {
      managers: managers.map((m) => ({
        id: m.id,
        condominium_id: m.condominiumId,
        user_id: m.userId,
        is_primary: m.isPrimary,
        is_active: m.isActive,
        created_at: m.createdAt,
        updated_at: m.updatedAt,
        user: m.user
          ? {
              id: m.user.id,
              email: m.user.email,
              first_name: m.user.firstName,
              last_name: m.user.lastName,
              is_super_admin: m.user.isSuperAdmin,
              is_active: m.user.isActive,
            }
          : undefined,
        condominium: m.condominium
          ? {
              id: m.condominium.id,
              name: m.condominium.name,
              city: m.condominium.city,
              is_active: m.condominium.isActive,
            }
          : undefined,
      })),
    };
  }

  @GrpcMethod('CondominiumsService', 'AssignManager')
  @UseGuards(GrpcPermissionsGuard)
  async assignManager(
    request: {
      condominium_id: string;
      user_id: string;
      is_primary: boolean;
    },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    const manager = await this.managersService.assign(
      request.condominium_id,
      {
        userId: request.user_id,
        isPrimary: request.is_primary,
      },
      user.id,
    );

    return {
      id: manager.id,
      condominium_id: manager.condominiumId,
      user_id: manager.userId,
      is_primary: manager.isPrimary,
      is_active: manager.isActive,
      created_at: manager.createdAt,
      updated_at: manager.updatedAt,
      user: undefined,
      condominium: undefined,
    };
  }

  @GrpcMethod('CondominiumsService', 'UpdateManager')
  @UseGuards(GrpcPermissionsGuard)
  async updateManager(
    request: {
      manager_id: string;
      condominium_id: string;
      is_primary?: boolean;
      is_active?: boolean;
    },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    // Verify the manager belongs to this condominium
    const manager = await this.managersService.findById(request.manager_id);
    if (!manager || manager.condominiumId !== request.condominium_id) {
      throw new Error(
        `Manager assignment with ID ${request.manager_id} not found for this condominium`,
      );
    }

    const updated = await this.managersService.update(request.manager_id, {
      isPrimary: request.is_primary,
      isActive: request.is_active,
    });

    if (!updated) {
      throw new Error(
        `Manager assignment with ID ${request.manager_id} not found`,
      );
    }

    return {
      id: updated.id,
      condominium_id: updated.condominiumId,
      user_id: updated.userId,
      is_primary: updated.isPrimary,
      is_active: updated.isActive,
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
      user: undefined,
      condominium: undefined,
    };
  }

  @GrpcMethod('CondominiumsService', 'UnassignManager')
  @UseGuards(GrpcPermissionsGuard)
  async unassignManager(
    request: {
      manager_id: string;
      condominium_id: string;
    },
    _metadata: Metadata,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    // Verify the manager belongs to this condominium
    const manager = await this.managersService.findById(request.manager_id);
    if (!manager || manager.condominiumId !== request.condominium_id) {
      throw new Error(
        `Manager assignment with ID ${request.manager_id} not found for this condominium`,
      );
    }

    const unassigned = await this.managersService.unassign(request.manager_id);

    if (!unassigned) {
      throw new Error(
        `Manager assignment with ID ${request.manager_id} not found`,
      );
    }

    return {};
  }
}
