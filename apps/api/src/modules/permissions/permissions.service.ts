import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../entities/user.entity';
import {
  Module,
  UserPermission,
  UserPoolMember,
  PoolPermission,
  ModuleResource,
} from '../../entities';
import type {
  ModuleWithActionsResponse,
  ModuleResourceResponse,
  ModuleResourceWithActionsResponse,
  ModuleHttpMethodWithConfig,
  ModuleActionConfig,
} from '../../types/module-actions.types';
import { SessionContextService } from '../session-context/session-context.service';
import { resolveTemplateUrl, SESSION_PLACEHOLDER_RE, UNRESOLVED_PLACEHOLDER_RE } from '../../utils';

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
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
    @InjectRepository(UserPermission)
    private userPermissionRepo: Repository<UserPermission>,
    @InjectRepository(PoolPermission)
    private poolPermissionRepo: Repository<PoolPermission>,
    @InjectRepository(ModuleResource)
    private moduleResourceRepo: Repository<ModuleResource>,
    private sessionContextService: SessionContextService,
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

    const hasDirect = await this.hasDirectPermission(userId, moduleCode, action);
    if (hasDirect) {
      return true;
    }

    return this.hasPermissionViaPool(userId, moduleCode, action);
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
   * Get all modules with segregated actions for a user
   *
   * Returns modules the user has access to, with only the actions
   * they have permission for. Action code = Permission code.
   *
   * Uses 2 parallel queries (direct + pool permissions), each joining
   * modules to fetch all needed data in one pass. No additional queries needed.
   */
  async getModulesWithActionsForUser(userId: string): Promise<ModuleWithActionsResponse[]> {
    const isSuperAdmin = await this.isSuperAdmin(userId);

    if (isSuperAdmin) {
      return this.getAllModulesWithAllActions(userId);
    }

    const now = new Date();

    type PermissionRow = {
      moduleId: string;
      moduleCode: string;
      moduleName: string;
      moduleDescription: string | null;
      moduleIcon: string | null;
      moduleNavConfig: string | null;
      moduleOrder: number;
      moduleActionsConfig: string | null;
      permissionCode: string;
    };

    const [directRows, poolRows] = await Promise.all([
      this.userPermissionRepo
        .createQueryBuilder('up')
        .innerJoin('up.modulePermission', 'mp')
        .innerJoin('mp.module', 'm')
        .where('up.userId = :userId', { userId })
        .andWhere('up.isActive = true')
        .andWhere('m.isActive = true')
        .andWhere('(up.expiresAt IS NULL OR up.expiresAt > :now)', { now })
        .select('m.id', 'moduleId')
        .addSelect('m.code', 'moduleCode')
        .addSelect('m.name', 'moduleName')
        .addSelect('m.description', 'moduleDescription')
        .addSelect('m.icon', 'moduleIcon')
        .addSelect('m.nav_config', 'moduleNavConfig')
        .addSelect('m.order', 'moduleOrder')
        .addSelect('m.actions_config', 'moduleActionsConfig')
        .addSelect('mp.code', 'permissionCode')
        .getRawMany<PermissionRow>(),

      this.poolPermissionRepo
        .createQueryBuilder('pp')
        .innerJoin('pp.pool', 'p')
        .innerJoin(UserPoolMember, 'upm', 'upm.poolId = p.id')
        .innerJoin('pp.modulePermission', 'mp')
        .innerJoin('mp.module', 'm')
        .where('upm.userId = :userId', { userId })
        .andWhere('p.isActive = true')
        .andWhere('m.isActive = true')
        .select('m.id', 'moduleId')
        .addSelect('m.code', 'moduleCode')
        .addSelect('m.name', 'moduleName')
        .addSelect('m.description', 'moduleDescription')
        .addSelect('m.icon', 'moduleIcon')
        .addSelect('m.nav_config', 'moduleNavConfig')
        .addSelect('m.order', 'moduleOrder')
        .addSelect('m.actions_config', 'moduleActionsConfig')
        .addSelect('mp.code', 'permissionCode')
        .getRawMany<PermissionRow>(),
    ]);

    const moduleMap = new Map<string, { row: PermissionRow; permissionCodes: Set<string> }>();

    for (const row of [...directRows, ...poolRows]) {
      if (!moduleMap.has(row.moduleId)) {
        moduleMap.set(row.moduleId, { row, permissionCodes: new Set() });
      }
      moduleMap.get(row.moduleId)!.permissionCodes.add(row.permissionCode);
    }

    if (moduleMap.size === 0) {
      return [];
    }

    const sessionCtx: Record<string, unknown> = { ...await this.sessionContextService.getContext(userId) };
    const moduleIds = [...moduleMap.keys()];
    const resourcesByModule = await this.getResourcesForModules(moduleIds, sessionCtx);

    const result: ModuleWithActionsResponse[] = [];

    for (const { row, permissionCodes } of moduleMap.values()) {
      const actionsConfig = (row.moduleActionsConfig
        ? (typeof row.moduleActionsConfig === 'string'
            ? JSON.parse(row.moduleActionsConfig)
            : row.moduleActionsConfig)
        : []) as ModuleActionConfig[];

      // Only include actions the user has permission for (action.code matches module_permission.code)
      const allowedActions = actionsConfig.filter((action) => permissionCodes.has(action.code));

      const navConfig = row.moduleNavConfig
        ? (typeof row.moduleNavConfig === 'string'
            ? JSON.parse(row.moduleNavConfig)
            : row.moduleNavConfig)
        : null;

      const rawResources = resourcesByModule.get(row.moduleId) ?? [];

      result.push({
        code: row.moduleCode,
        label: row.moduleName,
        description: row.moduleDescription || '',
        icon: row.moduleIcon || 'FileText',
        nav: navConfig || { path: `/m/${row.moduleCode}`, order: row.moduleOrder },
        resources: this.buildResourcesWithActions(rawResources, allowedActions),
      });
    }

    result.sort((a, b) => a.nav.order - b.nav.order);

    return result;
  }

  /**
   * Load resources (with httpMethods) for a set of module IDs.
   * Returns a map of moduleId → ModuleResourceResponse[]
   *
   * templateUrl placeholders (e.g. {session:condominiumId}) are resolved
   * using the provided session context so the frontend receives ready-to-use URLs.
   */
  private async getResourcesForModules(
    moduleIds: string[],
    sessionCtx: Record<string, unknown>,
  ): Promise<Map<string, ModuleResourceResponse[]>> {
    const rows = await this.moduleResourceRepo
      .createQueryBuilder('mr')
      .innerJoinAndSelect('mr.resource', 'r')
      .innerJoinAndSelect('r.httpMethods', 'rhm')
      .innerJoinAndSelect('rhm.httpMethod', 'hm')
      .where('mr.moduleId IN (:...moduleIds)', { moduleIds })
      .andWhere('r.isActive = true')
      .getMany();

    const map = new Map<string, ModuleResourceResponse[]>();
    for (const mr of rows) {
      const resolvedUrl = resolveTemplateUrl(mr.resource.templateUrl, sessionCtx, SESSION_PLACEHOLDER_RE);

      // Skip resources with unresolved placeholders (e.g. {id}, {goalId}).
      // These are detail/action resources that the frontend will discover via HATEOAS _links.
      if (UNRESOLVED_PLACEHOLDER_RE.test(resolvedUrl)) continue;

      if (!map.has(mr.moduleId)) map.set(mr.moduleId, []);
      map.get(mr.moduleId)!.push({
        code: mr.resource.code,
        templateUrl: resolvedUrl,
        role: mr.role,
        httpMethods: mr.resource.httpMethods
          .filter((rhm) => rhm.isActive)
          .map((rhm) => ({ method: rhm.httpMethod.method, isActive: rhm.isActive })),
      });
    }
    return map;
  }

  /**
   * For each resource, return only the HTTP methods that have an actionsConfig entry
   * allowed for the user, each paired with its action config.
   */
  private buildResourcesWithActions(
    resources: ModuleResourceResponse[],
    actions: ModuleActionConfig[],
  ): ModuleResourceWithActionsResponse[] {
    const actionByMethod = new Map(actions.map((a) => [a.httpMethod, a]));

    return resources.map((resource) => {
      const httpMethods: ModuleHttpMethodWithConfig[] = resource.httpMethods
        .filter((hm) => hm.isActive && actionByMethod.has(hm.method))
        .map((hm) => ({ method: hm.method, action: actionByMethod.get(hm.method)! }));

      return { code: resource.code, templateUrl: resource.templateUrl, role: resource.role, httpMethods };
    });
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
   * Returns the set of HATEOAS `rel` values the user is allowed to see
   * for a given module, based on the `rels` field of their permissions.
   *
   * Returns null if no filtering should be applied (superAdmin or any
   * permission has null rels).
   * Returns empty Set if user has no permissions for the module.
   */
  async getUserAllowedRels(
    userId: string,
    moduleCode: string,
  ): Promise<Set<string> | null> {
    if (await this.isSuperAdmin(userId)) {
      return null;
    }

    type RelsRow = { rels: string | null };
    const now = new Date();

    const [directRows, poolRows] = await Promise.all([
      this.userPermissionRepo
        .createQueryBuilder('up')
        .innerJoin('up.modulePermission', 'mp')
        .innerJoin('mp.module', 'm')
        .where('up.userId = :userId', { userId })
        .andWhere('m.code = :moduleCode', { moduleCode })
        .andWhere('up.isActive = true')
        .andWhere('m.isActive = true')
        .andWhere('(up.expiresAt IS NULL OR up.expiresAt > :now)', { now })
        .select('mp.rels', 'rels')
        .getRawMany<RelsRow>(),

      this.poolPermissionRepo
        .createQueryBuilder('pp')
        .innerJoin('pp.pool', 'p')
        .innerJoin(UserPoolMember, 'upm', 'upm.poolId = p.id')
        .innerJoin('pp.modulePermission', 'mp')
        .innerJoin('mp.module', 'm')
        .where('upm.userId = :userId', { userId })
        .andWhere('m.code = :moduleCode', { moduleCode })
        .andWhere('p.isActive = true')
        .andWhere('m.isActive = true')
        .select('mp.rels', 'rels')
        .getRawMany<RelsRow>(),
    ]);

    const allRows = [...directRows, ...poolRows];

    if (allRows.length === 0) {
      return new Set();
    }

    // If any permission has null rels, it imposes no link restriction
    if (allRows.some((r) => r.rels === null)) {
      return null;
    }

    const allowed = new Set<string>();
    for (const row of allRows) {
      if (row.rels) {
        for (const rel of row.rels.split(',')) {
          allowed.add(rel.trim());
        }
      }
    }

    return allowed;
  }

  /**
   * Get all modules with all actions (for SuperAdmin)
   */
  private async getAllModulesWithAllActions(userId: string): Promise<ModuleWithActionsResponse[]> {
    const modules = await this.moduleRepo.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });

    if (modules.length === 0) return [];

    const sessionCtx: Record<string, unknown> = { ...await this.sessionContextService.getContext(userId) };
    
    const moduleIds = modules.map((m) => m.id);
    const resourcesByModule = await this.getResourcesForModules(moduleIds, sessionCtx);

    return modules.map((module) => {
      const allActions = (module.actionsConfig ?? []) as ModuleActionConfig[];
      const rawResources = resourcesByModule.get(module.id) ?? [];

      return {
        code: module.code,
        label: module.name,
        description: module.description || '',
        icon: module.icon || 'FileText',
        nav: module.navConfig || { path: `/m/${module.code}`, order: module.order },
        resources: this.buildResourcesWithActions(rawResources, allActions),
      };
    });
  }
}
