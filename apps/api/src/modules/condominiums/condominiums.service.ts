import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Condominium } from '../../entities/condominium.entity';
import { CondominiumManager } from '../../entities/condominium-manager.entity';

/**
 * Response for condominium list
 */
export interface CondominiumListItem {
  id: string;
  name: string;
  address: string;
  city: string;
  nit?: string;
  unitCount: number;
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
  unitCount: number;
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
      unitCount: m.condominium.unitCount,
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
    userId: string,
  ): Promise<CondominiumDetail> {
    // First verify user has access to this condominium
    const hasAccess = await this.userHasAccess(userId, condominiumId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'No tienes acceso a este condominio',
      );
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
      unitCount: condominium.unitCount,
      isActive: condominium.isActive,
      createdAt: condominium.createdAt,
    };
  }

  /**
   * Check if user has access to a specific condominium
   *
   * User has access if they are assigned as an active manager.
   */
  async userHasAccess(userId: string, condominiumId: string): Promise<boolean> {
    const count = await this.managerRepository.count({
      where: {
        userId,
        condominiumId,
        isActive: true,
        deletedAt: undefined,
      },
    });

    return count > 0;
  }

  /**
   * Get user's primary condominium
   *
   * Returns the condominium marked as primary, or the first one if none is primary.
   */
  async getPrimaryForUser(userId: string): Promise<CondominiumListItem | null> {
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

    if (!manager) {
      return null;
    }

    return {
      id: manager.condominium.id,
      name: manager.condominium.name,
      address: manager.condominium.address,
      city: manager.condominium.city,
      nit: manager.condominium.nit,
      unitCount: manager.condominium.unitCount,
      isPrimary: manager.isPrimary,
    };
  }
}
