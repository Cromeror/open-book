import { Module as NestModule, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Module,
  ModulePermission,
  ModuleResource,
  UserPermission,
  UserPool,
  UserPoolMember,
  PoolPermission,
  UserResourceAccess,
  PoolResourceAccess,
  Resource,
  ResourceHttpMethod,
} from '../../entities';
import { User } from '../../entities/user.entity';
import { ExternalUser } from '../../entities/external-user.entity';
import { ExternalPoolMember } from '../../entities/external-pool-member.entity';
import { Organization } from '../../entities/organization.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsCacheService } from './permissions-cache.service';
import { AdminPermissionsService } from './admin-permissions.service';
import { PoolsService } from './pools.service';
import { AdminPermissionsController } from './admin-permissions.controller';
import { PoolsController } from './pools.controller';
import { SuperAdminGuard } from './guards/superadmin.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { SessionContextModule } from '../session-context/session-context.module';

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
    SessionContextModule,
    TypeOrmModule.forFeature([
      Module,
      ModulePermission,
      ModuleResource,
      UserPermission,
      UserPool,
      UserPoolMember,
      PoolPermission,
      UserResourceAccess,
      PoolResourceAccess,
      User,
      ExternalUser,
      ExternalPoolMember,
      Organization,
      Resource,
      ResourceHttpMethod,
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
