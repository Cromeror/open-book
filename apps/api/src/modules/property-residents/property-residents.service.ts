import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  PropertyResident,
  RelationType,
  AssociationStatus,
} from '../../entities/property-resident.entity';
import { Property } from '../../entities/property.entity';
import { User } from '../../entities/user.entity';
import { CondominiumManager } from '../../entities/condominium-manager.entity';

/**
 * Query options for listing property residents
 */
export interface FindPropertyResidentsOptions {
  propertyId?: string;
  userId?: string;
  condominiumId?: string;
  status?: AssociationStatus;
  relationType?: RelationType;
  page?: number;
  limit?: number;
}

/**
 * DTO for creating a property resident association
 */
export interface CreatePropertyResidentDto {
  propertyId: string;
  userId: string;
  relationType: RelationType;
  startDate?: Date;
  endDate?: Date;
  isPrimary?: boolean;
}

/**
 * DTO for updating a property resident association
 */
export interface UpdatePropertyResidentDto {
  relationType?: RelationType;
  startDate?: Date;
  endDate?: Date;
  isPrimary?: boolean;
}

/**
 * DTO for approving/rejecting a property resident
 */
export interface ApproveRejectDto {
  approvedBy: string;
  rejectionReason?: string;
}

/**
 * Service for managing property-resident associations
 *
 * PropertyResident represents the many-to-many relationship between
 * users and properties with additional metadata (relation type, status, etc.)
 *
 * Access control:
 * - Administrators (condominium managers) can see all residents of properties in their condominium
 * - Residents can only see themselves
 */
