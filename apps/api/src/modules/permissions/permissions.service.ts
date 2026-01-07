import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import { PermissionContext, Scope } from './permissions.enum';
import {
  Module,
  ModulePermission,
  UserModule,
  UserPermission,
  UserPoolMember,
  PoolModule,
  PoolPermission,
} from './entities';
import { PermissionsCacheService } from './permissions-cache.service';
import type { ModuleWithActions, ModuleAction } from './types/module-actions.types';

/**
 * Service for checking user permissions
 *
 * Implements the permission check flow:
 * 1. SuperAdmin check (bypass all)
 * 2. Module access check (direct or via pool)
 * 3. Granular permission check (direct or via pool)
 * 4. Scope verification
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
    @InjectRepository(UserModule)
    private userModuleRepo: Repository<UserModule>,
    @InjectRepository(UserPermission)
    private userPermissionRepo: Repository<UserPermission>,
    @InjectRepository(UserPoolMember)
    private userPoolMemberRepo: Repository<UserPoolMember>,
    @InjectRepository(PoolModule)
    private poolModuleRepo: Repository<PoolModule>,
    @InjectRepository(PoolPermission)
    private poolPermissionRepo: Repository<PoolPermission>,
  ) {}

  /**
   * Check if user is the SuperAdmin
   *
   * SuperAdmin has full access to all system features.
   * Determined by checking the isSuperAdmin flag on the user entity.
   *
   * @param userId - User ID to check
   * @returns True if user is SuperAdmin
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
   * Checks both direct access (UserModule) and pool access (PoolModule).
   *
   * @param userId - User ID to check
   * @param moduleCode - Module code (e.g., 'objetivos')
   * @returns True if user has access to the module
   */
  async hasModuleAccess(userId: string, moduleCode: string): Promise<boolean> {
    // SuperAdmin has access to everything
    if (await this.isSuperAdmin(userId)) {
      return true;
    }

    // Check direct access
    const directAccess = await this.userModuleRepo
      .createQueryBuilder('um')
      .innerJoin('um.module', 'm')
      .where('um.userId = :userId', { userId })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('um.isActive = true')
      .andWhere('m.isActive = true')
      .andWhere('(um.expiresAt IS NULL OR um.expiresAt > :now)', {
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
   * Requires:
   * 1. Access to the module
   * 2. The specific granular permission
   * 3. Appropriate scope for the context
   *
   * @param userId - User ID to check
   * @param permission - Permission string (e.g., 'objetivos:create')
   * @param context - Optional context for scope verification
   * @returns True if user has the permission
   */
  async hasPermission(
    userId: string,
    permission: string,
    context?: PermissionContext,
  ): Promise<boolean> {
    // SuperAdmin has all permissions
    if (await this.isSuperAdmin(userId)) {
      return true;
    }

    const [moduleCode, action] = permission.split(':');

    if (!moduleCode || !action) {
      this.logger.warn(`Invalid permission format: ${permission}`);
      return false;
    }

    // 1. Check module access
    const hasModule = await this.hasModuleAccess(userId, moduleCode);
    if (!hasModule) {
      return false;
    }

    // 2. Check direct permission
    const directPermission = await this.getDirectPermission(
      userId,
      moduleCode,
      action,
    );

    if (directPermission) {
      if (this.scopeMatches(directPermission.scope, directPermission.scopeId, context)) {
        return true;
      }
    }

    // 3. Check pool permissions
    return this.hasPermissionViaPool(userId, moduleCode, action, context);
  }

  /**
   * Get direct permission for a user
   */
  private async getDirectPermission(
    userId: string,
    moduleCode: string,
    action: string,
  ): Promise<{ scope: Scope; scopeId?: string | null } | null> {
    const permission = await this.userPermissionRepo
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
      .select(['up.scope', 'up.scopeId'])
      .getOne();

    if (!permission) {
      return null;
    }

    return {
      scope: permission.scope as Scope,
      scopeId: permission.scopeId,
    };
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
    context?: PermissionContext,
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

    // Check if any pool permission matches the context
    for (const pp of poolPermissions) {
      if (this.scopeMatches(pp.scope as Scope, pp.scopeId, context)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if granted scope matches the request context
   */
  private scopeMatches(
    grantedScope: Scope,
    grantedScopeId: string | null | undefined,
    context?: PermissionContext,
  ): boolean {
    // ALL scope allows everything
    if (grantedScope === Scope.ALL) {
      return true;
    }

    // COPROPIEDAD scope: verify copropiedad ID matches
    if (grantedScope === Scope.COPROPIEDAD && context?.copropiedadId) {
      return grantedScopeId === context.copropiedadId;
    }

    // OWN scope: the calling service must verify ownership
    // We return true here and let the service handle the actual ownership check
    if (grantedScope === Scope.OWN) {
      return true;
    }

    // Default: no context means allow (for listing operations)
    if (!context) {
      return true;
    }

    return false;
  }

  /**
   * Get all module codes a user has access to
   */
  async getUserModuleCodes(userId: string): Promise<string[]> {
    if (await this.isSuperAdmin(userId)) {
      // SuperAdmin has access to all modules
      const allModules = await this.moduleRepo.find({
        where: { isActive: true },
        select: ['code'],
      });
      return allModules.map((m) => m.code);
    }

    // Direct modules
    const directModules = await this.userModuleRepo
      .createQueryBuilder('um')
      .innerJoin('um.module', 'm')
      .where('um.userId = :userId', { userId })
      .andWhere('um.isActive = true')
      .andWhere('m.isActive = true')
      .andWhere('(um.expiresAt IS NULL OR um.expiresAt > :now)', {
        now: new Date(),
      })
      .select('m.code', 'code')
      .getRawMany<{ code: string }>();

    // Pool modules
    const poolModules = await this.poolModuleRepo
      .createQueryBuilder('pm')
      .innerJoin('pm.pool', 'p')
      .innerJoin(UserPoolMember, 'upm', 'upm.poolId = p.id')
      .innerJoin('pm.module', 'm')
      .where('upm.userId = :userId', { userId })
      .andWhere('p.isActive = true')
      .andWhere('m.isActive = true')
      .select('m.code', 'code')
      .getRawMany<{ code: string }>();

    // Combine and deduplicate
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
  ): Promise<{ code: string; scope: Scope; scopeId?: string | null }[]> {
    if (await this.isSuperAdmin(userId)) {
      // SuperAdmin has all permissions with ALL scope
      const modulePermissions = await this.modulePermissionRepo
        .createQueryBuilder('mp')
        .innerJoin('mp.module', 'm')
        .where('m.code = :moduleCode', { moduleCode })
        .andWhere('m.isActive = true')
        .select('mp.code', 'code')
        .getRawMany<{ code: string }>();

      return modulePermissions.map((p) => ({
        code: p.code,
        scope: Scope.ALL,
      }));
    }

    // Direct permissions
    const directPermissions = await this.userPermissionRepo
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
      .select(['mp.code', 'up.scope', 'up.scopeId'])
      .getRawMany<{ mp_code: string; up_scope: string; up_scope_id: string }>();

    // Pool permissions
    const poolPermissions = await this.poolPermissionRepo
      .createQueryBuilder('pp')
      .innerJoin('pp.pool', 'p')
      .innerJoin(UserPoolMember, 'upm', 'upm.poolId = p.id')
      .innerJoin('pp.modulePermission', 'mp')
      .innerJoin('mp.module', 'm')
      .where('upm.userId = :userId', { userId })
      .andWhere('m.code = :moduleCode', { moduleCode })
      .andWhere('p.isActive = true')
      .andWhere('m.isActive = true')
      .select(['mp.code', 'pp.scope', 'pp.scopeId'])
      .getRawMany<{ mp_code: string; pp_scope: string; pp_scope_id: string }>();

    // Combine permissions (use broadest scope if duplicates)
    const permissionMap = new Map<
      string,
      { code: string; scope: Scope; scopeId?: string | null }
    >();

    for (const p of directPermissions) {
      const key = `${p.mp_code}:${p.up_scope}:${p.up_scope_id || ''}`;
      permissionMap.set(key, {
        code: p.mp_code,
        scope: p.up_scope as Scope,
        scopeId: p.up_scope_id,
      });
    }

    for (const p of poolPermissions) {
      const key = `${p.mp_code}:${p.pp_scope}:${p.pp_scope_id || ''}`;
      if (!permissionMap.has(key)) {
        permissionMap.set(key, {
          code: p.mp_code,
          scope: p.pp_scope as Scope,
          scopeId: p.pp_scope_id,
        });
      }
    }

    return Array.from(permissionMap.values());
  }

  /**
   * Get all modules with segregated actions for a user
   *
   * Returns modules the user has access to, with only the actions
   * they have permission for. Action code = Permission code.
   *
   * @param userId - User ID
   * @returns Array of modules with their allowed actions
   */
  async getModulesWithActionsForUser(userId: string): Promise<ModuleWithActions[]> {
    const isSuperAdmin = await this.isSuperAdmin(userId);

    if (isSuperAdmin) {
      // SuperAdmin gets all modules with all actions
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
      // Get user's permissions for this module
      const userPermissions = await this.getUserModulePermissions(userId, module.code);
      const permissionCodes = new Set(userPermissions.map((p) => p.code));

      // Filter actions based on permissions
      const allActions = (module.actionsConfig || []) as ModuleAction[];
      const allowedActions = allActions.filter((action) =>
        permissionCodes.has(action.code),
      );

      // Skip module if user has no allowed actions
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

      // Add CRUD-specific fields
      if (module.type === 'crud') {
        moduleWithActions.entity = module.entity;
        moduleWithActions.endpoint = module.endpoint;
      }

      // Add specialized-specific fields
      if (module.type === 'specialized') {
        moduleWithActions.component = module.component;
      }

      result.push(moduleWithActions);
    }

    // Sort by nav order
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
