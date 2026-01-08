import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Param,
  NotFoundException,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards';
import { SuperAdminGuard } from '../permissions/guards/superadmin.guard';

import { UsersService } from './users.service';

/**
 * Controller for user management (SuperAdmin only)
 *
 * All endpoints require SuperAdmin authentication.
 *
 * Endpoints:
 * - GET /api/admin/users - List all users with pagination
 * - GET /api/admin/users/:id - Get a specific user by ID
 */
@Controller('admin/users')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * List all users with pagination and optional search
   *
   * GET /api/admin/users
   *
   * Query params:
   * - search: Search by email, firstName, or lastName (partial match)
   * - isActive: Filter by active status (true/false)
   * - page: Page number (default 1)
   * - limit: Items per page (default 20, max 100)
   * - orderBy: Sort field (email, firstName, lastName, createdAt, lastLoginAt)
   * - order: Sort direction (asc, desc)
   *
   * @returns Paginated list of users (200)
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
    return this.usersService.findAll({
      search,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
      orderBy: orderBy as 'email' | 'firstName' | 'lastName' | 'createdAt' | 'lastLoginAt' | undefined,
      order: (order as 'asc' | 'desc') || 'asc',
    });
  }

  /**
   * Get a specific user by ID
   *
   * GET /api/admin/users/:id
   *
   * @returns User details (200)
   * @throws NotFoundException if user not found (404)
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findByIdForAdmin(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
