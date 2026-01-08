import { SetMetadata } from '@nestjs/common';

export const MODULE_KEY = 'required_module';

/**
 * Decorator to require access to a module for an endpoint
 *
 * This decorator checks if the user has access to the specified module,
 * but does not check for specific granular permissions.
 *
 * Use this when you want to restrict access to users who have any
 * permission in a module, without requiring a specific action.
 *
 * @param moduleCode - Module code (e.g., 'goals', 'contributions')
 *
 * @example
 * ```typescript
 * @Controller('goals')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * export class GoalsController {
 *   @Get()
 *   @RequireModule('goals')
 *   findAll() {
 *     // Any user with access to the 'goals' module can access this
 *     return this.service.findAll();
 *   }
 *
 *   @Post()
 *   @RequirePermission('goals:create')
 *   create(@Body() dto: CreateGoalDto) {
 *     // Only users with specific 'create' permission can access this
 *     return this.service.create(dto);
 *   }
 * }
 * ```
 */
export function RequireModule(moduleCode: string) {
  return SetMetadata(MODULE_KEY, moduleCode);
}
