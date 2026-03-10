import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization } from '../../../entities/organization.entity';
import { AdminOrganizationsController } from './organizations.controller';
import { AdminOrganizationsService } from './organizations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [AdminOrganizationsController],
  providers: [AdminOrganizationsService],
  exports: [AdminOrganizationsService],
})
export class AdminOrganizationsModule {}
