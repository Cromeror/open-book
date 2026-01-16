import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../auth/guards';
import { SuperAdminGuard } from '../../permissions';
import { PropertyType } from '../../../entities/property.entity';

import { AdminPropertiesService } from './admin-properties.service';

/**
 * Admin controller for properties (SuperAdmin only)
 *
 * Provides unrestricted access to all properties.
 *
 * Endpoints:
 * - GET /admin/properties - List all properties with filters
 * - GET /admin/properties/stats - Get property statistics
 * - GET /admin/properties/:id - Get a specific property
 */
@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminPropertiesController {
  constructor(
    private readonly adminPropertiesService: AdminPropertiesService,
  ) {}

  /**
   * List all properties (admin view)
   *
   * GET /admin/properties
   *
   * Query params:
   * - condominiumId: Filter by condominium (optional for admin)
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
    @Query('condominiumId') condominiumId?: string,
    @Query('groupId') groupId?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: string,
  ) {
    return this.adminPropertiesService.findAll({
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
   * GET /admin/properties/stats
   *
   * @returns Property counts by type and total (200)
   */
  @Get('stats')
  async getStats(@Query('condominiumId', ParseUUIDPipe) condominiumId: string) {
    return this.adminPropertiesService.getStats(condominiumId);
  }

  /**
   * Get a specific property by ID (admin view)
   *
   * GET /admin/properties/:id
   *
   * @returns Property details with relations (200)
   * @throws NotFoundException if not found (404)
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const property = await this.adminPropertiesService.findById(id);
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }
}
