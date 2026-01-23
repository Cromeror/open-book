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
      order: { code: 'ASC' },
    });
  }

  /**
   * Find a resource by code (only if active)
   */
  async findByCode(code: string): Promise<Resource | null> {
    return this.resourceRepository.findOne({
      where: { code, isActive: true, deletedAt: undefined },
    });
  }
}
