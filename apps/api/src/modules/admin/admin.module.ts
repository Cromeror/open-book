import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from './users';
import { CondominiumsModule } from './condominiums';

/**
 * Admin Module
 *
 * Groups all admin-related modules under the /admin prefix using RouterModule.
 *
 * Usage:
 * 1. Import your module in this file
 * 2. Add it to the `imports` array
 * 3. Add it to the RouterModule.register children array
 *
 * Example:
 * If UsersModule has @Controller('users'), it will be available at /admin/users
 *
 * @example
 * ```typescript
 * imports: [
 *   UsersModule,
 *   PermissionsModule,
 *   RouterModule.register([
 *     {
 *       path: 'admin',
 *       children: [
 *         { path: 'users', module: UsersModule },
 *         { path: 'permissions', module: PermissionsModule },
 *       ],
 *     },
 *   ]),
 * ],
 * ```
 */
@Module({
  imports: [
    UsersModule,
    CondominiumsModule,

    // Router configuration for /admin prefix
    RouterModule.register([
      {
        path: 'admin',
        children: [
          { path: 'users', module: UsersModule },
          { path: 'condominiums', module: CondominiumsModule },
        ],
      },
    ]),
  ],
})
export class AdminModule {}
