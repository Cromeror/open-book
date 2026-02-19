import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropertyResident } from '../../../entities/property-resident.entity';
import { Property } from '../../../entities/property.entity';
import { User } from '../../../entities/user.entity';
import { PermissionsModule } from '../../permissions';

import { AdminPropertyResidentsController } from './admin-property-residents.controller';
import { AdminPropertyResidentsService } from './admin-property-residents.service';

/**
 * Admin module for property residents (SuperAdmin only)
 *
 * Provides unrestricted access to property-resident associations
 * for administrative purposes.
 *
 * Endpoints at /admin/property-residents
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyResident, Property, User]),
    PermissionsModule,
  ],
  controllers: [AdminPropertyResidentsController],
  providers: [AdminPropertyResidentsService],
  exports: [AdminPropertyResidentsService],
})
export class AdminPropertyResidentsModule {}
