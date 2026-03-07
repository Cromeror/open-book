import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Resource } from '../../entities/resource.entity';
import { HttpMethod } from '../../entities/http-method.entity';
import { ResourceHttpMethod } from '../../entities/resource-http-method.entity';

import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

/**
 * Resources module (read-only)
 *
 * Provides read-only access to resource configuration.
 * Used by gRPC controller and HTTP endpoint.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Resource, HttpMethod, ResourceHttpMethod])],
  controllers: [ResourcesController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
