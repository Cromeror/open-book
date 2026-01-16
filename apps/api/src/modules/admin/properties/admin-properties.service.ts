import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Property, PropertyType } from '../../../entities/property.entity';

/**
 * Query options for admin listing properties
 */
export interface AdminFindPropertiesOptions {
  condominiumId?: string;
  groupId?: string | null;
  type?: PropertyType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'identifier' | 'type' | 'createdAt' | 'displayOrder';
  order?: 'asc' | 'desc';
}

/**
 * Admin service for properties (SuperAdmin only)
 *
 * Provides unrestricted access to all properties.
 * Use this service for admin panel operations.
 */
@Injectable()
export class AdminPropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  /**
   * Find all properties without access restrictions
   */
  async findAll(options: AdminFindPropertiesOptions) {
    const {
      condominiumId,
      groupId,
      type,
      isActive,
      search,
      page = 1,
      limit = 50,
      orderBy = 'displayOrder',
      order = 'asc',
    } = options;

    const queryBuilder = this.propertyRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.condominium', 'condominium')
      .where('p.deletedAt IS NULL');

    // Filter by condominium
    if (condominiumId) {
      queryBuilder.andWhere('p.condominiumId = :condominiumId', { condominiumId });
    }

    // Filter by group (null for properties directly under condominium)
    if (groupId === null) {
      queryBuilder.andWhere('p.groupId IS NULL');
    } else if (groupId !== undefined) {
      queryBuilder.andWhere('p.groupId = :groupId', { groupId });
    }

    // Filter by type
    if (type) {
      queryBuilder.andWhere('p.type = :type', { type });
    }

    // Filter by active status
    if (isActive !== undefined) {
      queryBuilder.andWhere('p.isActive = :isActive', { isActive });
    }

    // Search by identifier
    if (search) {
      queryBuilder.andWhere('p.identifier ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply sorting
    const sortColumn = `p.${orderBy}`;
    queryBuilder.orderBy(sortColumn, order.toUpperCase() as 'ASC' | 'DESC');
    if (orderBy !== 'identifier') {
      queryBuilder.addOrderBy('p.identifier', 'ASC');
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const data = await queryBuilder.getMany();

    // Include condominium info
    const sanitizedData = data.map((p) => ({
      ...p,
      condominium: p.condominium
        ? {
            id: p.condominium.id,
            name: p.condominium.name,
          }
        : undefined,
    }));

    return {
      data: sanitizedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find a property by ID (no access restrictions)
   */
  async findById(id: string): Promise<Property | null> {
    return this.propertyRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['condominium', 'group', 'residents'],
    });
  }

  /**
   * Get property statistics for a condominium
   */
  async getStats(condominiumId: string) {
    const [countByType, total] = await Promise.all([
      this.getCountByType(condominiumId),
      this.getTotalCount(condominiumId),
    ]);

    return {
      total,
      byType: countByType,
    };
  }

  /**
   * Get property count by type for a condominium
   */
  private async getCountByType(
    condominiumId: string,
  ): Promise<{ type: PropertyType; count: number }[]> {
    const result = await this.propertyRepository
      .createQueryBuilder('p')
      .select('p.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('p.condominiumId = :condominiumId', { condominiumId })
      .andWhere('p.deletedAt IS NULL')
      .groupBy('p.type')
      .getRawMany();

    return result.map((r) => ({
      type: r.type as PropertyType,
      count: parseInt(r.count),
    }));
  }

  /**
   * Get total property count for a condominium
   */
  private async getTotalCount(condominiumId: string): Promise<number> {
    return this.propertyRepository.count({
      where: { condominiumId, deletedAt: undefined },
    });
  }
}
