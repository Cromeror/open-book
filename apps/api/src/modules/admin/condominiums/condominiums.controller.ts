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
  ConflictException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';

import { SuperAdminGuard } from '../../permissions/guards/superadmin.guard';
import { JwtAuthGuard } from '../../auth/guards';
import { User } from '../../../entities/user.entity';

import { CondominiumsService } from './condominiums.service';
import { CondominiumManagersService } from './condominium-managers.service';

// Zod schemas for validation
const createCondominiumSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  nit: z.string().max(20).optional(),
  address: z.string().min(1, 'La dirección es requerida').max(500),
  city: z.string().min(1, 'La ciudad es requerida').max(100),
});

const updateCondominiumSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nit: z.string().max(20).nullable().optional(),
  address: z.string().min(1).max(500).optional(),
  city: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

const assignManagerSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  isPrimary: z.boolean().optional(),
});

const updateManagerSchema = z.object({
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Controller for condominium management (SuperAdmin only)
 *
 * All endpoints require SuperAdmin authentication.
 *
 * Condominium endpoints:
 * - GET /api/admin/condominiums - List all condominiums with pagination
 * - GET /api/admin/condominiums/:id - Get a specific condominium by ID
 * - POST /api/admin/condominiums - Create a new condominium
 * - PATCH /api/admin/condominiums/:id - Update a condominium
 * - DELETE /api/admin/condominiums/:id - Delete (soft) a condominium
 * - POST /api/admin/condominiums/:id/toggle - Toggle active status
 *
 * Manager endpoints:
 * - GET /api/admin/condominiums/:id/managers - List managers for a condominium
 * - POST /api/admin/condominiums/:id/managers - Assign a manager
 * - PATCH /api/admin/condominiums/:id/managers/:managerId - Update manager assignment
 * - DELETE /api/admin/condominiums/:id/managers/:managerId - Unassign a manager
 */
@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class CondominiumsController {
  constructor(
    private readonly condominiumsService: CondominiumsService,
    private readonly managersService: CondominiumManagersService,
  ) {}

  // ============================================================
  // CONDOMINIUM CRUD ENDPOINTS
  // ============================================================

  /**
   * List all condominiums with pagination and optional search
   *
   * GET /api/admin/condominiums
   */
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: string,
  ) {
    return this.condominiumsService.findAll({
      search,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
      orderBy: orderBy as 'name' | 'city' | 'createdAt' | undefined,
      order: (order as 'asc' | 'desc') || 'desc',
    });
  }

  /**
   * Get a specific condominium by ID
   *
   * GET /api/admin/condominiums/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const condominium = await this.condominiumsService.findById(id);
    if (!condominium) {
      throw new NotFoundException(`Condominium with ID ${id} not found`);
    }
    return condominium;
  }

  /**
   * Create a new condominium
   *
   * POST /api/admin/condominiums
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = createCondominiumSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    // Check for duplicate NIT
    if (result.data.nit) {
      const exists = await this.condominiumsService.existsByNit(result.data.nit);
      if (exists) {
        throw new ConflictException(`NIT ${result.data.nit} already exists`);
      }
    }

    return this.condominiumsService.create(result.data);
  }

  /**
   * Update a condominium
   *
   * PATCH /api/admin/condominiums/:id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const result = updateCondominiumSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    // Check for duplicate NIT (if updating NIT)
    if (result.data.nit) {
      const exists = await this.condominiumsService.existsByNit(
        result.data.nit,
        id,
      );
      if (exists) {
        throw new ConflictException(`NIT ${result.data.nit} already exists`);
      }
    }

    const condominium = await this.condominiumsService.update(id, result.data);
    if (!condominium) {
      throw new NotFoundException(`Condominium with ID ${id} not found`);
    }
    return condominium;
  }

  /**
   * Delete (soft) a condominium
   *
   * DELETE /api/admin/condominiums/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.condominiumsService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Condominium with ID ${id} not found`);
    }
  }

  /**
   * Toggle condominium active status
   *
   * POST /api/admin/condominiums/:id/toggle
   */
  @Post(':id/toggle')
  async toggle(@Param('id', ParseUUIDPipe) id: string) {
    const condominium = await this.condominiumsService.toggle(id);
    if (!condominium) {
      throw new NotFoundException(`Condominium with ID ${id} not found`);
    }
    return condominium;
  }

  // ============================================================
  // MANAGER ASSIGNMENT ENDPOINTS
  // ============================================================

  /**
   * List all managers for a condominium
   *
   * GET /api/admin/condominiums/:id/managers
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
