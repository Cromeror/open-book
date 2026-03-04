import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Condominium } from '../../entities/condominium.entity';
import { CondominiumManager } from '../../entities/condominium-manager.entity';
import {
  PropertyResident,
  AssociationStatus,
} from '../../entities/property-resident.entity';

/**
 * Response for condominium list
 */
export interface CondominiumListItem {
  id: string;
  name: string;
  address: string;
  city: string;
  nit?: string;
  isPrimary: boolean;
}

/**
 * Response for single condominium detail
 */
export interface CondominiumDetail {
  id: string;
  name: string;
  address: string;
  city: string;
  nit?: string;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Service for user condominium access (non-admin)
 *
 * Provides read-only access to condominiums assigned to the user
 * via the condominium_managers table.
 *
 * Key differences from admin condominiums:
 * - Users can only see condominiums they are assigned to
 * - Read-only operations (no create, update, delete)
 * - Validates user has access before returning data
 */
@Injectable()
export class CondominiumsService {
  constructor(
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
    @InjectRepository(CondominiumManager)
    private readonly managerRepository: Repository<CondominiumManager>,
    @InjectRepository(PropertyResident)
    private readonly propertyResidentRepository: Repository<PropertyResident>
  ) {}

  /**
   * Get all condominiums assigned to a user
   *
   * Returns only active assignments where both the assignment
   * and the condominium are active.
   */
  async findAllForUser(userId: string): Promise<CondominiumListItem[]> {
    const managers = await this.managerRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.condominium', 'c')
      .where('m.userId = :userId', { userId })
      .andWhere('m.isActive = true')
      .andWhere('m.deletedAt IS NULL')
      .andWhere('c.isActive = true')
      .andWhere('c.deletedAt IS NULL')
      .orderBy('m.isPrimary', 'DESC')
      .addOrderBy('c.name', 'ASC')
      .getMany();

    return managers.map((m) => ({
      id: m.condominium.id,
      name: m.condominium.name,
      address: m.condominium.address,
      city: m.condominium.city,
      nit: m.condominium.nit,
      isPrimary: m.isPrimary,
    }));
  }

  /**
   * Get a single condominium by ID
   *
   * Validates that the user has access to the condominium.
   *
   * @throws ForbiddenException if user doesn't have access
   * @throws NotFoundException if condominium doesn't exist
   */
  async findOne(
    condominiumId: string,
    userId: string
  ): Promise<CondominiumDetail> {
    // First verify user has access to this condominium
    const hasAccess = await this.userHasAccess(userId, condominiumId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este condominio');
    }

    const condominium = await this.condominiumRepository.findOne({
      where: {
        id: condominiumId,
        isActive: true,
        deletedAt: undefined,
      },
    });

    if (!condominium) {
      throw new NotFoundException('Condominio no encontrado');
    }

    return {
      id: condominium.id,
      name: condominium.name,
      address: condominium.address,
      city: condominium.city,
      nit: condominium.nit,
      isActive: condominium.isActive,
      createdAt: condominium.createdAt,
    };
  }

  /**
   * Check if user has access to a specific condominium
   *
   * User has access if they are an active manager OR an active resident
   * of a property in the condominium.
   */
  async userHasAccess(userId: string, condominiumId: string): Promise<boolean> {
    // Check as manager
    const managerCount = await this.managerRepository.count({
      where: {
        userId,
        condominiumId,
        isActive: true,
        deletedAt: undefined,
      },
    });

    if (managerCount > 0) return true;

    // Check as resident via property_residents → properties
    const residentCount = await this.propertyResidentRepository
      .createQueryBuilder('pr')
      .innerJoin('pr.property', 'property')
      .where('pr.userId = :userId', { userId })
      .andWhere('property.condominiumId = :condominiumId', { condominiumId })
      .andWhere('pr.status = :status', { status: AssociationStatus.ACTIVE })
      .andWhere('pr.deletedAt IS NULL')
      .andWhere('property.isActive = true')
      .getCount();

    return residentCount > 0;
  }

  /**
   * Get user's primary condominium
   *
   * Checks manager assignments first (isPrimary DESC), then resident associations.
   * Returns the first match found, or null if user has no condominiums.
   */
  async getPrimaryForUser(userId: string): Promise<CondominiumListItem | null> {
    // Check as manager first (primary managers take priority)
    const manager = await this.managerRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.condominium', 'c')
      .where('m.userId = :userId', { userId })
      .andWhere('m.isActive = true')
      .andWhere('m.deletedAt IS NULL')
      .andWhere('c.isActive = true')
      .andWhere('c.deletedAt IS NULL')
      .orderBy('m.isPrimary', 'DESC')
      .addOrderBy('c.name', 'ASC')
      .getOne();

    if (manager) {
      return {
        id: manager.condominium.id,
        name: manager.condominium.name,
        address: manager.condominium.address,
        city: manager.condominium.city,
        nit: manager.condominium.nit,
        isPrimary: manager.isPrimary,
      };
    }

    // Check as resident
    const resident = await this.propertyResidentRepository
      .createQueryBuilder('pr')
      .innerJoinAndSelect('pr.property', 'property')
      .innerJoinAndSelect('property.condominium', 'c')
      .where('pr.userId = :userId', { userId })
      .andWhere('pr.status = :status', { status: AssociationStatus.ACTIVE })
      .andWhere('pr.deletedAt IS NULL')
      .andWhere('property.isActive = true')
      .andWhere('c.isActive = true')
      .andWhere('c.deletedAt IS NULL')
      .orderBy('c.name', 'ASC')
      .getOne();

    if (!resident) return null;

    const condo = resident.property.condominium;
    return {
      id: condo.id,
      name: condo.name,
      address: condo.address,
      city: condo.city,
      nit: condo.nit,
      isPrimary: false,
    };
  }
}
