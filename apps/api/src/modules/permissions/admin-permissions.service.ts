import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import {
  Module,
  ModulePermission,
  UserPermission,
} from '../../entities';
import { PoolsService } from './pools.service';
import { PermissionsCacheService } from './permissions-cache.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';

/**
 * Service for SuperAdmin to manage user permissions
 *
 * Module access is inferred from having at least one permission for that module.
 */
@Injectable()
export class AdminPermissionsService {
  private readonly logger = new Logger(AdminPermissionsService.name);

  constructor(
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
    @InjectRepository(ModulePermission)
    private modulePermissionRepo: Repository<ModulePermission>,
    @InjectRepository(UserPermission)
    private userPermissionRepo: Repository<UserPermission>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private poolsService: PoolsService,
    private cacheService: PermissionsCacheService,
  ) {}

  /**
   * Get all active modules with their permissions
   */
  async getAllModules(): Promise<Module[]> {
    return this.moduleRepo.find({
      where: { isActive: true },
      relations: ['permissions'],
      order: { name: 'ASC' },
    });
  }

  /**
   * Get a module by code
   */
  async getModuleByCode(code: string): Promise<Module> {
    const module = await this.moduleRepo.findOne({
      where: { code, isActive: true },
      relations: ['permissions'],
    });

    if (!module) {
      throw new NotFoundException(`Módulo '${code}' no encontrado`);
    }

    return module;
  }

  /**
   * Get permissions for a specific module
   */
  async getModulePermissions(moduleCode: string): Promise<ModulePermission[]> {
    const module = await this.getModuleByCode(moduleCode);

    return this.modulePermissionRepo.find({
      where: { moduleId: module.id },
      order: { code: 'ASC' },
    });
  }

  /**
   * Get effective permissions for a user (direct + pools)
   */
  async getUserEffectivePermissions(userId: string): Promise<{
    user: { id: string; email: string; firstName: string; lastName: string };
    permissions: {
      id?: string;
      permission: ModulePermission;
      source: 'direct' | 'pool';
      poolName?: string;
    }[];
  }> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Direct permissions
    const directPermissions = await this.userPermissionRepo.find({
      where: { userId, isActive: true },
      relations: ['modulePermission', 'modulePermission.module'],
    });

    // Pool permissions
    const userPools = await this.poolsService.getUserPools(userId);
    const poolPermissions: {
      permission: ModulePermission;
      poolName: string;
    }[] = [];

    for (const pool of userPools) {
      const permissions = await this.poolsService.getPoolPermissions(pool.id);
      for (const pp of permissions) {
        poolPermissions.push({
          permission: pp.modulePermission,
          poolName: pool.name,
        });
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      permissions: [
        ...directPermissions.map((up) => ({
          id: up.id,
          permission: up.modulePermission,
          source: 'direct' as const,
        })),
        ...poolPermissions.map((pp) => ({
          permission: pp.permission,
          source: 'pool' as const,
          poolName: pp.poolName,
        })),
      ],
    };
  }

