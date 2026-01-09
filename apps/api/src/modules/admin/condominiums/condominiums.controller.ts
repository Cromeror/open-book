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
} from '@nestjs/common';
import { z } from 'zod';

import { SuperAdminGuard } from '../../permissions/guards/superadmin.guard';
import { JwtAuthGuard } from '../../auth/guards';

import { CondominiumsService } from './condominiums.service';

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

/**
 * Controller for condominium management (SuperAdmin only)
 *
 * All endpoints require SuperAdmin authentication.
 *
 * Endpoints:
 * - GET /api/admin/condominiums - List all condominiums with pagination
 * - GET /api/admin/condominiums/:id - Get a specific condominium by ID
 * - POST /api/admin/condominiums - Create a new condominium
 * - PATCH /api/admin/condominiums/:id - Update a condominium
 * - DELETE /api/admin/condominiums/:id - Delete (soft) a condominium
 */
@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  /**
   * List all condominiums with pagination and optional search
   *
   * GET /api/admin/condominiums
   *
   * Query params:
   * - search: Search by name, city, or NIT (partial match)
   * - isActive: Filter by active status (true/false)
   * - page: Page number (default 1)
   * - limit: Items per page (default 20, max 100)
   * - orderBy: Sort field (name, city, createdAt)
   * - order: Sort direction (asc, desc)
   *
   * @returns Paginated list of condominiums (200)
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
   *
   * @returns Condominium details (200)
   * @throws NotFoundException if condominium not found (404)
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
   *
   * @returns Created condominium (201)
   * @throws BadRequestException for validation errors (400)
   * @throws ConflictException if NIT already exists (409)
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
   *
   * @returns Updated condominium (200)
   * @throws BadRequestException for validation errors (400)
   * @throws NotFoundException if condominium not found (404)
   * @throws ConflictException if NIT already exists (409)
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
   *
   * @returns 204 No Content
   * @throws NotFoundException if condominium not found (404)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.condominiumsService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Condominium with ID ${id} not found`);
    }
  }
}
