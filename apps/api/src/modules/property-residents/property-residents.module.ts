import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PropertyResident } from '../../entities/property-resident.entity';
import { Property } from '../../entities/property.entity';
import { User } from '../../entities/user.entity';
import { CondominiumManager } from '../../entities/condominium-manager.entity';

import { PropertyResidentsController } from './property-residents.controller';
import { PropertyResidentsService } from './property-residents.service';

/**
 * PropertyResidents module for managing user-property associations
 *
 * Provides:
 * - Association CRUD operations
 * - Approval/rejection workflow
 * - Primary contact management
 * - User's properties listing
 *
 * Access control:
 * - Administrators (condominium managers) can see all residents of properties in their condominium
 * - Residents can only see themselves
 *
 * Endpoints at /api/property-residents
 */
@Module({
  imports: [TypeOrmModule.forFeature([PropertyResident, Property, User, CondominiumManager])],
  controllers: [PropertyResidentsController],
  providers: [PropertyResidentsService],
  exports: [PropertyResidentsService],
})
export class PropertyResidentsModule {}
