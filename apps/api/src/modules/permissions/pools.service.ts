import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Scope } from '../../types/permissions.enum';
import {
  Module,
  ModulePermission,
  UserPool,
  UserPoolMember,
  PoolModule,
  PoolPermission,
} from '../../entities';
import { PermissionsCacheService } from './permissions-cache.service';
import { CreatePoolDto } from './dto/create-pool.dto';
import { GrantPoolPermissionDto } from './dto/grant-pool-permission.dto';

/**
 * Service for managing user pools
 *
 * Pools allow SuperAdmin to group users with shared permissions.
 * All pool members inherit the pool's module access and permissions.
 */
@Injectable()
export class PoolsService {
  private readonly logger = new Logger(PoolsService.name);

  constructor(
    @InjectRepository(UserPool)
    private poolRepo: Repository<UserPool>,
    @InjectRepository(UserPoolMember)
    private memberRepo: Repository<UserPoolMember>,
    @InjectRepository(PoolModule)
    private poolModuleRepo: Repository<PoolModule>,
    @InjectRepository(PoolPermission)
    private poolPermissionRepo: Repository<PoolPermission>,
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
    @InjectRepository(ModulePermission)
    private modulePermissionRepo: Repository<ModulePermission>,
    private cacheService: PermissionsCacheService,
  ) {}

  /**
   * Create a new user pool
   */
  async create(superAdminId: string, dto: CreatePoolDto): Promise<UserPool> {
    const pool = this.poolRepo.create({
      name: dto.name,
      description: dto.description,
      isActive: true,
      createdBy: superAdminId,
    });

    await this.poolRepo.save(pool);

    this.logger.log(`Pool created: ${pool.name} (${pool.id})`);

    return pool;
  }

