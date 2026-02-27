import { Module as NestModule, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Module,
  ModulePermission,
  UserPermission,
  UserPool,
  UserPoolMember,
  PoolPermission,
} from '../../entities';
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
 * Provides the permission system with:
 * - Module access inferred from permissions
 * - Granular permissions per module action
 * - User pools for shared permissions
 * - Permission caching
 * - SuperAdmin bypass
 */
@Global()
@NestModule({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Module,
      ModulePermission,
      UserPermission,
      UserPool,
      UserPoolMember,
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
