import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Property } from '../../../entities/property.entity';
import { PermissionsModule } from '../../permissions';

import { AdminPropertiesController } from './admin-properties.controller';
import { AdminPropertiesService } from './admin-properties.service';

/**
 * Admin module for properties (SuperAdmin only)
 *
 * Provides unrestricted access to properties for administrative purposes.
 *
 * Endpoints at /admin/properties
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Property]),
    PermissionsModule,
  ],
  controllers: [AdminPropertiesController],
  providers: [AdminPropertiesService],
  exports: [AdminPropertiesService],
})
export class AdminPropertiesModule {}
