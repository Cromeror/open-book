import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';

import { Condominium } from '../../../entities/condominium.entity';

/**
 * Query options for listing condominiums
 */
export interface FindCondominiumsOptions {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  orderBy?: 'name' | 'city' | 'createdAt';
  order?: 'asc' | 'desc';
}

/**
 * DTO for creating a condominium
 */
export interface CreateCondominiumDto {
  name: string;
  nit?: string;
  address: string;
  city: string;
}

/**
 * DTO for updating a condominium
 */
export interface UpdateCondominiumDto {
  name?: string;
  nit?: string | null;
  address?: string;
  city?: string;
  isActive?: boolean;
}

/**
 * Service for managing condominiums (SuperAdmin only)
 *
 * Provides CRUD operations for condominium management.
 */
@Injectable()
export class CondominiumsService {
  constructor(
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
  ) {}

  /**
   * Find all condominiums with pagination and filters
   */
  async findAll(options: FindCondominiumsOptions = {}) {
    const {
      search,
      isActive,
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      order = 'desc',
    } = options;

    const queryBuilder = this.condominiumRepository
      .createQueryBuilder('c')
      .where('c.deletedAt IS NULL');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(c.name ILIKE :search OR c.city ILIKE :search OR c.nit ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply active filter
    if (isActive !== undefined) {
      queryBuilder.andWhere('c.isActive = :isActive', { isActive });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply sorting
    const sortColumn = `c.${orderBy}`;
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
   * Find a condominium by ID
   */
  async findById(id: string): Promise<Condominium | null> {
    return this.condominiumRepository.findOne({
      where: { id, deletedAt: undefined },
    });
  }

  /**
   * Find a condominium by ID with relations (groups, properties)
   */
  async findByIdWithRelations(id: string): Promise<Condominium | null> {
    return this.condominiumRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['groups', 'properties'],
    });
  }

  /**
   * Create a new condominium (SuperAdmin only)
   */
  async create(dto: CreateCondominiumDto): Promise<Condominium> {
    const condominium = this.condominiumRepository.create({
      name: dto.name,
      nit: dto.nit,
      address: dto.address,
      city: dto.city,
      unitCount: 0, // Deprecated field, kept for compatibility
      isActive: true,
    });

    return this.condominiumRepository.save(condominium);
  }

  /**
   * Update a condominium (SuperAdmin only)
   */
  async update(
    id: string,
    dto: UpdateCondominiumDto,
  ): Promise<Condominium | null> {
    const condominium = await this.findById(id);
    if (!condominium) {
      return null;
    }

    // Update only provided fields
    if (dto.name !== undefined) condominium.name = dto.name;
    if (dto.nit !== undefined) condominium.nit = dto.nit ?? undefined;
    if (dto.address !== undefined) condominium.address = dto.address;
    if (dto.city !== undefined) condominium.city = dto.city;
    if (dto.isActive !== undefined) condominium.isActive = dto.isActive;

    return this.condominiumRepository.save(condominium);
  }

  /**
   * Soft delete a condominium (SuperAdmin only)
   */
  async delete(id: string): Promise<boolean> {
    const condominium = await this.findById(id);
    if (!condominium) {
      return false;
    }

    condominium.deletedAt = new Date();
    await this.condominiumRepository.save(condominium);
    return true;
  }

  /**
   * Check if a condominium exists by NIT
   */
  async existsByNit(nit: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.condominiumRepository
      .createQueryBuilder('c')
      .where('c.nit = :nit', { nit })
      .andWhere('c.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('c.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }
}