  /**
   * Grant a permission to a user
   */
  async grantPermission(
    superAdminId: string,
    userId: string,
    dto: GrantPermissionDto,
  ): Promise<UserPermission> {
    // Verify user exists
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verify module permission exists
    const modulePermission = await this.modulePermissionRepo.findOne({
      where: { id: dto.modulePermissionId },
      relations: ['module'],
    });

    if (!modulePermission) {
      throw new NotFoundException('Permiso de módulo no encontrado');
    }

    // Check for existing record (active or inactive)
    const existing = await this.userPermissionRepo.findOne({
      where: {
        userId,
        modulePermissionId: dto.modulePermissionId,
      },
    });

    if (existing) {
      if (existing.isActive) {
        throw new ConflictException('Usuario ya tiene este permiso');
      }

      // Reactivate existing record
      existing.isActive = true;
      existing.grantedBy = superAdminId;
      existing.grantedAt = new Date();
      existing.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : null;

      await this.userPermissionRepo.save(existing);

      // Auto-grant 'read' permission for CRUD modules when granting create/update/delete
      if (
        modulePermission.module.type === 'crud' &&
        ['create', 'update', 'delete'].includes(modulePermission.code)
      ) {
        await this.autoGrantReadPermission(
          userId,
          modulePermission.moduleId,
          superAdminId,
          dto.expiresAt,
        );
      }

      // Invalidate cache
      this.cacheService.invalidate(userId);

      this.logger.log(
        `Permission reactivated: ${modulePermission.module.code}:${modulePermission.code} to user ${userId} by ${superAdminId}`,
      );

      return existing;
    }

    const userPermission = this.userPermissionRepo.create({
      userId,
      modulePermissionId: dto.modulePermissionId,
      grantedBy: superAdminId,
      grantedAt: new Date(),
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      isActive: true,
    });

    await this.userPermissionRepo.save(userPermission);

    // Auto-grant 'read' permission for CRUD modules when granting create/update/delete
    if (
      modulePermission.module.type === 'crud' &&
      ['create', 'update', 'delete'].includes(modulePermission.code)
    ) {
      await this.autoGrantReadPermission(
        userId,
        modulePermission.moduleId,
        superAdminId,
        dto.expiresAt,
      );
    }

    // Invalidate cache
    this.cacheService.invalidate(userId);

    this.logger.log(
      `Permission granted: ${modulePermission.module.code}:${modulePermission.code} to user ${userId} by ${superAdminId}`,
    );

    return userPermission;
  }

  /**
   * Auto-grant read permission when granting create/update/delete in CRUD modules
   */
  private async autoGrantReadPermission(
    userId: string,
    moduleId: string,
    superAdminId: string,
    expiresAt: string | null | undefined,
  ): Promise<void> {
    // Find the 'read' permission for this module
    const readPermission = await this.modulePermissionRepo.findOne({
      where: { moduleId, code: 'read' },
    });

    if (!readPermission) {
      this.logger.warn(
        `No 'read' permission found for module ${moduleId}, skipping auto-grant`,
      );
      return;
    }

    // Check if user already has read permission
    const existingReadPermission = await this.userPermissionRepo.findOne({
      where: {
        userId,
        modulePermissionId: readPermission.id,
      },
    });

    if (existingReadPermission) {
      if (!existingReadPermission.isActive) {
        // Reactivate existing read permission
        existingReadPermission.isActive = true;
        existingReadPermission.grantedBy = superAdminId;
        existingReadPermission.grantedAt = new Date();
        existingReadPermission.expiresAt = expiresAt ? new Date(expiresAt) : null;
        await this.userPermissionRepo.save(existingReadPermission);

        this.logger.log(
          `Read permission auto-reactivated for user ${userId} in module ${moduleId}`,
        );
      }
      return;
    }

    // Create new read permission
    const readUserPermission = this.userPermissionRepo.create({
      userId,
      modulePermissionId: readPermission.id,
      grantedBy: superAdminId,
      grantedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true,
    });

    await this.userPermissionRepo.save(readUserPermission);

    this.logger.log(
      `Read permission auto-granted for user ${userId} in module ${moduleId}`,
    );
  }

  /**
   * Revoke a permission from a user
   */
  async revokePermission(
    superAdminId: string,
    userId: string,
    permissionId: string,
  ): Promise<void> {
    const userPermission = await this.userPermissionRepo.findOne({
      where: { id: permissionId, userId, isActive: true },
      relations: ['modulePermission', 'modulePermission.module'],
    });

    if (!userPermission) {
      throw new NotFoundException('Permiso no encontrado');
    }

    userPermission.isActive = false;
    await this.userPermissionRepo.save(userPermission);

    // Invalidate cache
    this.cacheService.invalidate(userId);

    this.logger.log(
      `Permission revoked: ${userPermission.modulePermission.module.code}:${userPermission.modulePermission.code} from user ${userId} by ${superAdminId}`,
    );
  }

