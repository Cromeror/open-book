import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Module,
  ModulePermission,
  UserPool,
  UserPoolMember,
  PoolPermission,
} from '../../entities';
import { PermissionsCacheService } from './permissions-cache.service';
import { CreatePoolDto } from './dto/create-pool.dto';
import { GrantPoolPermissionDto } from './dto/grant-pool-permission.dto';

/**
 * Service for managing user pools
 *
 * Pools allow SuperAdmin to group users with shared permissions.
 * All pool members inherit the pool's permissions.
 * Module access is inferred from having at least one permission for that module.
 */
@Injectable()
export class PoolsService {
  private readonly logger = new Logger(PoolsService.name);

  constructor(
    @InjectRepository(UserPool)
    private poolRepo: Repository<UserPool>,
    @InjectRepository(UserPoolMember)
    private memberRepo: Repository<UserPoolMember>,
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
      relations: ['members', 'members.user', 'permissions', 'permissions.modulePermission'],
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
   * Grant a permission to a pool
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

    // Check for duplicate
    const existing = await this.poolPermissionRepo.findOne({
      where: {
        poolId,
        modulePermissionId: dto.modulePermissionId,
      },
    });

    if (existing) {
      throw new ConflictException('Pool ya tiene este permiso');
    }

    const poolPermission = this.poolPermissionRepo.create({
      poolId,
      modulePermissionId: dto.modulePermissionId,
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
   * Revoke a permission from a pool
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
   * Get permissions assigned to a pool
   */
  async getPoolPermissions(poolId: string): Promise<PoolPermission[]> {
    return this.poolPermissionRepo.find({
      where: { poolId },
      relations: ['modulePermission', 'modulePermission.module'],
    });
  }
}
