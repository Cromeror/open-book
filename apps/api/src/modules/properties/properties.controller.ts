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
} from '@nestjs/common';
import { z } from 'zod';

import { JwtAuthGuard } from '../auth/guards';
import { PropertyType } from '../../entities/property.entity';

import { PropertiesService } from './properties.service';

// Zod schemas for validation
const createPropertySchema = z.object({
  identifier: z.string().min(1, 'El identificador es requerido').max(50),
  type: z
    .enum([
      PropertyType.APARTMENT,
      PropertyType.OFFICE,
      PropertyType.COMMERCIAL,
      PropertyType.PARKING,
      PropertyType.STORAGE,
      PropertyType.OTHER,
    ])
    .optional(),
  description: z.string().optional(),
  floor: z.number().int().optional(),
  area: z.number().positive('El área debe ser positiva').optional(),
  condominiumId: z.string().uuid('ID de condominio inválido'),
  groupId: z.string().uuid('ID de grupo inválido').nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const updatePropertySchema = z.object({
  identifier: z.string().min(1).max(50).optional(),
  type: z
    .enum([
      PropertyType.APARTMENT,
      PropertyType.OFFICE,
      PropertyType.COMMERCIAL,
      PropertyType.PARKING,
      PropertyType.STORAGE,
      PropertyType.OTHER,
    ])
    .optional(),
  description: z.string().nullable().optional(),
  floor: z.number().int().nullable().optional(),
  area: z.number().positive().nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const movePropertySchema = z.object({
  groupId: z.string().uuid('ID de grupo inválido').nullable(),
});

/**
 * Controller for property management
 *
 * Provides endpoints for managing properties (leaf nodes) within condominiums.
 * Requires authentication and appropriate permissions.
 *
 * Endpoints:
 * - GET /api/properties - List properties for a condominium
 * - GET /api/properties/stats - Get property statistics for a condominium
 * - GET /api/properties/:id - Get a specific property
 * - POST /api/properties - Create a new property
 * - PATCH /api/properties/:id - Update a property
 * - PATCH /api/properties/:id/move - Move a property to a different group
 * - DELETE /api/properties/:id - Delete (soft) a property
 */
@Controller('properties')
@UseGuards(JwtAuthGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  /**
   * List properties for a condominium with optional filters
   *
   * GET /api/properties
   *
   * Query params:
   * - condominiumId: Required - ID of the condominium
   * - groupId: Filter by group (use 'null' for properties without group)
   * - type: Filter by property type
   * - isActive: Filter by active status
   * - search: Search by identifier
   * - page: Page number (default 1)
   * - limit: Items per page (default 50)
   * - orderBy: Sort field (identifier, type, createdAt, displayOrder)
   * - order: Sort direction (asc, desc)
   *
   * @returns Paginated list of properties (200)
   */
  @Get()
  async findAll(
    @Query('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query('groupId') groupId?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: string,
  ) {
    return this.propertiesService.findAll({
      condominiumId,
      groupId: groupId === 'null' ? null : groupId ? groupId : undefined,
      type: type as PropertyType | undefined,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 50,
      orderBy: orderBy as
        | 'identifier'
        | 'type'
        | 'createdAt'
        | 'displayOrder'
        | undefined,
      order: (order as 'asc' | 'desc') || 'asc',
    });
  }

  /**
   * Get property statistics for a condominium
   *
   * GET /api/properties/stats
   *
   * @returns Property counts by type and total (200)
   */
  @Get('stats')
  async getStats(@Query('condominiumId', ParseUUIDPipe) condominiumId: string) {
    const [countByType, total] = await Promise.all([
      this.propertiesService.getCountByType(condominiumId),
      this.propertiesService.getTotalCount(condominiumId),
    ]);

    return {
      total,
      byType: countByType,
    };
  }

  /**
   * Get a specific property by ID
   *
   * GET /api/properties/:id
   *
   * @returns Property details (200)
   * @throws NotFoundException if property not found (404)
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const property = await this.propertiesService.findByIdWithRelations(id);
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  /**
   * Create a new property
   *
   * POST /api/properties
   *
   * @returns Created property (201)
   * @throws BadRequestException for validation errors, duplicate identifier, or limit exceeded (400)
   * @throws NotFoundException if condominium or group not found (404)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = createPropertySchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    return this.propertiesService.create(result.data);
  }

  /**
   * Update a property
   *
   * PATCH /api/properties/:id
   *
   * @returns Updated property (200)
   * @throws BadRequestException for validation errors or duplicate identifier (400)
   * @throws NotFoundException if property not found (404)
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const result = updatePropertySchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    const property = await this.propertiesService.update(id, result.data);
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  /**
   * Move a property to a different group
   *
   * PATCH /api/properties/:id/move
   *
   * @returns Moved property (200)
   * @throws BadRequestException for invalid move (400)
   * @throws NotFoundException if property or group not found (404)
   */
  @Patch(':id/move')
  async move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const result = movePropertySchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    const property = await this.propertiesService.move(id, result.data.groupId);
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  /**
   * Delete (soft) a property
   *
   * DELETE /api/properties/:id
   *
   * @returns 204 No Content
   * @throws BadRequestException if property has active residents (400)
   * @throws NotFoundException if property not found (404)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.propertiesService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
  }
}
