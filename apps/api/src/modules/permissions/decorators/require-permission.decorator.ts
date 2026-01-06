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
 * - "objetivos:create" - Create objectives
 * - "aportes:read" - Read contributions
 * - "pqr:manage" - Manage PQR
 *
 * @param permission - Permission string in format "module:action"
 * @param options - Optional permission options
 *
 * @example
 * ```typescript
 * @Controller('objetivos')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * export class ObjetivosController {
 *   @Post()
 *   @RequirePermission('objetivos:create')
 *   create(@Body() dto: CreateObjetivoDto) {
 *     return this.service.create(dto);
 *   }
 *
 *   @Get(':id')
 *   @RequirePermission('objetivos:read', { checkOwnership: true })
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
