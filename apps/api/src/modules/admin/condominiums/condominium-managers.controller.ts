import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Param,
  NotFoundException,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';

import { SuperAdminGuard } from '../../permissions/guards/superadmin.guard';
import { JwtAuthGuard } from '../../auth/guards';
import { User } from '../../../entities/user.entity';

import { CondominiumManagersService } from './condominium-managers.service';
import { CondominiumsService } from './condominiums.service';

// Zod schemas for validation
const assignManagerSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  isPrimary: z.boolean().optional(),
});

const updateManagerSchema = z.object({
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Controller for condominium manager management (SuperAdmin only)
 *
 * All endpoints require SuperAdmin authentication.
 *
 * Endpoints:
 * - GET /api/admin/condominiums/:id/managers - List managers for a condominium
 * - POST /api/admin/condominiums/:id/managers - Assign a manager
 * - PATCH /api/admin/condominiums/:id/managers/:managerId - Update manager assignment
 * - DELETE /api/admin/condominiums/:id/managers/:managerId - Unassign a manager
 */
@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class CondominiumManagersController {
  constructor(
    private readonly managersService: CondominiumManagersService,
    private readonly condominiumsService: CondominiumsService,
  ) {}

  /**
   * List all managers for a condominium
   *
   * GET /api/admin/condominiums/:id/managers
   *
   * Query params:
   * - isActive: Filter by active status (true/false)
   *
   * @returns List of managers (200)
   * @throws NotFoundException if condominium not found (404)
   */
  @Get(':id/managers')
  async findManagers(
    @Param('id', ParseUUIDPipe) condominiumId: string,
    @Query('isActive') isActive?: string,
  ) {
    // Verify condominium exists
    const condominium = await this.condominiumsService.findById(condominiumId);
    if (!condominium) {
      throw new NotFoundException(
        `Condominium with ID ${condominiumId} not found`,
      );
    }

    return this.managersService.findByCondominium(condominiumId, {
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  /**
   * Assign a manager to a condominium
   *
   * POST /api/admin/condominiums/:id/managers
   *
   * @returns Created manager assignment (201)
   * @throws BadRequestException for validation errors (400)
   * @throws NotFoundException if condominium or user not found (404)
   * @throws ConflictException if user is already assigned (409)
   */
  @Post(':id/managers')
  @HttpCode(HttpStatus.CREATED)
  async assignManager(
    @Param('id', ParseUUIDPipe) condominiumId: string,
    @Body() body: unknown,
    @Req() req: Request,
  ) {
    const result = assignManagerSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    // Get current user ID from request
    const currentUser = req.user as User;

    return this.managersService.assign(
      condominiumId,
      result.data,
      currentUser.id,
    );
  }

  /**
   * Update a manager assignment
   *
   * PATCH /api/admin/condominiums/:id/managers/:managerId
   *
   * @returns Updated manager assignment (200)
   * @throws BadRequestException for validation errors (400)
   * @throws NotFoundException if manager assignment not found (404)
   */
  @Patch(':id/managers/:managerId')
  async updateManager(
    @Param('id', ParseUUIDPipe) condominiumId: string,
    @Param('managerId', ParseUUIDPipe) managerId: string,
    @Body() body: unknown,
  ) {
    const result = updateManagerSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    // Verify the manager belongs to this condominium
    const manager = await this.managersService.findById(managerId);
    if (!manager || manager.condominiumId !== condominiumId) {
      throw new NotFoundException(
        `Manager assignment with ID ${managerId} not found for this condominium`,
      );
    }

    const updated = await this.managersService.update(managerId, result.data);
    if (!updated) {
      throw new NotFoundException(
        `Manager assignment with ID ${managerId} not found`,
      );
    }
    return updated;
  }

  /**
   * Unassign a manager from a condominium
   *
   * DELETE /api/admin/condominiums/:id/managers/:managerId
   *
   * @returns 204 No Content
   * @throws NotFoundException if manager assignment not found (404)
   */
  @Delete(':id/managers/:managerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassignManager(
    @Param('id', ParseUUIDPipe) condominiumId: string,
    @Param('managerId', ParseUUIDPipe) managerId: string,
  ) {
    // Verify the manager belongs to this condominium
    const manager = await this.managersService.findById(managerId);
    if (!manager || manager.condominiumId !== condominiumId) {
      throw new NotFoundException(
        `Manager assignment with ID ${managerId} not found for this condominium`,
      );
    }

    const unassigned = await this.managersService.unassign(managerId);
    if (!unassigned) {
      throw new NotFoundException(
        `Manager assignment with ID ${managerId} not found`,
      );
    }
  }
}
