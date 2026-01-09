import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { UsersModule } from './users';

// TODO: Import the modules you want to group under /admin
// import { UsersModule } from '../users';
// import { PermissionsModule } from '../permissions';

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
    // ========================================
    // ADD YOUR ADMIN MODULES HERE
    // ========================================
    // UsersModule,
    // PermissionsModule,

    // ========================================
    // ROUTER CONFIGURATION
    // ========================================
    RouterModule.register([
      {
        path: 'admin',
        children: [
          // ========================================
          // ADD YOUR ROUTE MAPPINGS HERE
          // ========================================
          { path: 'users', module: UsersModule },
          // { path: 'permissions', module: PermissionsModule },
        ],
      },
    ]),
  ],
})
export class AdminModule {}
