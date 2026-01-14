import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CondominiumManager } from '../../../entities/condominium-manager.entity';
import { Condominium } from '../../../entities/condominium.entity';
import { User } from '../../../entities/user.entity';

/**
 * DTO for assigning a manager to a condominium
 */
export interface AssignManagerDto {
  userId: string;
  isPrimary?: boolean;
}

/**
 * DTO for updating a manager assignment
 */
export interface UpdateManagerDto {
  isPrimary?: boolean;
  isActive?: boolean;
}

/**
 * Options for filtering manager queries
 */
export interface FindManagersOptions {
  isActive?: boolean;
}

/**
 * Service for managing condominium managers (SuperAdmin only)
 *
 * Provides operations for assigning and managing managers for condominiums.
 * This is for reference/listing purposes - access control is handled by
 * the granular permissions system (UserPermission with scope COPROPIEDAD).
 */
@Injectable()
export class CondominiumManagersService {
  constructor(
    @InjectRepository(CondominiumManager)
    private readonly managerRepository: Repository<CondominiumManager>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
  ) {}

  /**
   * Find all managers for a condominium
   */
  async findByCondominium(
    condominiumId: string,
    options: FindManagersOptions = {},
  ): Promise<CondominiumManager[]> {
    const queryBuilder = this.managerRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'user')
      .where('m.condominiumId = :condominiumId', { condominiumId })
      .andWhere('m.deletedAt IS NULL');

    if (options.isActive !== undefined) {
      queryBuilder.andWhere('m.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    queryBuilder.orderBy('m.isPrimary', 'DESC').addOrderBy('m.assignedAt', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * Find all condominiums where a user is a manager
   */
  async findByUser(
    userId: string,
    options: FindManagersOptions = {},
  ): Promise<CondominiumManager[]> {
    const queryBuilder = this.managerRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.condominium', 'condominium')
      .where('m.userId = :userId', { userId })
      .andWhere('m.deletedAt IS NULL')
      .andWhere('condominium.deletedAt IS NULL');

    if (options.isActive !== undefined) {
      queryBuilder.andWhere('m.isActive = :isActive', {
        isActive: options.isActive,
      });
    }

    queryBuilder.orderBy('m.isPrimary', 'DESC').addOrderBy('condominium.name', 'ASC');

    return queryBuilder.getMany();
  }

  /**
   * Find a manager assignment by ID
   */
  async findById(id: string): Promise<CondominiumManager | null> {
    return this.managerRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['user', 'condominium'],
    });
  }

  /**
   * Assign a manager to a condominium
   */
  async assign(
    condominiumId: string,
    dto: AssignManagerDto,
    assignedBy: string,
  ): Promise<CondominiumManager> {
    // Verify condominium exists
    const condominium = await this.condominiumRepository.findOne({
      where: { id: condominiumId, deletedAt: undefined },
    });
    if (!condominium) {
      throw new NotFoundException(
        `Condominium with ID ${condominiumId} not found`,
      );
    }

    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: dto.userId, deletedAt: undefined },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Check if assignment already exists
    const existing = await this.managerRepository.findOne({
      where: {
        condominiumId,
        userId: dto.userId,
        deletedAt: undefined,
      },
    });
    if (existing) {
      throw new ConflictException(
        `User is already assigned as manager for this condominium`,
      );
    }

    // Create the assignment
    const manager = this.managerRepository.create({
      condominiumId,
      userId: dto.userId,
      isPrimary: dto.isPrimary ?? false,
      isActive: true,
      assignedAt: new Date(),
      assignedBy,
    });

    const saved = await this.managerRepository.save(manager);

    // Reload with relations
    return this.managerRepository.findOne({
      where: { id: saved.id },
      relations: ['user', 'condominium'],
    }) as Promise<CondominiumManager>;
  }

  /**
   * Update a manager assignment
   */
  async update(
    id: string,
    dto: UpdateManagerDto,
  ): Promise<CondominiumManager | null> {
    const manager = await this.findById(id);
    if (!manager) {
      return null;
    }

    if (dto.isPrimary !== undefined) manager.isPrimary = dto.isPrimary;
    if (dto.isActive !== undefined) manager.isActive = dto.isActive;

    return this.managerRepository.save(manager);
  }

  /**
   * Unassign a manager (soft delete by setting isActive = false)
   */
  async unassign(id: string): Promise<boolean> {
    const manager = await this.findById(id);
    if (!manager) {
      return false;
    }

    manager.isActive = false;
    await this.managerRepository.save(manager);
    return true;
  }

  /**
   * Check if a user is assigned as manager to a condominium
   */
  async exists(userId: string, condominiumId: string): Promise<boolean> {
    const count = await this.managerRepository.count({
      where: {
        userId,
        condominiumId,
        deletedAt: undefined,
      },
    });
    return count > 0;
  }
}
