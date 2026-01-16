import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Property } from '../../entities/property.entity';
import { Condominium } from '../../entities/condominium.entity';
import { Group } from '../../entities/group.entity';
import { CondominiumManager } from '../../entities/condominium-manager.entity';
import { PropertyResident } from '../../entities/property-resident.entity';

import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';

/**
 * Properties module for property (leaf node) management within condominiums
 *
 * Provides:
 * - Property CRUD operations
 * - Movement between groups
 * - Limit validation against condominium settings
 * - Statistics and counts
 *
 * Endpoints at /api/properties
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      Condominium,
      Group,
      CondominiumManager,
      PropertyResident,
    ]),
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
