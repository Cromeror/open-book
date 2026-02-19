import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PropertyResident,
  AssociationStatus,
  RelationType,
} from '../../../entities/property-resident.entity';
import { Property } from '../../../entities/property.entity';
import { User } from '../../../entities/user.entity';

/**
 * Query options for admin listing property residents
 */
export interface AdminFindPropertyResidentsOptions {
  propertyId?: string;
  userId?: string;
  condominiumId?: string;
  status?: AssociationStatus;
  relationType?: RelationType;
  page?: number;
  limit?: number;
}

export interface AdminCreatePropertyResidentDto {
  propertyId: string;
  userId: string;
  relationType: RelationType;
  isPrimary?: boolean;
  assignedBy: string;
}

/**
 * Admin service for property residents (SuperAdmin only)
 *
 * Provides unrestricted access to all property-resident associations.
 * Use this service for admin panel operations.
 */
@Injectable()
export class AdminPropertyResidentsService {
  constructor(
    @InjectRepository(PropertyResident)
    private readonly propertyResidentRepository: Repository<PropertyResident>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find all property residents without access restrictions
   */
  async findAll(options: AdminFindPropertyResidentsOptions) {
    const {
      propertyId,
      userId,
      condominiumId,
      status,
      relationType,
      page = 1,
      limit = 50,
    } = options;

    const queryBuilder = this.propertyResidentRepository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.property', 'property')
      .leftJoinAndSelect('pr.user', 'user')
      .leftJoinAndSelect('property.condominium', 'condominium')
      .where('pr.deletedAt IS NULL');

    // Filter by property
    if (propertyId) {
      queryBuilder.andWhere('pr.propertyId = :propertyId', { propertyId });
    }

    // Filter by user
    if (userId) {
      queryBuilder.andWhere('pr.userId = :userId', { userId });
    }

    // Filter by condominium (through property)
    if (condominiumId) {
      queryBuilder.andWhere('property.condominiumId = :condominiumId', {
        condominiumId,
      });
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('pr.status = :status', { status });
    }

    // Filter by relation type
    if (relationType) {
      queryBuilder.andWhere('pr.relationType = :relationType', { relationType });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Order by primary flag (primary first), then by createdAt
    queryBuilder
      .orderBy('pr.isPrimary', 'DESC')
      .addOrderBy('pr.createdAt', 'DESC');

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    const data = await queryBuilder.getMany();

    // Remove sensitive user data but include more info for admin
    const sanitizedData = data.map((pr) => ({
      ...pr,
      user: pr.user
        ? {
            id: pr.user.id,
            email: pr.user.email,
            firstName: pr.user.firstName,
            lastName: pr.user.lastName,
          }
        : undefined,
      property: pr.property
        ? {
            id: pr.property.id,
            identifier: pr.property.identifier,
            type: pr.property.type,
            condominiumId: pr.property.condominiumId,
            condominium: pr.property.condominium
              ? {
                  id: pr.property.condominium.id,
                  name: pr.property.condominium.name,
                }
              : undefined,
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
   * Find all residents for a specific property (no access restrictions)
   */
  async findByPropertyId(
    propertyId: string,
    status?: AssociationStatus,
  ) {
    const queryBuilder = this.propertyResidentRepository
      .createQueryBuilder('pr')
      .leftJoinAndSelect('pr.user', 'user')
      .where('pr.propertyId = :propertyId', { propertyId })
      .andWhere('pr.deletedAt IS NULL');

    if (status) {
      queryBuilder.andWhere('pr.status = :status', { status });
    }

    queryBuilder
      .orderBy('pr.isPrimary', 'DESC')
      .addOrderBy('pr.createdAt', 'ASC');

    const data = await queryBuilder.getMany();

    return data.map((pr) => ({
      id: pr.id,
      user: pr.user
        ? {
            id: pr.user.id,
            email: pr.user.email,
            firstName: pr.user.firstName,
            lastName: pr.user.lastName,
          }
        : undefined,
      relationType: pr.relationType,
      status: pr.status,
      isPrimary: pr.isPrimary,
    }));
  }

  /**
   * Create a property-resident association with ACTIVE status (admin only)
   */
  async create(dto: AdminCreatePropertyResidentDto): Promise<PropertyResident> {
    const property = await this.propertyRepository.findOne({
      where: { id: dto.propertyId, deletedAt: undefined },
    });
    if (!property) {
      throw new NotFoundException(
        `La propiedad con ID ${dto.propertyId} no existe`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.userId, deletedAt: undefined },
    });
    if (!user) {
      throw new NotFoundException(
        `El usuario con ID ${dto.userId} no existe`,
      );
    }

    const existing = await this.propertyResidentRepository.findOne({
      where: [
        {
          propertyId: dto.propertyId,
          userId: dto.userId,
          status: AssociationStatus.ACTIVE,
          deletedAt: undefined,
        },
        {
          propertyId: dto.propertyId,
          userId: dto.userId,
          status: AssociationStatus.PENDING,
          deletedAt: undefined,
        },
      ],
    });
    if (existing) {
      throw new BadRequestException(
        'El usuario ya tiene una asociación activa o pendiente con esta propiedad',
      );
    }

    if (dto.isPrimary) {
      await this.propertyResidentRepository.update(
        { propertyId: dto.propertyId, isPrimary: true },
        { isPrimary: false },
      );
    }

    const propertyResident = this.propertyResidentRepository.create({
      propertyId: dto.propertyId,
      userId: dto.userId,
      relationType: dto.relationType,
      status: AssociationStatus.ACTIVE,
      isPrimary: dto.isPrimary ?? false,
      approvedBy: dto.assignedBy,
      approvedAt: new Date(),
      startDate: new Date(),
    });

    return this.propertyResidentRepository.save(propertyResident);
  }
}
