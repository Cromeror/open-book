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
import { z } from 'zod';

import { JwtAuthGuard } from '../auth/guards';
import { PropertyType } from '../../entities/property.entity';

import { PropertiesService } from './properties.service';

/**
 * Request interface with user info from JWT
 */
interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}

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
    @Req() req: AuthenticatedRequest,
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
      requestingUserId: req.user.userId,
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
   * @throws ForbiddenException if user doesn't have access to the condominium (403)
   */
  @Get('stats')
  async getStats(
    @Req() req: AuthenticatedRequest,
    @Query('condominiumId', ParseUUIDPipe) condominiumId: string,
  ) {
    // Validate user can access this condominium
    await this.propertiesService.validateCondominiumAccess(
      req.user.userId,
      condominiumId,
    );

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
   * @throws ForbiddenException if user doesn't have access to the property (403)
   * @throws NotFoundException if property not found (404)
   */
  @Get(':id')
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    // Validate user can access this property
    await this.propertiesService.validatePropertyAccess(req.user.userId, id);

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
   * Only condominium managers can create properties.
   *
   * @returns Created property (201)
   * @throws BadRequestException for validation errors, duplicate identifier, or limit exceeded (400)
   * @throws ForbiddenException if user is not a manager of the condominium (403)
   * @throws NotFoundException if condominium or group not found (404)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    const result = createPropertySchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    // Only managers can create properties
    await this.propertiesService.validateManagerAccessByCondominium(
      req.user.userId,
      result.data.condominiumId,
    );

    return this.propertiesService.create(result.data);
  }

  /**
   * Update a property
   *
   * PATCH /api/properties/:id
   *
   * Only condominium managers can update properties.
   *
   * @returns Updated property (200)
   * @throws BadRequestException for validation errors or duplicate identifier (400)
   * @throws ForbiddenException if user is not a manager of the condominium (403)
   * @throws NotFoundException if property not found (404)
   */
  @Patch(':id')
  async update(
    @Req() req: AuthenticatedRequest,
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

    // Only managers can update properties
    await this.propertiesService.validateManagerAccess(req.user.userId, id);

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
   * Only condominium managers can move properties.
   *
   * @returns Moved property (200)
   * @throws BadRequestException for invalid move (400)
   * @throws ForbiddenException if user is not a manager of the condominium (403)
   * @throws NotFoundException if property or group not found (404)
   */
  @Patch(':id/move')
  async move(
    @Req() req: AuthenticatedRequest,
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

    // Only managers can move properties
    await this.propertiesService.validateManagerAccess(req.user.userId, id);

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
   * Only condominium managers can delete properties.
   *
   * @returns 204 No Content
   * @throws BadRequestException if property has active residents (400)
   * @throws ForbiddenException if user is not a manager of the condominium (403)
   * @throws NotFoundException if property not found (404)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    // Only managers can delete properties
    await this.propertiesService.validateManagerAccess(req.user.userId, id);

    const deleted = await this.propertiesService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
  }
}
