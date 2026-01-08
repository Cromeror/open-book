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
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';

import { User } from '../../entities/user.entity';
import { Goal, GoalStatus } from '../../entities/goal.entity';
import { GoalHistory } from '../../entities/goal-history.entity';

import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { PermissionsGuard, RequireModule, RequirePermission } from '../permissions';

import { GoalsService, AuditContext } from './goals.service';
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
 * Helper to extract client info from request for audit trail
 */
function getClientInfo(req: Request): { ipAddress: string; userAgent?: string } {
  const ipAddress =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown';
  const userAgent = req.headers['user-agent'];

  return { ipAddress, userAgent };
}

/**
 * Helper to build audit context from request and user
 */
function buildAuditContext(user: User, req: Request): AuditContext {
  const { ipAddress, userAgent } = getClientInfo(req);
  return {
    userId: user.id,
    ipAddress,
    userAgent,
  };
}

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
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireModule('goals')
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
  @RequirePermission('goals:create')
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
  @RequirePermission('goals:update')
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
  @RequirePermission('goals:delete')
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
  @RequirePermission('goals:update')
  async changeStatus(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangeStatusInput,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<Goal> {
    // Validate input
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

    const context = buildAuditContext(user, req);
    return this.goalsService.changeStatus(condominiumId, id, dto, context);
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
  @RequirePermission('goals:read')
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
  @RequirePermission('goals:read')
  async getHistory(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GoalHistory[]> {
    return this.goalsService.getHistory(condominiumId, id);
  }
}