  /**
   * Get all pools
   */
  async findAll(): Promise<UserPool[]> {
    return this.poolRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get a pool by ID with all relations
   */
  async findOne(poolId: string): Promise<UserPool> {
    const pool = await this.poolRepo.findOne({
      where: { id: poolId },
      relations: ['members', 'members.user', 'modules', 'modules.module', 'permissions', 'permissions.modulePermission'],
    });

    if (!pool) {
      throw new NotFoundException('Pool no encontrado');
    }

    return pool;
  }

  /**
   * Update pool details
   */
  async update(
    poolId: string,
    dto: Partial<CreatePoolDto>,
  ): Promise<UserPool> {
    const pool = await this.findOne(poolId);

    if (dto.name) pool.name = dto.name;
    if (dto.description !== undefined) pool.description = dto.description;

    await this.poolRepo.save(pool);

    return pool;
  }

  /**
   * Deactivate a pool (soft delete)
   */
  async deactivate(poolId: string): Promise<void> {
    const pool = await this.findOne(poolId);

    // Get all member IDs for cache invalidation
    const memberIds = pool.members?.map((m) => m.userId) || [];

    pool.isActive = false;
    await this.poolRepo.save(pool);

    // Invalidate cache for all members
    this.cacheService.invalidateMany(memberIds);

    this.logger.log(`Pool deactivated: ${pool.name} (${pool.id})`);
  }

  /**
   * Add a user to a pool
   */
  async addMember(
    superAdminId: string,
    poolId: string,
    userId: string,
  ): Promise<UserPoolMember> {
    // Verify pool exists
    await this.findOne(poolId);

    // Check if already a member
    const existing = await this.memberRepo.findOne({
      where: { poolId, userId },
    });

    if (existing) {
      throw new ConflictException('Usuario ya es miembro del pool');
    }

    const member = this.memberRepo.create({
      poolId,
      userId,
      addedBy: superAdminId,
      addedAt: new Date(),
    });

    await this.memberRepo.save(member);

    // Invalidate user's permission cache
    this.cacheService.invalidate(userId);

    this.logger.log(`Member added to pool ${poolId}: ${userId}`);

    return member;
  }

  /**
   * Remove a user from a pool
   */
  async removeMember(
    poolId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.memberRepo.findOne({
      where: { poolId, userId },
    });

    if (!member) {
      throw new NotFoundException('Usuario no es miembro del pool');
    }

    await this.memberRepo.remove(member);

    // Invalidate user's permission cache
    this.cacheService.invalidate(userId);

    this.logger.log(`Member removed from pool ${poolId}: ${userId}`);
  }

  /**
   * Grant module access to a pool
   */
  async grantModuleAccess(
    superAdminId: string,
    poolId: string,
    moduleId: string,
  ): Promise<PoolModule> {
    // Verify pool exists
    const pool = await this.findOne(poolId);

    // Verify module exists and is active
    const module = await this.moduleRepo.findOne({
      where: { id: moduleId, isActive: true },
    });

    if (!module) {
      throw new NotFoundException('Módulo no encontrado');
    }

    // Check if already has access
    const existing = await this.poolModuleRepo.findOne({
      where: { poolId, moduleId },
    });

    if (existing) {
      throw new ConflictException('Pool ya tiene acceso a este módulo');
    }

    const poolModule = this.poolModuleRepo.create({
      poolId,
      moduleId,
      grantedBy: superAdminId,
      grantedAt: new Date(),
    });

    await this.poolModuleRepo.save(poolModule);

    // Invalidate cache for all pool members
    const memberIds = pool.members?.map((m) => m.userId) || [];
    this.cacheService.invalidateMany(memberIds);

    this.logger.log(`Module access granted to pool ${poolId}: ${module.code}`);

    return poolModule;
  }

  /**
   * Revoke module access from a pool
   */
  async revokeModuleAccess(poolId: string, moduleId: string): Promise<void> {
    const pool = await this.findOne(poolId);

    const poolModule = await this.poolModuleRepo.findOne({
      where: { poolId, moduleId },
    });

    if (!poolModule) {
      throw new NotFoundException('Pool no tiene acceso a este módulo');
    }

    // Also remove all permissions for this module
    await this.poolPermissionRepo
      .createQueryBuilder()
      .delete()
      .where('poolId = :poolId', { poolId })
      .andWhere(
        'modulePermissionId IN (SELECT id FROM module_permissions WHERE module_id = :moduleId)',
        { moduleId },
      )
      .execute();

    await this.poolModuleRepo.remove(poolModule);

    // Invalidate cache for all pool members
    const memberIds = pool.members?.map((m) => m.userId) || [];
    this.cacheService.invalidateMany(memberIds);

    this.logger.log(`Module access revoked from pool ${poolId}: ${moduleId}`);
  }

  /**
   * Grant a granular permission to a pool
   */
  async grantPermission(
    superAdminId: string,
    poolId: string,
    dto: GrantPoolPermissionDto,
  ): Promise<PoolPermission> {
    const pool = await this.findOne(poolId);

    // Verify module permission exists
    const modulePermission = await this.modulePermissionRepo.findOne({
      where: { id: dto.modulePermissionId },
      relations: ['module'],
    });

    if (!modulePermission) {
      throw new NotFoundException('Permiso de módulo no encontrado');
    }

    // Verify pool has access to the module
    const hasModuleAccess = await this.poolModuleRepo.findOne({
      where: { poolId, moduleId: modulePermission.moduleId },
    });

    if (!hasModuleAccess) {
      throw new BadRequestException(
        'Pool debe tener acceso al módulo antes de asignar permisos granulares',
      );
    }

    // Check for duplicate
    const existing = await this.poolPermissionRepo.findOne({
      where: {
        poolId,
        modulePermissionId: dto.modulePermissionId,
        scope: dto.scope,
        scopeId: dto.scopeId || undefined,
      },
    });

    if (existing) {
      throw new ConflictException('Pool ya tiene este permiso');
    }

    const poolPermission = this.poolPermissionRepo.create({
      poolId,
      modulePermissionId: dto.modulePermissionId,
      scope: dto.scope,
      scopeId: dto.scopeId || null,
      grantedBy: superAdminId,
      grantedAt: new Date(),
    });

    await this.poolPermissionRepo.save(poolPermission);

    // Invalidate cache for all pool members
    const memberIds = pool.members?.map((m) => m.userId) || [];
    this.cacheService.invalidateMany(memberIds);

    this.logger.log(
      `Permission granted to pool ${poolId}: ${modulePermission.module.code}:${modulePermission.code}`,
    );

    return poolPermission;
  }

  /**
   * Revoke a granular permission from a pool
   */
  async revokePermission(poolId: string, permissionId: string): Promise<void> {
    const pool = await this.findOne(poolId);

    const poolPermission = await this.poolPermissionRepo.findOne({
      where: { id: permissionId, poolId },
    });

    if (!poolPermission) {
      throw new NotFoundException('Permiso no encontrado');
    }

    await this.poolPermissionRepo.remove(poolPermission);

    // Invalidate cache for all pool members
    const memberIds = pool.members?.map((m) => m.userId) || [];
    this.cacheService.invalidateMany(memberIds);

    this.logger.log(`Permission revoked from pool ${poolId}: ${permissionId}`);
  }

  /**
   * Get pools a user belongs to
   */
  async getUserPools(userId: string): Promise<UserPool[]> {
    return this.poolRepo
      .createQueryBuilder('p')
      .innerJoin('p.members', 'm')
      .where('m.userId = :userId', { userId })
      .andWhere('p.isActive = true')
      .getMany();
  }

  /**
   * Get modules a pool has access to
   */
  async getPoolModules(poolId: string): Promise<PoolModule[]> {
    return this.poolModuleRepo.find({
      where: { poolId },
      relations: ['module'],
    });
  }

  /**
   * Get permissions assigned to a pool
   */
  async getPoolPermissions(poolId: string): Promise<PoolPermission[]> {
    return this.poolPermissionRepo.find({
      where: { poolId },
      relations: ['modulePermission', 'modulePermission.module'],
    });
  }

  /**
   * Check if user has module access via any pool
   */
  async hasModuleAccessViaPool(
    userId: string,
    moduleCode: string,
  ): Promise<boolean> {
    const result = await this.poolModuleRepo
      .createQueryBuilder('pm')
      .innerJoin('pm.pool', 'p')
      .innerJoin(UserPoolMember, 'upm', 'upm.poolId = p.id')
      .innerJoin('pm.module', 'm')
      .where('upm.userId = :userId', { userId })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('p.isActive = true')
      .andWhere('m.isActive = true')
      .getOne();

    return !!result;
  }

  /**
   * Check if user has permission via any pool
   */
  async hasPermissionViaPool(
    userId: string,
    moduleCode: string,
    action: string,
    context?: { copropiedadId?: string },
  ): Promise<boolean> {
    const poolPermissions = await this.poolPermissionRepo
      .createQueryBuilder('pp')
      .innerJoin('pp.pool', 'p')
      .innerJoin(UserPoolMember, 'upm', 'upm.poolId = p.id')
      .innerJoin('pp.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('upm.userId = :userId', { userId })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('mp.code = :action', { action })
      .andWhere('p.isActive = true')
      .andWhere('m.isActive = true')
      .select(['pp.scope', 'pp.scopeId'])
      .getMany();

    for (const pp of poolPermissions) {
      if (this.scopeMatches(pp.scope as Scope, pp.scopeId, context)) {
        return true;
      }
    }

    return false;
  }

  private scopeMatches(
    grantedScope: Scope,
    grantedScopeId: string | null | undefined,
    context?: { copropiedadId?: string },
  ): boolean {
    if (grantedScope === Scope.ALL) return true;

    if (grantedScope === Scope.COPROPIEDAD && context?.copropiedadId) {
      return grantedScopeId === context.copropiedadId;
    }

    if (grantedScope === Scope.OWN) {
      return true;
    }

    return !context;
  }
}
