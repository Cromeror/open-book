import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Resource } from '../../entities/resource.entity';
import { HttpMethod } from '../../entities/http-method.entity';
import { ResourceHttpMethod } from '../../entities/resource-http-method.entity';

import { ResourcesService } from './resources.service';

/**
 * Resources module (read-only)
 *
 * Provides read-only access to resource configuration.
 * Used by gRPC controller to serve resource data to the proxy.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Resource, HttpMethod, ResourceHttpMethod])],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule {}
