import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards';
import { SuperAdminGuard } from '../../permissions';
import { AssociationStatus, RelationType } from '../../../entities/property-resident.entity';

import { AdminPropertyResidentsService } from './admin-property-residents.service';

/**
 * Admin controller for property residents (SuperAdmin only)
 *
 * Provides unrestricted access to all property-resident associations.
 *
 * Endpoints:
 * - GET /admin/property-residents - List all associations with filters
 * - GET /admin/property-residents/property/:propertyId - Get all residents for a property
 */
@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminPropertyResidentsController {
  constructor(
    private readonly adminPropertyResidentsService: AdminPropertyResidentsService,
  ) {}

  /**
   * List all property-resident associations (admin view)
   *
   * GET /admin/property-residents
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
    return this.adminPropertyResidentsService.findAll({
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
   * Get all residents for a specific property (admin view)
   *
   * GET /admin/property-residents/property/:propertyId
   *
   * @returns List of all residents (including inactive) (200)
   */
  @Get('property/:propertyId')
  async getPropertyResidents(
    @Param('propertyId', ParseUUIDPipe) propertyId: string,
    @Query('status') status?: string,
  ) {
    return this.adminPropertyResidentsService.findByPropertyId(
      propertyId,
      status as AssociationStatus | undefined,
    );
  }
}
