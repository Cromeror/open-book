import {
  Controller,
  Get,
  Post,
  Put,
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

import { SuperAdminGuard } from '../../permissions/guards/superadmin.guard';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../auth/guards';

// Zod schemas for validation
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Controller for user management (SuperAdmin only)
 *
 * All endpoints require SuperAdmin authentication.
 *
 * Endpoints:
 * - GET /api/admin/users - List all users with pagination
 * - GET /api/admin/users/:id - Get a specific user by ID
 * - POST /api/admin/users - Create a new user
 * - PATCH /api/admin/users/:id - Update a user
 * - DELETE /api/admin/users/:id - Delete (soft) a user
 */
@Controller()
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

  /**
   * Create a new user
   *
   * POST /api/admin/users
   *
   * @returns Created user (201)
   * @throws BadRequestException for validation errors (400)
   * @throws ConflictException if email already exists (409)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    return this.usersService.createByAdmin(result.data);
  }

  /**
   * Update a user
   *
   * PATCH /api/admin/users/:id
   *
   * @returns Updated user (200)
   * @throws BadRequestException for validation errors (400)
   * @throws NotFoundException if user not found (404)
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    const user = await this.usersService.updateByAdmin(id, result.data);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Replace a user (full update)
   *
   * PUT /api/admin/users/:id
   *
   * @returns Updated user (200)
   * @throws BadRequestException for validation errors (400)
   * @throws NotFoundException if user not found (404)
   */
  @Put(':id')
  async replace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    const user = await this.usersService.updateByAdmin(id, result.data);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Delete (soft) a user
   *
   * DELETE /api/admin/users/:id
   *
   * @returns 204 No Content
   * @throws NotFoundException if user not found (404)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.usersService.deleteByAdmin(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
