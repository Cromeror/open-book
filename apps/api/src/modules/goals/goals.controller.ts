import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { z } from 'zod';

import { User } from '../../entities/user.entity';
import { Goal, GoalStatus } from '../../entities/goal.entity';
import { GoalHistory } from '../../entities/goal-history.entity';

import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { PermissionsGuard, RequirePermission } from '../permissions';
import { HateoasResource } from '../hateoas/hateoas-resource.decorator';
import { CondominiumMemberGuard } from '../condominiums/guards/condominium-member.guard';

import { GoalsService } from './goals.service';
import {
  CreateGoalDto,
  CreateGoalInput,
  validateCreateGoalDto,
  UpdateGoalDto,
  UpdateGoalInput,
  validateUpdateGoalDto,
  ChangeStatusDto,
  ChangeStatusInput,
  validateChangeStatusDto,
  QueryGoalsDto,
  validateQueryGoalsDto,
  PaginatedResponse,
} from './dto';

/**
 * Controller for fundraising goals (Objetivos de Recaudo)
 *
 * All endpoints are scoped to a specific condominium.
 *
 * Endpoints:
 * - POST   /api/condominiums/:condominiumId/goals       - Create goal
 * - GET    /api/condominiums/:condominiumId/goals       - List goals
 * - GET    /api/condominiums/:condominiumId/goals/:id   - Get goal
 * - PATCH  /api/condominiums/:condominiumId/goals/:id   - Update goal
 * - DELETE /api/condominiums/:condominiumId/goals/:id   - Delete goal
 * - PATCH  /api/condominiums/:condominiumId/goals/:id/status - Change status
 * - GET    /api/condominiums/:condominiumId/goals/:id/history - Get history
 * - GET    /api/condominiums/:condominiumId/goals/:id/transitions - Available transitions
 */
@Controller('condominiums/:condominiumId/goals')
@UseGuards(JwtAuthGuard, CondominiumMemberGuard, PermissionsGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  // ============================================
  // CRUD Endpoints
  // ============================================

  /**
   * Create a new fundraising goal
   *
   * POST /api/condominiums/:condominiumId/goals
   *
   * Requires 'goals:create' permission.
   *
   * @returns Created goal (201)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: CreateGoalInput,
  ): Promise<Goal> {
    // Validate input
    let dto: CreateGoalDto;
    try {
      dto = validateCreateGoalDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation error',
          errors: messages,
        });
      }
      throw error;
    }

    return this.goalsService.create(condominiumId, dto);
  }

  /**
   * List goals with filtering and pagination
   *
   * GET /api/condominiums/:condominiumId/goals
   *
   * Requires 'goals:read' permission.
   *
   * Query params:
   * - status: Filter by status (ACTIVE, PAUSED, COMPLETED, CANCELLED)
   * - name: Search by name (partial match)
   * - dateFrom: Filter by start date >= value
   * - dateTo: Filter by start date <= value
   * - orderBy: Sort field (name, targetAmount, startDate, endDate, createdAt)
   * - order: Sort direction (asc, desc)
   * - page: Page number (default 1)
   * - limit: Items per page (default 20, max 100)
   *
   * @returns Paginated list of goals (200)
   */
  @Get()
  @HateoasResource('goals', 'GET')
  @RequirePermission('goals:read')
  async findAll(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: unknown,
  ): Promise<PaginatedResponse<Goal>> {
    // Validate query params
    let dto: QueryGoalsDto;
    try {
      dto = validateQueryGoalsDto(query);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation error',
          errors: messages,
        });
      }
      throw error;
    }

    return this.goalsService.findAll(condominiumId, dto);
  }

  /**
   * Get a single goal by ID
   *
   * GET /api/condominiums/:condominiumId/goals/:id
   *
   * Requires 'goals:read' permission.
   *
   * @returns Goal (200)
   * @throws NotFoundException if not found (404)
   */
  @Get(':id')
  @HateoasResource('goals-detail', 'GET')
  @RequirePermission('goals:read')
  async findOne(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Goal> {
    return this.goalsService.findOne(condominiumId, id);
  }

  /**
   * Update an existing goal
   *
   * PATCH /api/condominiums/:condominiumId/goals/:id
   *
   * Requires 'goals:update' permission.
   *
   * @returns Updated goal (200)
   * @throws NotFoundException if not found (404)
   * @throws BadRequestException if goal is in terminal state (400)
   */
  @Patch(':id')
  async update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGoalInput,
  ): Promise<Goal> {
    // Validate input
    let dto: UpdateGoalDto;
    try {
      dto = validateUpdateGoalDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation error',
          errors: messages,
        });
      }
      throw error;
    }

    return this.goalsService.update(condominiumId, id, dto);
  }

  /**
   * Soft delete a goal
   *
   * DELETE /api/condominiums/:condominiumId/goals/:id
   *
   * Requires 'goals:delete' permission.
   *
   * @returns 204 No Content
   * @throws NotFoundException if not found (404)
   * @throws BadRequestException if has associated activities (400)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.goalsService.remove(condominiumId, id);
  }

  // ============================================
  // State Management Endpoints
  // ============================================

  /**
   * Change the status of a goal
   *
   * PATCH /api/condominiums/:condominiumId/goals/:id/status
   *
   * Requires 'goals:update' permission.
   *
   * Body:
   * - newStatus: Target status (ACTIVE, PAUSED, COMPLETED, CANCELLED)
   * - justification: Required for PAUSED and CANCELLED transitions
   *
   * @returns Updated goal with new status (200)
   * @throws NotFoundException if not found (404)
   * @throws BadRequestException if transition is not allowed (400)
   */
  @Patch(':id/status')
  async changeStatus(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangeStatusInput,
    @CurrentUser() user: User,
  ): Promise<Goal> {
    let dto: ChangeStatusDto;
    try {
      dto = validateChangeStatusDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Validation error',
          errors: messages,
        });
      }
      throw error;
    }

    return this.goalsService.changeStatus(condominiumId, id, dto, user.id);
  }

  /**
   * Get available status transitions for a goal
   *
   * GET /api/condominiums/:condominiumId/goals/:id/transitions
   *
   * Requires 'goals:read' permission.
   *
   * @returns Current status and available next statuses (200)
   */
  @Get(':id/transitions')
  async getTransitions(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ currentStatus: GoalStatus; availableStatuses: GoalStatus[] }> {
    return this.goalsService.getAvailableTransitions(condominiumId, id);
  }

  // ============================================
  // History / Audit Trail Endpoints
  // ============================================

  /**
   * Get status change history for a goal
   *
   * GET /api/condominiums/:condominiumId/goals/:id/history
   *
   * Requires 'goals:read' permission.
   *
   * @returns List of status changes in descending order (200)
   */
  @Get(':id/history')
  async getHistory(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GoalHistory[]> {
    return this.goalsService.getHistory(condominiumId, id);
  }
}
