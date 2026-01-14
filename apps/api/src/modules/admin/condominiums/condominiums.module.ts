import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Condominium } from '../../../entities/condominium.entity';
import { CondominiumManager } from '../../../entities/condominium-manager.entity';
import { User } from '../../../entities/user.entity';

import { CondominiumsController } from './condominiums.controller';
import { CondominiumsService } from './condominiums.service';
import { CondominiumManagersController } from './condominium-managers.controller';
import { CondominiumManagersService } from './condominium-managers.service';

/**
 * Condominiums module for condominium management (SuperAdmin only)
 *
 * Provides:
 * - Condominium CRUD operations
 * - Manager assignment and listing
 * - Hierarchy limits configuration
 * - Admin endpoints (GET /api/admin/condominiums)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Condominium, CondominiumManager, User])],
  controllers: [CondominiumsController, CondominiumManagersController],
  providers: [CondominiumsService, CondominiumManagersService],
  exports: [CondominiumsService, CondominiumManagersService],
})
export class CondominiumsModule {}
