import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Condominium } from '../../entities/condominium.entity';
import { CondominiumManager } from '../../entities/condominium-manager.entity';
import { CondominiumsController } from './condominiums.controller';
import { CondominiumsService } from './condominiums.service';

/**
 * Module for regular user condominium access
 *
 * Provides read-only access to condominiums assigned to users
 * via the condominium_managers table.
 *
 * Routes: /api/condominiums
 *
 * Key features:
 * - Users can only view condominiums they are assigned to
 * - Requires condominiumId in query params for security
 * - No create, update, or delete operations
 * - Separate from admin condominiums (/api/admin/condominiums)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Condominium, CondominiumManager]),
  ],
  controllers: [CondominiumsController],
  providers: [CondominiumsService],
  exports: [CondominiumsService],
})
export class CondominiumsModule {}
