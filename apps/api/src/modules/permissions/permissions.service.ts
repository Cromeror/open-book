import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import {
  Module,
  ModulePermission,
  UserPermission,
  UserPoolMember,
  PoolPermission,
} from '../../entities';
import { PermissionsCacheService } from './permissions-cache.service';
import type { ModuleWithActions, ModuleAction } from '../../types/module-actions.types';

/**
 * Service for checking user permissions
 *
 * Implements the permission check flow:
 * 1. SuperAdmin check (bypass all)
 * 2. Permission check (direct or via pool)
 *
 * Module access is inferred from having at least one permission for that module.
 */
@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private configService: ConfigService,
    private cacheService: PermissionsCacheService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
    @InjectRepository(ModulePermission)
    private modulePermissionRepo: Repository<ModulePermission>,
    @InjectRepository(UserPermission)
    private userPermissionRepo: Repository<UserPermission>,
    @InjectRepository(UserPoolMember)
    private userPoolMemberRepo: Repository<UserPoolMember>,
    @InjectRepository(PoolPermission)
    private poolPermissionRepo: Repository<PoolPermission>,
  ) {}

  /**
   * Check if user is the SuperAdmin
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'isSuperAdmin'],
    });

    return user?.isSuperAdmin === true;
  }

  /**
   * Check if user has access to a module
   *
   * Module access is inferred from having at least one permission
   * for that module (direct or via pool).
   */
  async hasModuleAccess(userId: string, moduleCode: string): Promise<boolean> {
    if (await this.isSuperAdmin(userId)) {
      return true;
    }

    // Check direct: any user_permission for this module
    const directAccess = await this.userPermissionRepo
      .createQueryBuilder('up')
      .innerJoin('up.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('up.userId = :userId', { userId })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('up.isActive = true')
      .andWhere('m.isActive = true')
      .andWhere('(up.expiresAt IS NULL OR up.expiresAt > :now)', {
        now: new Date(),
      })
      .getOne();

    if (directAccess) {
      return true;
    }

    // Check pool access
    return this.hasModuleAccessViaPool(userId, moduleCode);
  }

  /**
   * Check if user has a specific permission
   *
   * Checks both direct permissions and pool permissions.
   */
  async hasPermission(
    userId: string,
    permission: string,
  ): Promise<boolean> {
    if (await this.isSuperAdmin(userId)) {
      return true;
    }

    const [moduleCode, action] = permission.split(':');

    if (!moduleCode || !action) {
      this.logger.warn(`Invalid permission format: ${permission}`);
      return false;
    }

    // Check direct permission
    const hasDirect = await this.hasDirectPermission(userId, moduleCode, action);
    if (hasDirect) {
      return true;
    }

    // Check pool permissions
    return this.hasPermissionViaPool(userId, moduleCode, action);
  }

  /**
   * Check if user has a direct permission
   */
  private async hasDirectPermission(
    userId: string,
    moduleCode: string,
    action: string,
  ): Promise<boolean> {
    const count = await this.userPermissionRepo
      .createQueryBuilder('up')
      .innerJoin('up.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('up.userId = :userId', { userId })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('mp.code = :action', { action })
      .andWhere('up.isActive = true')
      .andWhere('m.isActive = true')
      .andWhere('(up.expiresAt IS NULL OR up.expiresAt > :now)', {
        now: new Date(),
      })
      .getCount();

    return count > 0;
  }

  /**
   * Check if user has module access via any pool
   */
  async hasModuleAccessViaPool(
    userId: string,
    moduleCode: string,
  ): Promise<boolean> {
    const result = await this.poolPermissionRepo
      .createQueryBuilder('pp')
      .innerJoin('pp.pool', 'p')
      .innerJoin(UserPoolMember, 'upm', 'upm.poolId = p.id')
      .innerJoin('pp.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
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
  ): Promise<boolean> {
    const count = await this.poolPermissionRepo
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
      .getCount();

    return count > 0;
  }

  /**
   * Get all module codes a user has access to
   *
   * Derived from user_permissions and pool_permissions.
   */
  async getUserModuleCodes(userId: string): Promise<string[]> {
    if (await this.isSuperAdmin(userId)) {
      const allModules = await this.moduleRepo.find({
        where: { isActive: true },
        select: ['code'],
      });
      return allModules.map((m) => m.code);
    }

    // Direct: module codes from user_permissions
    const directModules = await this.userPermissionRepo
      .createQueryBuilder('up')
      .innerJoin('up.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('up.userId = :userId', { userId })
      .andWhere('up.isActive = true')
      .andWhere('m.isActive = true')
      .andWhere('(up.expiresAt IS NULL OR up.expiresAt > :now)', {
        now: new Date(),
      })
      .select('DISTINCT m.code', 'code')
      .getRawMany<{ code: string }>();

    // Pool: module codes from pool_permissions
    const poolModules = await this.poolPermissionRepo
      .createQueryBuilder('pp')
      .innerJoin('pp.pool', 'p')
      .innerJoin(UserPoolMember, 'upm', 'upm.poolId = p.id')
      .innerJoin('pp.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('upm.userId = :userId', { userId })
      .andWhere('p.isActive = true')
      .andWhere('m.isActive = true')
      .select('DISTINCT m.code', 'code')
      .getRawMany<{ code: string }>();

    const allCodes = new Set([
      ...directModules.map((m) => m.code),
      ...poolModules.map((m) => m.code),
    ]);

    return Array.from(allCodes);
  }

  /**
   * Get all permissions for a user in a specific module
   */
  async getUserModulePermissions(
    userId: string,
    moduleCode: string,
  ): Promise<{ code: string }[]> {
    if (await this.isSuperAdmin(userId)) {
      const modulePermissions = await this.modulePermissionRepo
        .createQueryBuilder('mp')
        .innerJoin('mp.module', 'm')
        .where('m.code = :moduleCode', { moduleCode })
        .andWhere('m.isActive = true')
        .select('mp.code', 'code')
        .getRawMany<{ code: string }>();

      return modulePermissions;
    }

    // Direct permissions
    const directPerms = await this.userPermissionRepo
      .createQueryBuilder('up')
      .innerJoin('up.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('up.userId = :userId', { userId })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('up.isActive = true')
      .andWhere('m.isActive = true')
      .andWhere('(up.expiresAt IS NULL OR up.expiresAt > :now)', {
        now: new Date(),
      })
      .select('DISTINCT mp.code', 'code')
      .getRawMany<{ code: string }>();

    // Pool permissions
    const poolPerms = await this.poolPermissionRepo
      .createQueryBuilder('pp')
      .innerJoin('pp.pool', 'p')
      .innerJoin(UserPoolMember, 'upm', 'upm.poolId = p.id')
      .innerJoin('pp.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('upm.userId = :userId', { userId })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('p.isActive = true')
      .andWhere('m.isActive = true')
      .select('DISTINCT mp.code', 'code')
      .getRawMany<{ code: string }>();

    const codes = new Set([
      ...directPerms.map((p) => p.code),
      ...poolPerms.map((p) => p.code),
    ]);

    return Array.from(codes).map((code) => ({ code }));
  }

  /**
   * Get all modules with segregated actions for a user
   *
   * Returns modules the user has access to, with only the actions
   * they have permission for. Action code = Permission code.
   */
  async getModulesWithActionsForUser(userId: string): Promise<ModuleWithActions[]> {
    const isSuperAdmin = await this.isSuperAdmin(userId);

    if (isSuperAdmin) {
      return this.getAllModulesWithAllActions();
    }

    // Get user's module codes
    const moduleCodes = await this.getUserModuleCodes(userId);

    if (moduleCodes.length === 0) {
      return [];
    }

    // Get full module data for accessible modules
    const modules = await this.moduleRepo.find({
      where: moduleCodes.map((code) => ({ code, isActive: true })),
      order: { order: 'ASC' },
    });

    // Build response with segregated actions
    const result: ModuleWithActions[] = [];

    for (const module of modules) {
      const userPermissions = await this.getUserModulePermissions(userId, module.code);
      const permissionCodes = new Set(userPermissions.map((p) => p.code));

      const allActions = (module.actionsConfig || []) as ModuleAction[];
      const allowedActions = allActions.filter((action) =>
        permissionCodes.has(action.code),
      );

      if (allowedActions.length === 0) {
        continue;
      }

      const moduleWithActions: ModuleWithActions = {
        code: module.code,
        label: module.name,
        description: module.description || '',
        icon: module.icon || 'FileText',
        type: module.type as 'crud' | 'specialized',
        nav: module.navConfig || { path: `/m/${module.code}`, order: module.order },
        actions: allowedActions,
      };

      if (module.type === 'crud') {
        moduleWithActions.entity = module.entity;
        moduleWithActions.endpoint = module.endpoint;
      }

      if (module.type === 'specialized') {
        moduleWithActions.component = module.component;
      }

      result.push(moduleWithActions);
    }

    result.sort((a, b) => a.nav.order - b.nav.order);

    return result;
  }

  /**
   * Get all modules with all actions (for SuperAdmin)
   */
  private async getAllModulesWithAllActions(): Promise<ModuleWithActions[]> {
    const modules = await this.moduleRepo.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    return modules.map((module) => {
      const moduleWithActions: ModuleWithActions = {
        code: module.code,
        label: module.name,
        description: module.description || '',
        icon: module.icon || 'FileText',
        type: module.type as 'crud' | 'specialized',
        nav: module.navConfig || { path: `/m/${module.code}`, order: module.order },
        actions: (module.actionsConfig || []) as ModuleAction[],
      };

      if (module.type === 'crud') {
        moduleWithActions.entity = module.entity;
        moduleWithActions.endpoint = module.endpoint;
      }

      if (module.type === 'specialized') {
        moduleWithActions.component = module.component;
      }

      return moduleWithActions;
    });
  }
}
