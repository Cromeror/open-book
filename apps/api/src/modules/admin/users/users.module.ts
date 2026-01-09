import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../../entities/user.entity';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * Users module for user management
 *
 * Provides:
 * - User CRUD operations
 * - Admin endpoints for SuperAdmin (GET /api/admin/users)
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
