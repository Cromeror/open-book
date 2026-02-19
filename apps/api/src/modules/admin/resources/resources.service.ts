import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Resource } from '../../../entities/resource.entity';
import { HttpMethod } from '../../../entities/http-method.entity';
import { ResourceHttpMethod } from '../../../entities/resource-http-method.entity';
import {
  CreateResourceDto,
  UpdateResourceDto,
  AssignHttpMethodDto,
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
    @InjectRepository(HttpMethod)
    private readonly httpMethodRepository: Repository<HttpMethod>,
    @InjectRepository(ResourceHttpMethod)
    private readonly resourceHttpMethodRepository: Repository<ResourceHttpMethod>,
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
      .leftJoinAndSelect('r.httpMethods', 'rhm')
      .leftJoinAndSelect('rhm.httpMethod', 'hm')
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

    const mapped = data.map((resource) => ({
      ...resource,
      httpMethods: (resource.httpMethods ?? []).map((rhm) => ({
        method: rhm.httpMethod?.method,
        payloadMetadata: rhm.payloadMetadata,
        responseMetadata: rhm.responseMetadata,
        isActive: rhm.isActive,
      })),
    }));

    return {
      data: mapped,
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
      where: { code },
      relations: ['httpMethods', 'httpMethods.httpMethod'],
    });
  }

  /**
   * Find a resource by ID
   */
  async findById(id: string): Promise<Resource | null> {
    return this.resourceRepository.findOne({
      where: { id },
      relations: ['httpMethods', 'httpMethods.httpMethod'],
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
      templateUrl: dto.templateUrl,
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
    if (dto.templateUrl !== undefined) resource.templateUrl = dto.templateUrl;
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

  /**
   * Assign an HTTP method to a resource (upsert)
   *
   * If the method is already assigned, updates its metadata.
   * If not, creates a new association.
   */
  async assignHttpMethod(
    resourceId: string,
    dto: AssignHttpMethodDto,
  ): Promise<ResourceHttpMethod> {
    // Look up the HTTP method catalog entry
    const httpMethod = await this.httpMethodRepository.findOne({
      where: { method: dto.method },
    });
    if (!httpMethod) {
      throw new Error(`HTTP method '${dto.method}' not found in catalog`);
    }

    // Check if this association already exists
    let rhm = await this.resourceHttpMethodRepository.findOne({
      where: { resourceId, httpMethodId: httpMethod.id },
    });

    if (rhm) {
      // Update existing association
      rhm.payloadMetadata = dto.payloadMetadata
        ? JSON.parse(dto.payloadMetadata)
        : undefined;
      rhm.responseMetadata = dto.responseMetadata
        ? JSON.parse(dto.responseMetadata)
        : undefined;
      rhm.isActive = true;
    } else {
      // Create new association
      rhm = this.resourceHttpMethodRepository.create({
        resourceId,
        httpMethodId: httpMethod.id,
        payloadMetadata: dto.payloadMetadata
          ? JSON.parse(dto.payloadMetadata)
          : undefined,
        responseMetadata: dto.responseMetadata
          ? JSON.parse(dto.responseMetadata)
          : undefined,
        isActive: true,
      });
    }

    return this.resourceHttpMethodRepository.save(rhm);
  }

  /**
   * Remove an HTTP method from a resource
   *
   * Returns true if a row was deleted, false if not found.
   */
  async removeHttpMethod(
    resourceId: string,
    method: string,
  ): Promise<boolean> {
    const httpMethod = await this.httpMethodRepository.findOne({
      where: { method },
    });
    if (!httpMethod) {
      return false;
    }

    const result = await this.resourceHttpMethodRepository.delete({
      resourceId,
      httpMethodId: httpMethod.id,
    });

    return (result.affected ?? 0) > 0;
  }
}