  /**
   * Search users with optional filters
   */
  async searchUsers(query: {
    search?: string;
    moduleCode?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const qb = this.userRepo
      .createQueryBuilder('u')
      .where('u.isActive = true');

    if (query.search) {
      qb.andWhere(
        '(u.email ILIKE :search OR u.firstName ILIKE :search OR u.lastName ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.moduleCode) {
      // Filter by users who have at least one permission for this module
      qb.innerJoin(UserPermission, 'up', 'up.userId = u.id')
        .innerJoin(ModulePermission, 'mp', 'mp.id = up.modulePermissionId')
        .innerJoin(Module, 'm', 'm.id = mp.moduleId')
        .andWhere('m.code = :moduleCode', { moduleCode: query.moduleCode })
        .andWhere('up.isActive = true')
        .andWhere('m.isActive = true');
    }

    const [users, total] = await qb
      .select(['u.id', 'u.email', 'u.firstName', 'u.lastName'])
      .orderBy('u.lastName', 'ASC')
      .addOrderBy('u.firstName', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { users, total, page, limit };
  }

  /**
   * Get users who have access to a specific module (via permissions)
   */
  async getUsersByModule(
    moduleCode: string,
  ): Promise<{ id: string; email: string; firstName: string; lastName: string }[]> {
    const module = await this.getModuleByCode(moduleCode);

    // Users with direct permissions for this module
    const directUsers = await this.userRepo
      .createQueryBuilder('u')
      .innerJoin(UserPermission, 'up', 'up.userId = u.id')
      .innerJoin(ModulePermission, 'mp', 'mp.id = up.modulePermissionId')
      .where('mp.moduleId = :moduleId', { moduleId: module.id })
      .andWhere('up.isActive = true')
      .andWhere('u.isActive = true')
      .select(['u.id', 'u.email', 'u.firstName', 'u.lastName'])
      .distinct(true)
      .getMany();

    return directUsers.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
    }));
  }

  /**
   * Get module with actions filtered by current user's permissions
   * SuperAdmin gets all actions, regular users get only their assigned actions
   */
  async getModuleWithUserActions(
    moduleCode: string,
    currentUser: User,
  ): Promise<{
    module: Module;
    actions: ModulePermission[];
    users: { id: string; email: string; firstName: string; lastName: string }[];
  }> {
    const module = await this.moduleRepo.findOne({
      where: { code: moduleCode, isActive: true },
      relations: ['permissions'],
    });

    if (!module) {
      throw new NotFoundException(`Módulo '${moduleCode}' no encontrado`);
    }

    // Get all module permissions (actions)
    const allActions = module.permissions || [];

    let filteredActions: ModulePermission[];

    if (currentUser.isSuperAdmin) {
      // SuperAdmin gets all actions
      filteredActions = allActions;
    } else {
      // Regular user: get only their assigned permissions for this module
      const userPermissions = await this.userPermissionRepo.find({
        where: {
          userId: currentUser.id,
          isActive: true,
        },
        relations: ['modulePermission'],
      });

      // Get permission IDs the user has for this module
      const userPermissionIds = new Set(
        userPermissions
          .filter((up) => up.modulePermission.moduleId === module.id)
          .map((up) => up.modulePermission.id),
      );

      // Also check pool permissions
      const userPools = await this.poolsService.getUserPools(currentUser.id);
      for (const pool of userPools) {
        const poolPermissions =
          await this.poolsService.getPoolPermissions(pool.id);
        for (const pp of poolPermissions) {
          if (pp.modulePermission.moduleId === module.id) {
            userPermissionIds.add(pp.modulePermission.id);
          }
        }
      }

      // Filter actions to only those the user has
      filteredActions = allActions.filter((action) =>
        userPermissionIds.has(action.id),
      );
    }

    // Get users with access to this module
    const users = await this.getUsersByModule(moduleCode);

    return {
      module,
      actions: filteredActions,
      users,
    };
  }
}