@Injectable()
export class PropertyResidentsService {
  constructor(
    @InjectRepository(PropertyResident)
    private readonly propertyResidentRepository: Repository<PropertyResident>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CondominiumManager)
    private readonly condominiumManagerRepository: Repository<CondominiumManager>,
  ) {}

  /**
   * Check if user is a manager of the condominium that owns the property
   */
  private async isManagerOfPropertyCondominium(
    userId: string,
    propertyId: string,
  ): Promise<boolean> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId, deletedAt: undefined },
      select: ['condominiumId'],
    });

    if (!property) {
      return false;
    }

    const manager = await this.condominiumManagerRepository.findOne({
      where: {
        userId,
        condominiumId: property.condominiumId,
        isActive: true,
        deletedAt: undefined,
      },
    });

    return !!manager;
  }

  /**
   * Check if user is a resident of the property
   */
  private async isResidentOfProperty(
    userId: string,
    propertyId: string,
  ): Promise<boolean> {
    const resident = await this.propertyResidentRepository.findOne({
      where: {
        userId,
        propertyId,
        status: AssociationStatus.ACTIVE,
        deletedAt: undefined,
      },
    });

    return !!resident;
  }

  /**
   * Find all property resident associations with filters
   */
  async findAll(options: FindPropertyResidentsOptions) {
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

    // Remove sensitive user data
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
   * Find a property resident by ID
   */
  async findById(id: string): Promise<PropertyResident | null> {
    return this.propertyResidentRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['property', 'user'],
    });
  }

  /**
   * Find active residents for a property with access control
   *
   * Access rules:
   * - Administrators (condominium managers) see all residents
   * - Residents only see themselves
   *
   * @param propertyId - Property ID to query
   * @param requestingUserId - ID of the user making the request
   * @returns List of residents (filtered based on user's role)
   * @throws ForbiddenException if user has no access to view residents
   */
  async findActiveByPropertyId(
    propertyId: string,
    requestingUserId: string,
  ): Promise<PropertyResident[]> {
    // Check if user is a manager of the property's condominium
    const isManager = await this.isManagerOfPropertyCondominium(
      requestingUserId,
      propertyId,
    );

    if (isManager) {
      // Managers can see all residents
      return this.propertyResidentRepository.find({
        where: {
          propertyId,
          status: AssociationStatus.ACTIVE,
          deletedAt: undefined,
        },
        relations: ['user'],
        order: { isPrimary: 'DESC', createdAt: 'ASC' },
      });
    }

    // Check if user is a resident of this property
    const isResident = await this.isResidentOfProperty(
      requestingUserId,
      propertyId,
    );

    if (isResident) {
      // Residents can only see themselves
      const ownResident = await this.propertyResidentRepository.find({
        where: {
          propertyId,
          userId: requestingUserId,
          status: AssociationStatus.ACTIVE,
          deletedAt: undefined,
        },
        relations: ['user'],
      });
      return ownResident;
    }

    // User has no access to view residents of this property
    throw new ForbiddenException(
      'No tiene permiso para ver los residentes de esta propiedad',
    );
  }

  /**
   * Find properties for a user
   */
  async findByUserId(
    userId: string,
    status?: AssociationStatus,
  ): Promise<PropertyResident[]> {
    const where: Record<string, unknown> = {
      userId,
      deletedAt: undefined,
    };
    if (status) {
      where.status = status;
    }

    return this.propertyResidentRepository.find({
      where,
      relations: ['property'],
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Create a new property resident association
   */
  async create(dto: CreatePropertyResidentDto): Promise<PropertyResident> {
    // Validate property exists
    const property = await this.propertyRepository.findOne({
      where: { id: dto.propertyId, deletedAt: undefined },
    });
    if (!property) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }

    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: dto.userId, deletedAt: undefined },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Check if user already has an ACTIVE association with this property
    const existing = await this.propertyResidentRepository.findOne({
      where: {
        propertyId: dto.propertyId,
        userId: dto.userId,
        status: AssociationStatus.ACTIVE,
        deletedAt: undefined,
      },
    });
    if (existing) {
      throw new BadRequestException(
        'User already has an active association with this property',
      );
    }

    // If setting as primary, remove primary flag from other residents
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
      status: AssociationStatus.PENDING,
      startDate: dto.startDate,
      endDate: dto.endDate,
      isPrimary: dto.isPrimary ?? false,
    });

    return this.propertyResidentRepository.save(propertyResident);
  }

  /**
   * Update a property resident association
   */
  async update(
    id: string,
    dto: UpdatePropertyResidentDto,
  ): Promise<PropertyResident | null> {
    const propertyResident = await this.findById(id);
    if (!propertyResident) {
      return null;
    }

    // If setting as primary, remove primary flag from other residents
    if (dto.isPrimary && !propertyResident.isPrimary) {
      await this.propertyResidentRepository.update(
        { propertyId: propertyResident.propertyId, isPrimary: true },
        { isPrimary: false },
      );
    }

    if (dto.relationType !== undefined)
      propertyResident.relationType = dto.relationType;
    if (dto.startDate !== undefined) propertyResident.startDate = dto.startDate;
    if (dto.endDate !== undefined) propertyResident.endDate = dto.endDate;
    if (dto.isPrimary !== undefined) propertyResident.isPrimary = dto.isPrimary;

    return this.propertyResidentRepository.save(propertyResident);
  }

  /**
   * Approve a property resident association
   */
  async approve(id: string, dto: ApproveRejectDto): Promise<PropertyResident | null> {
    const propertyResident = await this.findById(id);
    if (!propertyResident) {
      return null;
    }

    if (propertyResident.status !== AssociationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending associations can be approved',
      );
    }

    propertyResident.status = AssociationStatus.ACTIVE;
    propertyResident.approvedBy = dto.approvedBy;
    propertyResident.approvedAt = new Date();
    if (!propertyResident.startDate) {
      propertyResident.startDate = new Date();
    }

    return this.propertyResidentRepository.save(propertyResident);
  }

  /**
   * Reject a property resident association
   */
  async reject(id: string, dto: ApproveRejectDto): Promise<PropertyResident | null> {
    const propertyResident = await this.findById(id);
    if (!propertyResident) {
      return null;
    }

    if (propertyResident.status !== AssociationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending associations can be rejected',
      );
    }

    propertyResident.status = AssociationStatus.REJECTED;
    propertyResident.approvedBy = dto.approvedBy;
    propertyResident.approvedAt = new Date();
    propertyResident.rejectionReason = dto.rejectionReason;

    return this.propertyResidentRepository.save(propertyResident);
  }

  /**
   * Deactivate a property resident association
   */
  async deactivate(id: string): Promise<PropertyResident | null> {
    const propertyResident = await this.findById(id);
    if (!propertyResident) {
      return null;
    }

    if (propertyResident.status !== AssociationStatus.ACTIVE) {
      throw new BadRequestException(
        'Only active associations can be deactivated',
      );
    }

    propertyResident.status = AssociationStatus.INACTIVE;
    if (!propertyResident.endDate) {
      propertyResident.endDate = new Date();
    }

    return this.propertyResidentRepository.save(propertyResident);
  }

  /**
   * Soft delete a property resident association
   */
  async delete(id: string): Promise<boolean> {
    const propertyResident = await this.findById(id);
    if (!propertyResident) {
      return false;
    }

    propertyResident.deletedAt = new Date();
    await this.propertyResidentRepository.save(propertyResident);
    return true;
  }

  /**
   * Get primary contact for a property
   */
  async getPrimaryContact(propertyId: string): Promise<PropertyResident | null> {
    return this.propertyResidentRepository.findOne({
      where: {
        propertyId,
        isPrimary: true,
        status: AssociationStatus.ACTIVE,
        deletedAt: undefined,
      },
      relations: ['user'],
    });
  }

  /**
   * Set primary contact for a property
   */
  async setPrimaryContact(
    propertyId: string,
    residentId: string,
  ): Promise<PropertyResident | null> {
    const propertyResident = await this.propertyResidentRepository.findOne({
      where: {
        id: residentId,
        propertyId,
        status: AssociationStatus.ACTIVE,
        deletedAt: undefined,
      },
    });

    if (!propertyResident) {
      return null;
    }

    // Remove primary flag from all other residents of this property
    await this.propertyResidentRepository.update(
      { propertyId, isPrimary: true },
      { isPrimary: false },
    );

    // Set this resident as primary
    propertyResident.isPrimary = true;
    return this.propertyResidentRepository.save(propertyResident);
  }
}
