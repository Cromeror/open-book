import { SetMetadata, applyDecorators } from '@nestjs/common';

export const PERMISSION_KEY = 'required_permission';
export const PERMISSIONS_OPTIONS_KEY = 'permission_options';

/**
 * Options for the RequirePermission decorator
 */
export interface PermissionOptions {
  /**
   * If true, the guard will mark the request for ownership verification
   * The service should then verify that the resource belongs to the user
   * when the permission scope is OWN
   */
  checkOwnership?: boolean;
}

/**
 * Decorator to require a specific permission for an endpoint
 *
 * The permission string format is: "module:action"
 * Examples:
 * - "goals:create" - Create goals
 * - "contributions:read" - Read contributions
 * - "pqr:manage" - Manage PQR
 *
 * @param permission - Permission string in format "module:action"
 * @param options - Optional permission options
 *
 * @example
 * ```typescript
 * @Controller('goals')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * export class GoalsController {
 *   @Post()
 *   @RequirePermission('goals:create')
 *   create(@Body() dto: CreateGoalDto) {
 *     return this.service.create(dto);
 *   }
 *
 *   @Get(':id')
 *   @RequirePermission('goals:read', { checkOwnership: true })
 *   findOne(@Param('id') id: string) {
 *     return this.service.findOne(id);
 *   }
 * }
 * ```
 */
export function RequirePermission(
  permission: string,
  options?: PermissionOptions,
) {
  const decorators = [SetMetadata(PERMISSION_KEY, permission)];

  if (options) {
    decorators.push(SetMetadata(PERMISSIONS_OPTIONS_KEY, options));
  }

  return applyDecorators(...decorators);
}
