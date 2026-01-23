import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Resource } from '../../../entities/resource.entity';
import {
  CreateResourceDto,
  UpdateResourceDto,
  FindResourcesOptions,
} from '../../../types/resource.types';

/**
 * Service for managing resources (SuperAdmin only)
 *
 * Provides CRUD operations for HATEOAS resource configuration.
 */
@Injectable()
export class AdminResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  /**
   * Find all resources with pagination and filters
   */
  async findAll(options: FindResourcesOptions = {}) {
    const {
      search,
      scope,
      isActive,
      page = 1,
      limit = 50,
      orderBy = 'code',
      order = 'asc',
    } = options;

    const queryBuilder = this.resourceRepository
      .createQueryBuilder('r')
      .where('r.deletedAt IS NULL');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(r.code ILIKE :search OR r.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply scope filter
    if (scope) {
      queryBuilder.andWhere('r.scope = :scope', { scope });
    }

    // Apply active filter
    if (isActive !== undefined) {
      queryBuilder.andWhere('r.isActive = :isActive', { isActive });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply sorting
    const sortColumn = `r.${orderBy}`;
    queryBuilder.orderBy(sortColumn, order.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a resource by code
   */
  async findByCode(code: string): Promise<Resource | null> {
    return this.resourceRepository.findOne({
      where: { code, deletedAt: undefined },
    });
  }

  /**
   * Find a resource by ID
   */
  async findById(id: string): Promise<Resource | null> {
    return this.resourceRepository.findOne({
      where: { id, deletedAt: undefined },
    });
  }

  /**
   * Create a new resource
   */
  async create(dto: CreateResourceDto): Promise<Resource> {
    const resource = this.resourceRepository.create({
      code: dto.code,
      name: dto.name,
      scope: dto.scope,
      baseUrl: dto.baseUrl,
      capabilities: dto.capabilities,
      isActive: true,
    });

    return this.resourceRepository.save(resource);
  }

  /**
   * Update a resource by code
   */
  async updateByCode(
    code: string,
    dto: UpdateResourceDto,
  ): Promise<Resource | null> {
    const resource = await this.findByCode(code);
    if (!resource) {
      return null;
    }

    if (dto.name !== undefined) resource.name = dto.name;
    if (dto.scope !== undefined) resource.scope = dto.scope;
    if (dto.baseUrl !== undefined) resource.baseUrl = dto.baseUrl;
    if (dto.capabilities !== undefined) resource.capabilities = dto.capabilities;
    if (dto.isActive !== undefined) resource.isActive = dto.isActive;

    return this.resourceRepository.save(resource);
  }

  /**
   * Soft delete a resource by code
   */
  async deleteByCode(code: string): Promise<boolean> {
    const resource = await this.findByCode(code);
    if (!resource) {
      return false;
    }

    resource.deletedAt = new Date();
    await this.resourceRepository.save(resource);
    return true;
  }

  /**
   * Check if a resource exists by code
   */
  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.resourceRepository
      .createQueryBuilder('r')
      .where('r.code = :code', { code })
      .andWhere('r.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('r.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * Toggle resource active status
   */
  async toggleByCode(code: string): Promise<Resource | null> {
    const resource = await this.findByCode(code);
    if (!resource) {
      return null;
    }

    resource.isActive = !resource.isActive;
    return this.resourceRepository.save(resource);
  }
}
