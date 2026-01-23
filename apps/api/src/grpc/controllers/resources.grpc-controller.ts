import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { ResourcesService } from '../../modules/resources/resources.service';
import { GrpcExceptionFilter } from '../filters/grpc-exception.filter';
import { Resource } from '../../entities/resource.entity';

/**
 * gRPC Controller for Resources
 *
 * Implements the ResourceService proto definition.
 * Provides read-only access to resource configuration.
 * No authentication required - resources are public configuration.
 */
@Controller()
@UseFilters(GrpcExceptionFilter)
export class ResourcesGrpcController {
  constructor(private readonly resourcesService: ResourcesService) {}

  /**
   * Get all active resources
   */
  @GrpcMethod('ResourceService', 'GetResources')
  async getResources() {
    const resources = await this.resourcesService.findAllActive();

    return {
      resources: resources.map((r) => this.toProtoResource(r)),
    };
  }

  /**
   * Get a specific resource by code
   */
  @GrpcMethod('ResourceService', 'GetResource')
  async getResource(request: { code: string }) {
    const resource = await this.resourcesService.findByCode(request.code);

    return {
      resource: resource ? this.toProtoResource(resource) : null,
    };
  }

  /**
   * Convert entity to proto format
   */
  private toProtoResource(resource: Resource) {
    return {
      code: resource.code,
      name: resource.name,
      scope: resource.scope,
      base_url: resource.baseUrl,
      capabilities: resource.capabilities.map((capability) => ({
        name: capability.name,
        method: capability.method,
        url_pattern: capability.urlPattern,
        permission: capability.permission || '',
      })),
    };
  }
}
