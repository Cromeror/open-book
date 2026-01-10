// Module
export { PermissionsModule } from './permissions.module';

// Services
export { PermissionsService } from './permissions.service';
export { PermissionsCacheService } from './permissions-cache.service';
export { AdminPermissionsService } from './admin-permissions.service';
export { PoolsService } from './pools.service';

// Guards
export { SuperAdminGuard } from './guards/superadmin.guard';
export { PermissionsGuard } from './guards/permissions.guard';

// Decorators
export {
  RequirePermission,
  PERMISSION_KEY,
  PERMISSIONS_OPTIONS_KEY,
  PermissionOptions,
} from './decorators/require-permission.decorator';
export { RequireModule, MODULE_KEY } from './decorators/require-module.decorator';
export { CurrentUser } from './decorators/current-user.decorator';

// Entities
export {
  Module,
  ModulePermission,
  UserModule,
  UserPermission,
  UserPool,
  UserPoolMember,
  PoolModule,
  PoolPermission,
} from '../../entities';

// Enums and types
export { Action, Scope, Permission, PermissionContext } from '../../types/permissions.enum';
export { SYSTEM_MODULES, ModuleDefinition } from './module-registry';

// DTOs
export {
  CreatePoolDto,
  validateCreatePoolDto,
  AddPoolMemberDto,
  validateAddPoolMemberDto,
  GrantModuleAccessDto,
  validateGrantModuleAccessDto,
  GrantPermissionDto,
  validateGrantPermissionDto,
  GrantPoolModuleDto,
  validateGrantPoolModuleDto,
  GrantPoolPermissionDto,
  validateGrantPoolPermissionDto,
} from './dto';
