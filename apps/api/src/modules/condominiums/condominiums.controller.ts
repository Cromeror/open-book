import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../permissions/decorators';
import { User } from '../../entities/user.entity';
import { CondominiumsService } from './condominiums.service';

/**
 * Controller for regular users to access their assigned condominiums
 *
 * Endpoints:
 * - GET /api/condominiums - List user's assigned condominiums
 * - GET /api/condominiums/primary - Get user's primary condominium
 * - GET /api/condominiums/:id - Get specific condominium (requires query param ?condominiumId=)
 *
 * Key characteristics:
 * - Requires authentication (JwtAuthGuard)
 * - Access controlled via condominium_managers table
 * - All endpoints scoped to authenticated user
 * - Read-only access (no create, update, delete)
 */
@Controller('condominiums')
@UseGuards(JwtAuthGuard)
export class CondominiumsController {
  constructor(private readonly condominiumsService: CondominiumsService) {}

  /**
   * Get all condominiums assigned to the current user
   *
   * GET /api/condominiums
   *
   * Returns a list of condominiums where the user is assigned as a manager.
   * Only active assignments and active condominiums are returned.
   *
   * @returns Array of condominium summaries with isPrimary flag
   */
  @Get()
  async findAll(@CurrentUser() user: User) {
    return this.condominiumsService.findAllForUser(user.id);
  }

  /**
   * Get user's primary condominium
   *
   * GET /api/condominiums/primary
   *
   * Returns the condominium marked as primary for the user,
   * or the first assigned condominium if none is marked as primary.
   *
   * @returns Primary condominium or null if user has no assignments
   */
  @Get('primary')
  async getPrimary(@CurrentUser() user: User) {
    return this.condominiumsService.getPrimaryForUser(user.id);
  }

  /**
   * Get a specific condominium by ID
   *
   * GET /api/condominiums/:id?condominiumId=<uuid>
   *
   * Requires the condominiumId query parameter to validate access.
   * This design ensures explicit intent and prevents accidental cross-condominium access.
   *
   * @param id - Condominium ID from URL path (for REST convention)
   * @param condominiumId - Condominium ID from query string (for validation)
   * @param user - Current authenticated user
   *
   * @returns Detailed condominium information
   * @throws BadRequestException if condominiumId query param is missing
   * @throws ForbiddenException if user doesn't have access to this condominium
   * @throws NotFoundException if condominium doesn't exist
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('condominiumId', ParseUUIDPipe) condominiumId: string,
    @CurrentUser() user: User,
  ) {
    // Validate that path ID matches query condominiumId
    if (id !== condominiumId) {
      throw new Error('Path ID must match condominiumId query parameter');
    }

    return this.condominiumsService.findOne(condominiumId, user.id);
  }
}
