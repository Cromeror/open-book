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
import { RelationType, AssociationStatus } from '../../entities/property-resident.entity';

import { PropertyResidentsService } from './property-residents.service';

// Zod schemas for validation
const createPropertyResidentSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  userId: z.string().uuid('ID de usuario inválido'),
  relationType: z.enum([RelationType.OWNER, RelationType.TENANT, RelationType.OTHER]),
  startDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  isPrimary: z.boolean().optional(),
});

const updatePropertyResidentSchema = z.object({
  relationType: z.enum([RelationType.OWNER, RelationType.TENANT, RelationType.OTHER]).optional(),
  startDate: z.string().datetime().nullable().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().datetime().nullable().optional().transform((val) => val ? new Date(val) : undefined),
  isPrimary: z.boolean().optional(),
});

const rejectSchema = z.object({
  rejectionReason: z.string().min(1, 'El motivo de rechazo es requerido').max(500),
});

const setPrimarySchema = z.object({
  residentId: z.string().uuid('ID de residente inválido'),
});

/**
 * Request interface with user info
 */
interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
  };
}

/**
 * Controller for property-resident association management
 *
 * Provides endpoints for managing the relationship between users and properties.
 * Requires authentication and appropriate permissions.
 *
 * Endpoints:
 * - GET /api/property-residents - List associations with filters
 * - GET /api/property-residents/my-properties - Get current user's properties
 * - GET /api/property-residents/:id - Get a specific association
 * - POST /api/property-residents - Create a new association
 * - PATCH /api/property-residents/:id - Update an association
 * - PATCH /api/property-residents/:id/approve - Approve a pending association
 * - PATCH /api/property-residents/:id/reject - Reject a pending association
 * - PATCH /api/property-residents/:id/deactivate - Deactivate an active association
 * - DELETE /api/property-residents/:id - Delete (soft) an association
 *
 * Property-specific endpoints:
 * - GET /api/property-residents/property/:propertyId - Get residents for a property
 * - GET /api/property-residents/property/:propertyId/primary - Get primary contact
 * - PATCH /api/property-residents/property/:propertyId/primary - Set primary contact
 */
@Controller('property-residents')
@UseGuards(JwtAuthGuard)
export class PropertyResidentsController {
  constructor(
    private readonly propertyResidentsService: PropertyResidentsService,
  ) {}

  /**
   * List property-resident associations with filters
   *
   * GET /api/property-residents
   *
   * Query params:
   * - propertyId: Filter by property
   * - userId: Filter by user
   * - condominiumId: Filter by condominium
   * - status: Filter by status (PENDING, ACTIVE, INACTIVE, REJECTED)
   * - relationType: Filter by relation type (OWNER, TENANT, OTHER)
   * - page: Page number (default 1)
   * - limit: Items per page (default 50)
   *
   * @returns Paginated list of associations (200)
   */
  @Get()
  async findAll(
    @Query('propertyId') propertyId?: string,
    @Query('userId') userId?: string,
    @Query('condominiumId') condominiumId?: string,
    @Query('status') status?: string,
    @Query('relationType') relationType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.propertyResidentsService.findAll({
      propertyId,
      userId,
      condominiumId,
      status: status as AssociationStatus | undefined,
      relationType: relationType as RelationType | undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 50,
    });
  }

  /**
   * Get current user's property associations
   *
   * GET /api/property-residents/my-properties
   *
   * @returns List of user's property associations (200)
   */
  @Get('my-properties')
  async getMyProperties(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
  ) {
    return this.propertyResidentsService.findByUserId(
      req.user.userId,
      status as AssociationStatus | undefined,
    );
  }

  /**
   * Get residents for a specific property
   *
   * GET /api/property-residents/property/:propertyId
   *
   * Access control:
   * - Administrators (condominium managers) see all residents
   * - Residents only see themselves
   *
   * @returns List of active residents (200)
   * @throws ForbiddenException if user has no access (403)
   */
  @Get('property/:propertyId')
  async getPropertyResidents(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.propertyResidentsService.findActiveByPropertyId(
      propertyId,
      req.user.userId,
    );
  }

