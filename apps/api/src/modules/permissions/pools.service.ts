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
  PoolResourceAccess,
  Resource,
  ResourceHttpMethod,
} from '../../entities';
import { ExternalUser } from '../../entities/external-user.entity';
import { ExternalPoolMember } from '../../entities/external-pool-member.entity';
import { Organization } from '../../entities/organization.entity';
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
    @InjectRepository(ExternalUser)
    private externalUserRepo: Repository<ExternalUser>,
    @InjectRepository(ExternalPoolMember)
    private externalMemberRepo: Repository<ExternalPoolMember>,
    @InjectRepository(Organization)
    private organizationRepo: Repository<Organization>,
    @InjectRepository(PoolResourceAccess)
    private poolResourceAccessRepo: Repository<PoolResourceAccess>,
    @InjectRepository(Resource)
    private resourceRepo: Repository<Resource>,
    @InjectRepository(ResourceHttpMethod)
    private resourceHttpMethodRepo: Repository<ResourceHttpMethod>,
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
      relations: [
        'members', 'members.user',
        'externalMembers', 'externalMembers.externalUser',
        'permissions', 'permissions.modulePermission',
        'resourceAccess', 'resourceAccess.resource', 'resourceAccess.resourceHttpMethod',
        'resourceAccess.resourceHttpMethod.httpMethod',
      ],
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
   * Add an external user to a pool.
   * Resolves the organization to find the integration, then finds or creates
   * the ExternalUser record before creating the membership.
   */
  async addExternalMember(
    superAdminId: string,
    poolId: string,
    externalUserId: string,
    organizationCode: string,
    userInfo?: { name?: string; email?: string; clientId?: string; clientName?: string },
  ): Promise<ExternalPoolMember> {
    // Verify pool exists
    await this.findOne(poolId);

    // Resolve organization → integration
    const org = await this.organizationRepo.findOne({
      where: { code: organizationCode, isActive: true },
      relations: ['integration'],
    });

    if (!org) {
      throw new NotFoundException(`Organizacion "${organizationCode}" no encontrada`);
    }

    if (!org.integrationId) {
      throw new NotFoundException(`Organizacion "${organizationCode}" no tiene integracion configurada`);
    }

    // Find or create ExternalUser
    let extUser = await this.externalUserRepo.findOne({
      where: { externalId: externalUserId, integrationId: org.integrationId },
    });

    if (!extUser) {
      extUser = this.externalUserRepo.create({
        externalId: externalUserId,
        integrationId: org.integrationId,
        name: userInfo?.name || null,
        email: userInfo?.email || null,
        organizationCode,
        clientId: userInfo?.clientId || null,
        clientName: userInfo?.clientName || null,
        isActive: true,
      });
      await this.externalUserRepo.save(extUser);
      this.logger.log(`External user created: ${externalUserId} (integration: ${org.integrationId})`);
    } else {
      let updated = false;
      if (userInfo?.name && extUser.name !== userInfo.name) { extUser.name = userInfo.name; updated = true; }
      if (userInfo?.email && extUser.email !== userInfo.email) { extUser.email = userInfo.email; updated = true; }
      if (organizationCode && extUser.organizationCode !== organizationCode) { extUser.organizationCode = organizationCode; updated = true; }
      if (userInfo?.clientId && extUser.clientId !== userInfo.clientId) { extUser.clientId = userInfo.clientId; updated = true; }
      if (userInfo?.clientName && extUser.clientName !== userInfo.clientName) { extUser.clientName = userInfo.clientName; updated = true; }
      if (updated) await this.externalUserRepo.save(extUser);
    }

    // Check for existing membership
    const existing = await this.externalMemberRepo.findOne({
      where: { externalUserId: extUser.id, poolId },
    });

    if (existing) {
      throw new ConflictException('Usuario externo ya es miembro del pool');
    }

    const member = this.externalMemberRepo.create({
      externalUserId: extUser.id,
      poolId,
      addedBy: superAdminId,
      addedAt: new Date(),
    });

    await this.externalMemberRepo.save(member);

    this.logger.log(`External member added to pool ${poolId}: ${extUser.externalId} (${extUser.id})`);

    return member;
  }

  /**
   * Remove an external user from a pool
   */
  async removeExternalMember(
    poolId: string,
    externalUserId: string,
  ): Promise<void> {
    const member = await this.externalMemberRepo.findOne({
      where: { poolId, externalUserId },
    });

    if (!member) {
      throw new NotFoundException('Usuario externo no es miembro del pool');
    }

    await this.externalMemberRepo.remove(member);

    this.logger.log(`External member removed from pool ${poolId}: ${externalUserId}`);
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

  /**
   * Grant resource access to a pool.
   * When resourceHttpMethodId is null, access is granted to ALL methods (wildcard).
   */
  async grantResourceAccess(
    superAdminId: string,
    poolId: string,
    resourceId: string,
    resourceHttpMethodId?: string | null,
    responseFilter?: { field: string; type: 'include' | 'exclude'; values: string[] } | null,
  ): Promise<PoolResourceAccess> {
    await this.findOne(poolId);

    const resource = await this.resourceRepo.findOne({ where: { id: resourceId } });
    if (!resource) {
      throw new NotFoundException('Recurso no encontrado');
    }

    if (resourceHttpMethodId) {
      const rhm = await this.resourceHttpMethodRepo.findOne({
        where: { id: resourceHttpMethodId, resourceId },
      });
      if (!rhm) {
        throw new NotFoundException('Metodo HTTP no encontrado para este recurso');
      }
    }

    // Check for duplicate
    const existing = await this.poolResourceAccessRepo.findOne({
      where: {
        poolId,
        resourceId,
        resourceHttpMethodId: resourceHttpMethodId ?? undefined,
      },
    });

    if (existing) {
      throw new ConflictException('El pool ya tiene este acceso al recurso');
    }

    const access = this.poolResourceAccessRepo.create({
      poolId,
      resourceId,
      resourceHttpMethodId: resourceHttpMethodId ?? null,
      grantedBy: superAdminId,
      grantedAt: new Date(),
      responseFilter: responseFilter ?? null,
    });

    await this.poolResourceAccessRepo.save(access);

    this.logger.log(
      `Resource access granted to pool ${poolId}: ${resource.code} ${resourceHttpMethodId || 'ALL'}`,
    );

    return access;
  }

  /**
   * Revoke resource access from a pool
   */
  async revokeResourceAccess(poolId: string, accessId: string): Promise<void> {
    const access = await this.poolResourceAccessRepo.findOne({
      where: { id: accessId, poolId },
    });

    if (!access) {
      throw new NotFoundException('Acceso a recurso no encontrado');
    }

    await this.poolResourceAccessRepo.remove(access);

    this.logger.log(`Resource access revoked from pool ${poolId}: ${accessId}`);
  }
}
