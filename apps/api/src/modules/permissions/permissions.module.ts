import { Module as NestModule, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import {
  Module,
  ModulePermission,
  UserModule,
  UserPermission,
  UserPool,
  UserPoolMember,
  PoolModule,
  PoolPermission,
} from './entities';
import { User } from '../../entities/user.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsCacheService } from './permissions-cache.service';
import { AdminPermissionsService } from './admin-permissions.service';
import { PoolsService } from './pools.service';
import { AdminPermissionsController } from './admin-permissions.controller';
import { PoolsController } from './pools.controller';
import { SuperAdminGuard } from './guards/superadmin.guard';
import { PermissionsGuard } from './guards/permissions.guard';

/**
 * Permissions Module
 *
 * Provides the module-based permission system with:
 * - Module access control
 * - Granular permissions with scopes (OWN, COPROPIEDAD, ALL)
 * - User pools for shared permissions
 * - Permission caching
 * - SuperAdmin bypass
 *
 * @example
 * ```typescript
 * // In a controller, use decorators to protect endpoints
 * @RequireModule('objetivos')
 * @RequirePermission('objetivos:create', { scope: Scope.COPROPIEDAD })
 * @Post()
 * async create(@Body() dto: CreateObjetivoDto) { ... }
 * ```
 *
 * @example
 * ```typescript
 * // In a service, check permissions programmatically
 * if (await this.permissionsService.hasPermission(userId, 'objetivos:read', context)) {
 *   // User has access
 * }
 * ```
 */
@Global()
@NestModule({
  imports: [
    TypeOrmModule.forFeature([
      Module,
      ModulePermission,
      UserModule,
      UserPermission,
      UserPool,
      UserPoolMember,
      PoolModule,
      PoolPermission,
      User,
    ]),
  ],
  controllers: [AdminPermissionsController, PoolsController],
  providers: [
    PermissionsService,
    PermissionsCacheService,
    AdminPermissionsService,
    PoolsService,
    // Guards are exported but not globally applied
    // Apply them at controller/method level or register globally in AppModule
    SuperAdminGuard,
    PermissionsGuard,
  ],
  exports: [
    PermissionsService,
    PermissionsCacheService,
    SuperAdminGuard,
    PermissionsGuard,
    TypeOrmModule,
  ],
})
export class PermissionsModule {}
