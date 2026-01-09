import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Condominium } from '../../../entities/condominium.entity';

import { CondominiumsController } from './condominiums.controller';
import { CondominiumsService } from './condominiums.service';

/**
 * Condominiums module for condominium management (SuperAdmin only)
 *
 * Provides:
 * - Condominium CRUD operations
 * - Hierarchy limits configuration
 * - Admin endpoints (GET /api/admin/condominiums)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Condominium])],
  controllers: [CondominiumsController],
  providers: [CondominiumsService],
  exports: [CondominiumsService],
})
export class CondominiumsModule {}
