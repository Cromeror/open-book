import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Goal, GoalStatus } from '../../entities/goal.entity';
import { Condominium } from '../../entities/condominium.entity';
import { GoalHistory } from '../../entities/goal-history.entity';

import {
  CreateGoalDto,
  UpdateGoalDto,
  ChangeStatusDto,
  QueryGoalsDto,
  PaginatedResponse,
} from './dto';

import { canTransition } from './goal-state-machine';

/**
 * Context for audit trail
 */
export interface AuditContext {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Service for managing fundraising goals (Objetivos de Recaudo)
 *
 * Implements:
 * - CRUD operations with business validations
 * - State machine for goal lifecycle
 * - History/audit trail for state changes
 * - Filtering and pagination
 */
@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,

    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,

    @InjectRepository(GoalHistory)
    private readonly historyRepository: Repository<GoalHistory>,
  ) {}

  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Create a new fundraising goal
   */
  async create(
    condominiumId: string,
    dto: CreateGoalDto,
  ): Promise<Goal> {
    // Verify condominium exists
    const condominium = await this.condominiumRepository.findOne({
      where: { id: condominiumId },
    });

    if (!condominium) {
      throw new NotFoundException(
        `Condominium with ID ${condominiumId} not found`,
      );
    }

    // Create the goal
    const goal = this.goalRepository.create({
      name: dto.name,
      description: dto.description ?? undefined,
      targetAmount: dto.targetAmount.toFixed(2),
      startDate: dto.startDate,
      endDate: dto.endDate ?? undefined,
      condominiumId,
      status: GoalStatus.ACTIVE,
    });

    return this.goalRepository.save(goal);
  }

  /**
   * Find all goals for a condominium with filtering and pagination
   */
  async findAll(
    condominiumId: string,
    query: QueryGoalsDto,
  ): Promise<PaginatedResponse<Goal>> {
    // Build query
    const queryBuilder = this.goalRepository
      .createQueryBuilder('goal')
      .where('goal.condominiumId = :condominiumId', { condominiumId });

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('goal.status = :status', {
        status: query.status,
      });
    }

    if (query.name) {
      queryBuilder.andWhere('goal.name ILIKE :name', {
        name: `%${query.name}%`,
      });
    }

    if (query.dateFrom) {
      queryBuilder.andWhere('goal.startDate >= :dateFrom', {
        dateFrom: query.dateFrom,
      });
    }

    if (query.dateTo) {
      queryBuilder.andWhere('goal.startDate <= :dateTo', {
        dateTo: query.dateTo,
      });
    }

    // Apply sorting
    const orderDirection = query.order.toUpperCase() as 'ASC' | 'DESC';
    queryBuilder.orderBy(`goal.${query.orderBy}`, orderDirection);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const skip = (query.page - 1) * query.limit;
    queryBuilder.skip(skip).take(query.limit);

    // Execute query
    const data = await queryBuilder.getMany();

    return {
      data,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  /**
   * Find a single goal by ID
   */
  async findOne(condominiumId: string, id: string): Promise<Goal> {
    const goal = await this.goalRepository.findOne({
      where: { id, condominiumId },
    });

    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    return goal;
  }

  /**
   * Update an existing goal
   */
  async update(
    condominiumId: string,
    id: string,
    dto: UpdateGoalDto,
  ): Promise<Goal> {
    const goal = await this.findOne(condominiumId, id);

    // Check if goal can be modified
    if (!goal.isModifiable) {
      throw new BadRequestException(
        `Cannot modify a ${goal.status.toLowerCase()} goal`,
      );
    }

    // Business rule: Cannot modify targetAmount if COMPLETED
    if (dto.targetAmount !== undefined && goal.status === GoalStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot modify the target amount of a completed goal',
      );
    }

    // Validate date consistency with existing data
    const newStartDate = dto.startDate ?? goal.startDate;
    const newEndDate = dto.endDate ?? goal.endDate;

    if (newEndDate && newEndDate < newStartDate) {
      throw new BadRequestException(
        'End date must be equal to or after start date',
      );
    }

    // Apply updates
    if (dto.name !== undefined) goal.name = dto.name;
    if (dto.description !== undefined) {
      goal.description = dto.description ?? undefined;
    }
    if (dto.targetAmount !== undefined) {
      goal.targetAmount = dto.targetAmount.toFixed(2);
    }
    if (dto.startDate !== undefined) goal.startDate = dto.startDate;
    if (dto.endDate !== undefined) {
      goal.endDate = dto.endDate ?? undefined;
    }

    return this.goalRepository.save(goal);
  }

  /**
   * Soft delete a goal
   */
  async remove(condominiumId: string, id: string): Promise<void> {
    await this.findOne(condominiumId, id);

    // Business rule: Cannot delete if has associated activities
    // Note: This will be implemented when Activity entity exists
    // const activitiesCount = await this.activityRepository.count({
    //   where: { goalId: id },
    // });
    // if (activitiesCount > 0) {
    //   throw new BadRequestException(
    //     'Cannot delete a goal with associated activities',
    //   );
    // }

    await this.goalRepository.softDelete(id);
  }

  // ============================================
  // State Management
  // ============================================

  /**
   * Change the status of a goal
   */
  async changeStatus(
    condominiumId: string,
    id: string,
    dto: ChangeStatusDto,
    context: AuditContext,
  ): Promise<Goal> {
    const goal = await this.findOne(condominiumId, id);

    // Validate transition using state machine
    const transitionResult = canTransition(goal.status, dto.newStatus);

    if (!transitionResult.isValid) {
      throw new BadRequestException(transitionResult.error);
    }

    // Validate justification if required
    if (transitionResult.requiresJustification && !dto.justification) {
      throw new BadRequestException(
        `Justification is required when changing to ${dto.newStatus} status`,
      );
    }

    // Store previous status for history
    const previousStatus = goal.status;

    // Update status
    goal.status = dto.newStatus;
    await this.goalRepository.save(goal);

    // Record in history
    await this.createHistory({
      goalId: goal.id,
      previousStatus,
      newStatus: dto.newStatus,
      justification: dto.justification ?? undefined,
      userId: context.userId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return goal;
  }

  /**
   * Get available next states for a goal
   */
  async getAvailableTransitions(
    condominiumId: string,
    id: string,
  ): Promise<{ currentStatus: GoalStatus; availableStatuses: GoalStatus[] }> {
    const goal = await this.findOne(condominiumId, id);

    const availableStatuses: GoalStatus[] = [];

    // Check each possible status
    for (const status of Object.values(GoalStatus)) {
      const result = canTransition(goal.status, status);
      if (result.isValid) {
        availableStatuses.push(status);
      }
    }

    return {
      currentStatus: goal.status,
      availableStatuses,
    };
  }

  // ============================================
  // History / Audit Trail
  // ============================================

  /**
   * Get status change history for a goal
   */
  async getHistory(
    condominiumId: string,
    id: string,
  ): Promise<GoalHistory[]> {
    // First verify the goal exists and belongs to the condominium
    await this.findOne(condominiumId, id);

    return this.historyRepository.find({
      where: { goalId: id },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create a history entry
   */
  private async createHistory(data: {
    goalId: string;
    previousStatus: GoalStatus;
    newStatus: GoalStatus;
    justification?: string;
    userId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<GoalHistory> {
    const history = this.historyRepository.create(data);
    return this.historyRepository.save(history);
  }

  // ============================================
  // Resident-specific Methods (OB-004-C)
  // ============================================

  /**
   * Find active goals for residents
   * Returns only ACTIVE goals with aggregated progress
   */
  async findActiveForResident(
    condominiumId: string,
  ): Promise<Goal[]> {
    return this.goalRepository.find({
      where: {
        condominiumId,
        status: GoalStatus.ACTIVE,
      },
      order: { endDate: 'ASC' },
    });
  }

  /**
   * Find historical (completed/cancelled) goals
   */
  async findHistoricalForResident(
    condominiumId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Goal>> {
    const [data, total] = await this.goalRepository.findAndCount({
      where: [
        { condominiumId, status: GoalStatus.COMPLETED },
        { condominiumId, status: GoalStatus.CANCELLED },
      ],
      order: { updatedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
