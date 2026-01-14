import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../../entities/user.entity';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CondominiumsModule } from '../condominiums/condominiums.module';

/**
 * Users module for user management
 *
 * Provides:
 * - User CRUD operations
 * - Admin endpoints for SuperAdmin (GET /api/admin/users)
 * - User condominiums listing (GET /api/admin/users/:id/condominiums)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CondominiumsModule, // For CondominiumManagersService
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
