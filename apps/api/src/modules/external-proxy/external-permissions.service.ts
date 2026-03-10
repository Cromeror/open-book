import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { ExternalUser } from '../../entities/external-user.entity';
import { ExternalUserPermission } from '../../entities/external-user-permission.entity';
import { ExternalPoolMember } from '../../entities/external-pool-member.entity';
import { ExternalUserResourceAccess } from '../../entities/external-user-resource-access.entity';
import { PoolPermission } from '../../entities/pool-permission.entity';
import { PoolResourceAccess } from '../../entities/pool-resource-access.entity';
import type { ResponseFilter } from '../../types/resource-access.types';

/**
 * Service for checking external user permissions.
 *
 * Resolves an external identifier (string from the external system) to an
 * ExternalUser record, then checks permissions through two paths:
 *
 * - Direct: external_user_permissions / external_user_resource_access
 * - Via pool: external_pool_members → user_pools → pool_permissions / pool_resource_access
 *
 * Three levels:
 * 1. Module access (has at least one permission for the module)
 * 2. Granular permission (module:action)
 * 3. Resource-level access (specific resource + HTTP method)
 */
@Injectable()
export class ExternalPermissionsService {
  private readonly logger = new Logger(ExternalPermissionsService.name);

  constructor(
    @InjectRepository(ExternalUser)
    private readonly externalUserRepo: Repository<ExternalUser>,
    @InjectRepository(ExternalUserPermission)
    private readonly userPermissionRepo: Repository<ExternalUserPermission>,
    @InjectRepository(ExternalPoolMember)
    private readonly poolMemberRepo: Repository<ExternalPoolMember>,
    @InjectRepository(ExternalUserResourceAccess)
    private readonly userResourceAccessRepo: Repository<ExternalUserResourceAccess>,
    @InjectRepository(PoolPermission)
    private readonly poolPermissionRepo: Repository<PoolPermission>,
    @InjectRepository(PoolResourceAccess)
    private readonly poolResourceAccessRepo: Repository<PoolResourceAccess>,
  ) {}

  /**
   * Resolve an external identifier + integration to an ExternalUser.
   * Returns null if not found.
   */
  async resolveExternalUser(
    externalId: string,
    integrationId: string,
  ): Promise<ExternalUser | null> {
    return this.externalUserRepo.findOne({
      where: { externalId, integrationId, isActive: true },
    });
  }

  /**
   * Check if an external user has access to a module
   * (has at least one permission for that module, direct or via pool)
   */
  async hasModuleAccess(
    externalId: string,
    integrationId: string,
    moduleCode: string,
  ): Promise<boolean> {
    const user = await this.resolveExternalUser(externalId, integrationId);
    if (!user) return false;

    // Direct check
    const direct = await this.userPermissionRepo
      .createQueryBuilder('eup')
      .innerJoin('eup.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('eup.externalUserId = :userId', { userId: user.id })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('eup.isActive = true')
      .andWhere('m.isActive = true')
      .andWhere('(eup.expiresAt IS NULL OR eup.expiresAt > :now)', { now: new Date() })
      .getCount();

    if (direct > 0) return true;

    // Pool check: external_pool_members → user_pools → pool_permissions
    const poolCount = await this.poolPermissionRepo
      .createQueryBuilder('pp')
      .innerJoin('pp.pool', 'p')
      .innerJoin(ExternalPoolMember, 'epm', 'epm.poolId = p.id')
      .innerJoin('pp.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('epm.externalUserId = :userId', { userId: user.id })
      .andWhere('p.isActive = true')
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('m.isActive = true')
      .getCount();

    return poolCount > 0;
  }

  /**
   * Check if an external user has a specific permission (module:action)
   */
  async hasPermission(
    externalId: string,
    integrationId: string,
    permission: string,
  ): Promise<boolean> {
    const [moduleCode, action] = permission.split(':');
    if (!moduleCode || !action) {
      this.logger.warn(`Invalid permission format: ${permission}`);
      return false;
    }

    const user = await this.resolveExternalUser(externalId, integrationId);
    if (!user) return false;

    // Direct check
    const direct = await this.userPermissionRepo
      .createQueryBuilder('eup')
      .innerJoin('eup.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('eup.externalUserId = :userId', { userId: user.id })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('mp.code = :action', { action })
      .andWhere('eup.isActive = true')
      .andWhere('m.isActive = true')
      .andWhere('(eup.expiresAt IS NULL OR eup.expiresAt > :now)', { now: new Date() })
      .getCount();

    if (direct > 0) return true;

    // Pool check
    const poolCount = await this.poolPermissionRepo
      .createQueryBuilder('pp')
      .innerJoin('pp.pool', 'p')
      .innerJoin(ExternalPoolMember, 'epm', 'epm.poolId = p.id')
      .innerJoin('pp.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('epm.externalUserId = :userId', { userId: user.id })
      .andWhere('p.isActive = true')
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('mp.code = :action', { action })
      .andWhere('m.isActive = true')
      .getCount();

    return poolCount > 0;
  }

  /**
   * Check if an external user has access to a specific resource + HTTP method.
   * Also returns the response filter if one exists.
   */
  async checkResourceAccess(
    externalId: string,
    integrationId: string,
    resourceId: string,
    resourceHttpMethodId: string,
  ): Promise<{ allowed: boolean; responseFilter: ResponseFilter | null }> {
    const user = await this.resolveExternalUser(externalId, integrationId);
    if (!user) return { allowed: false, responseFilter: null };

    // Check direct access (specific method or wildcard)
    const directAccess = await this.userResourceAccessRepo.findOne({
      where: [
        {
          externalUserId: user.id,
          resourceId,
          resourceHttpMethodId,
          isActive: true,
        },
        {
          externalUserId: user.id,
          resourceId,
          resourceHttpMethodId: IsNull(),
          isActive: true,
        },
      ],
    });

    if (directAccess) {
      if (directAccess.expiresAt && directAccess.expiresAt < new Date()) {
        // Expired — fall through to pool check
      } else {
        return { allowed: true, responseFilter: directAccess.responseFilter ?? null };
      }
    }

    // Check pool access: external_pool_members → user_pools → pool_resource_access
    const poolMemberships = await this.poolMemberRepo.find({
      where: { externalUserId: user.id },
      select: ['poolId'],
      relations: ['pool'],
    });

    const activePools = poolMemberships.filter((m) => m.pool?.isActive);

    for (const membership of activePools) {
      const poolAccess = await this.poolResourceAccessRepo.findOne({
        where: [
          { poolId: membership.poolId, resourceId, resourceHttpMethodId },
          { poolId: membership.poolId, resourceId, resourceHttpMethodId: IsNull() },
        ],
      });

      if (poolAccess) {
        return { allowed: true, responseFilter: poolAccess.responseFilter ?? null };
      }
    }

    return { allowed: false, responseFilter: null };
  }
}