  /**
   * Get primary contact for a property
   *
   * GET /api/property-residents/property/:propertyId/primary
   *
   * @returns Primary contact or null (200)
   */
  @Get('property/:propertyId/primary')
  async getPrimaryContact(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
  ) {
    return this.propertyResidentsService.getPrimaryContact(propertyId);
  }

  /**
   * Set primary contact for a property
   *
   * PATCH /api/property-residents/property/:propertyId/primary
   *
   * @returns Updated association (200)
   * @throws NotFoundException if association not found (404)
   */
  @Patch('property/:propertyId/primary')
  async setPrimaryContact(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Body() body: unknown,
  ) {
    const result = setPrimarySchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    const association = await this.propertyResidentsService.setPrimaryContact(
      propertyId,
      result.data.residentId,
    );
    if (!association) {
      throw new NotFoundException(
        'Active association not found for the specified property and resident',
      );
    }
    return association;
  }

  /**
   * Get a specific association by ID
   *
   * GET /api/property-residents/:id
   *
   * @returns Association details (200)
   * @throws NotFoundException if not found (404)
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const association = await this.propertyResidentsService.findById(id);
    if (!association) {
      throw new NotFoundException(`Association with ID ${id} not found`);
    }
    return association;
  }

  /**
   * Create a new property-resident association
   *
   * POST /api/property-residents
   *
   * @returns Created association (201)
   * @throws BadRequestException for validation errors or duplicate (400)
   * @throws NotFoundException if property or user not found (404)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = createPropertyResidentSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    return this.propertyResidentsService.create(result.data);
  }

  /**
   * Update an association
   *
   * PATCH /api/property-residents/:id
   *
   * @returns Updated association (200)
   * @throws BadRequestException for validation errors (400)
   * @throws NotFoundException if not found (404)
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const result = updatePropertyResidentSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    const association = await this.propertyResidentsService.update(
      id,
      result.data,
    );
    if (!association) {
      throw new NotFoundException(`Association with ID ${id} not found`);
    }
    return association;
  }

  /**
   * Approve a pending association
   *
   * PATCH /api/property-residents/:id/approve
   *
   * @returns Approved association (200)
   * @throws BadRequestException if not pending (400)
   * @throws NotFoundException if not found (404)
   */
  @Patch(':id/approve')
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const association = await this.propertyResidentsService.approve(id, {
      approvedBy: req.user.userId,
    });
    if (!association) {
      throw new NotFoundException(`Association with ID ${id} not found`);
    }
    return association;
  }

  /**
   * Reject a pending association
   *
   * PATCH /api/property-residents/:id/reject
   *
   * @returns Rejected association (200)
   * @throws BadRequestException if not pending or missing reason (400)
   * @throws NotFoundException if not found (404)
   */
  @Patch(':id/reject')
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown,
  ) {
    const result = rejectSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    const association = await this.propertyResidentsService.reject(id, {
      approvedBy: req.user.userId,
      rejectionReason: result.data.rejectionReason,
    });
    if (!association) {
      throw new NotFoundException(`Association with ID ${id} not found`);
    }
    return association;
  }

  /**
   * Deactivate an active association
   *
   * PATCH /api/property-residents/:id/deactivate
   *
   * @returns Deactivated association (200)
   * @throws BadRequestException if not active (400)
   * @throws NotFoundException if not found (404)
   */
  @Patch(':id/deactivate')
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    const association = await this.propertyResidentsService.deactivate(id);
    if (!association) {
      throw new NotFoundException(`Association with ID ${id} not found`);
    }
    return association;
  }

  /**
   * Delete (soft) an association
   *
   * DELETE /api/property-residents/:id
   *
   * @returns 204 No Content
   * @throws NotFoundException if not found (404)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.propertyResidentsService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Association with ID ${id} not found`);
    }
  }
}
