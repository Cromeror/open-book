import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Group } from '../../entities/group.entity';
import { Condominium } from '../../entities/condominium.entity';

import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

/**
 * Groups module for hierarchical group management within condominiums
 *
 * Provides:
 * - Group CRUD operations
 * - Hierarchy navigation (tree, ancestors, descendants)
 * - Movement between parents
 * - Limit validation against condominium settings
 *
 * Endpoints at /api/groups
 */
@Module({
  imports: [TypeOrmModule.forFeature([Group, Condominium])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
