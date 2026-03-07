import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Resource } from '../../entities/resource.entity';

/**
 * Read-only service for resources
 *
 * Used by gRPC controller to provide resource configuration to the proxy.
 * Does not include mutation operations - those are in AdminResourcesService.
 */
@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  /**
   * Find all active resources
   */
  async findAllActive(): Promise<Resource[]> {
    return this.resourceRepository.find({
      where: { isActive: true, deletedAt: undefined },
      relations: { httpMethods: { httpMethod: true } },
      order: { code: 'ASC' },
    });
  }

  /**
   * Find a resource by code (only if active)
   */
  async findByCode(code: string): Promise<Resource | null> {
    return this.resourceRepository.findOne({
      where: { code, isActive: true, deletedAt: undefined },
      relations: { httpMethods: { httpMethod: true } },
    });
  }

  /**
   * Find a resource by UUID (only if active)
   */
  async findById(id: string): Promise<Resource | null> {
    return this.resourceRepository.findOne({
      where: { id, isActive: true, deletedAt: undefined },
      relations: { httpMethods: { httpMethod: true } },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        templateUrl: true,
        isActive: true,
        httpMethods: {
          id: true,
          resourceId: true,
          payloadMetadata: true,
          responseMetadata: true,
          isActive: true,
          httpMethod: {
            id: true,
            method: true,
            description: true,
          },
        },
      },
    });
  }
}
