import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Property, PropertyType } from '../../entities/property.entity';
import { Condominium } from '../../entities/condominium.entity';
import { Group } from '../../entities/group.entity';

/**
 * Query options for listing properties
 */
export interface FindPropertiesOptions {
  condominiumId: string;
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
 * DTO for creating a property
 */
export interface CreatePropertyDto {
  identifier: string;
  type?: PropertyType;
  description?: string;
  floor?: number;
  area?: number;
  condominiumId: string;
  groupId?: string | null;
  displayOrder?: number;
}

/**
 * DTO for updating a property
 */
export interface UpdatePropertyDto {
  identifier?: string;
  type?: PropertyType;
  description?: string | null;
  floor?: number | null;
  area?: number | null;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * Service for managing properties within condominiums
 *
 * Properties are leaf nodes in the hierarchy - they cannot contain
 * other groups or properties. They belong to a condominium and
 * optionally to a group.
 */
@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  /**
   * Find all properties with filters and pagination
   */
  async findAll(options: FindPropertiesOptions) {
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
      .where('p.condominiumId = :condominiumId', { condominiumId })
      .andWhere('p.deletedAt IS NULL');

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
   * Find a property by ID
   */
  async findById(id: string): Promise<Property | null> {
    return this.propertyRepository.findOne({
      where: { id, deletedAt: undefined },
    });
  }

  /**
   * Find a property by ID with relations
   */
  async findByIdWithRelations(id: string): Promise<Property | null> {
    return this.propertyRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['group', 'residents'],
    });
  }

  /**
   * Find properties by group ID
   */
  async findByGroupId(groupId: string): Promise<Property[]> {
    return this.propertyRepository.find({
      where: { groupId, deletedAt: undefined },
      order: { displayOrder: 'ASC', identifier: 'ASC' },
    });
  }

  /**
   * Find properties directly under condominium (no group)
   */
  async findWithoutGroup(condominiumId: string): Promise<Property[]> {
    return this.propertyRepository.find({
      where: {
        condominiumId,
        groupId: IsNull(),
        deletedAt: undefined,
      },
      order: { displayOrder: 'ASC', identifier: 'ASC' },
    });
  }

  /**
   * Create a new property
   */
  async create(dto: CreatePropertyDto): Promise<Property> {
    // Validate condominium exists
    const condominium = await this.condominiumRepository.findOne({
      where: { id: dto.condominiumId, deletedAt: undefined },
    });
    if (!condominium) {
      throw new NotFoundException(
        `Condominium with ID ${dto.condominiumId} not found`,
      );
    }

    // Validate group if provided
    if (dto.groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: dto.groupId, deletedAt: undefined },
      });
      if (!group) {
        throw new NotFoundException(
          `Group with ID ${dto.groupId} not found`,
        );
      }
      if (group.condominiumId !== dto.condominiumId) {
        throw new BadRequestException(
          'Group must belong to the same condominium',
        );
      }
    }

    // Check for duplicate identifier within condominium
    const existing = await this.propertyRepository.findOne({
      where: {
        condominiumId: dto.condominiumId,
        identifier: dto.identifier,
        deletedAt: undefined,
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Property with identifier '${dto.identifier}' already exists in this condominium`,
      );
    }

    const property = this.propertyRepository.create({
      identifier: dto.identifier,
      type: dto.type ?? PropertyType.APARTMENT,
      description: dto.description,
      floor: dto.floor,
      area: dto.area,
      condominiumId: dto.condominiumId,
      groupId: dto.groupId ?? null,
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    });

    return this.propertyRepository.save(property);
  }

  /**
   * Update a property
   */
  async update(id: string, dto: UpdatePropertyDto): Promise<Property | null> {
    const property = await this.findById(id);
    if (!property) {
      return null;
    }

    // Check for duplicate identifier if updating
    if (dto.identifier && dto.identifier !== property.identifier) {
      const existing = await this.propertyRepository.findOne({
        where: {
          condominiumId: property.condominiumId,
          identifier: dto.identifier,
          deletedAt: undefined,
        },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Property with identifier '${dto.identifier}' already exists in this condominium`,
        );
      }
    }

    if (dto.identifier !== undefined) property.identifier = dto.identifier;
    if (dto.type !== undefined) property.type = dto.type;
    if (dto.description !== undefined) property.description = dto.description ?? undefined;
    if (dto.floor !== undefined) property.floor = dto.floor ?? undefined;
    if (dto.area !== undefined) property.area = dto.area ?? undefined;
    if (dto.displayOrder !== undefined) property.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) property.isActive = dto.isActive;

    return this.propertyRepository.save(property);
  }

  /**
   * Move a property to a different group
   */
  async move(id: string, groupId: string | null): Promise<Property | null> {
    const property = await this.findById(id);
    if (!property) {
      return null;
    }

    // Validate new group if provided
    if (groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: groupId, deletedAt: undefined },
      });
      if (!group) {
        throw new NotFoundException(
          `Group with ID ${groupId} not found`,
        );
      }
      if (group.condominiumId !== property.condominiumId) {
        throw new BadRequestException(
          'Cannot move property to a group in a different condominium',
        );
      }
    }

    property.groupId = groupId;
    return this.propertyRepository.save(property);
  }

  /**
   * Soft delete a property
   *
   * Note: This will fail if the property has active residents
   */
  async delete(id: string): Promise<boolean> {
    const property = await this.findByIdWithRelations(id);
    if (!property) {
      return false;
    }

    // Check for active residents
    const activeResidentsCount = await this.propertyRepository
      .createQueryBuilder('p')
      .leftJoin(
        'property_residents',
        'pr',
        "pr.property_id = p.id AND pr.status = 'ACTIVE' AND pr.deleted_at IS NULL",
      )
      .where('p.id = :id', { id })
      .select('COUNT(pr.id)', 'count')
      .getRawOne();

    if (activeResidentsCount && parseInt(activeResidentsCount.count) > 0) {
      throw new BadRequestException(
        'Cannot delete property with active residents. Deactivate residents first.',
      );
    }

    property.deletedAt = new Date();
    await this.propertyRepository.save(property);
    return true;
  }

  /**
   * Get property count by type for a condominium
   */
  async getCountByType(
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
  async getTotalCount(condominiumId: string): Promise<number> {
    return this.propertyRepository.count({
      where: { condominiumId, deletedAt: undefined },
    });
  }
}
