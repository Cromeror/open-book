import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Resource } from '../../../entities/resource.entity';
import { HttpMethod } from '../../../entities/http-method.entity';
import { ResourceHttpMethod } from '../../../entities/resource-http-method.entity';

import { AdminResourcesController } from './resources.controller';
import { AdminResourcesService } from './resources.service';

/**
 * Admin Resources module for HATEOAS resource configuration (SuperAdmin only)
 *
 * Provides:
 * - Resource CRUD operations
 * - Action configuration for HATEOAS links
 * - Admin endpoints (GET /api/admin/resources)
 */
@Module({
  imports: [TypeOrmModule.forFeature([Resource, HttpMethod, ResourceHttpMethod])],
  controllers: [AdminResourcesController],
  providers: [AdminResourcesService],
  exports: [AdminResourcesService],
})
export class AdminResourcesModule {}
