import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  UseGuards,
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

import { AdminResourcesService } from './resources.service';

// Zod schemas for validation
const resourceCapabilitySchema = z.object({
  name: z.string().min(1, 'name is required'),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  urlPattern: z.string(), // Can be empty string
  permission: z.string().optional(),
});

const createResourceSchema = z.object({
  code: z
    .string()
    .min(1, 'code is required')
    .max(50)
    .regex(/^[a-z][a-z0-9_-]*$/, 'code must be lowercase alphanumeric with underscores or hyphens'),
  name: z.string().min(1, 'name is required').max(100),
  scope: z.enum(['global', 'condominium']),
  baseUrl: z.string().min(1, 'baseUrl is required').max(255),
  capabilities: z.array(resourceCapabilitySchema),
});

const updateResourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  scope: z.enum(['global', 'condominium']).optional(),
  baseUrl: z.string().min(1).max(255).optional(),
  capabilities: z.array(resourceCapabilitySchema).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Controller for resource management (SuperAdmin only)
 *
 * All endpoints require SuperAdmin authentication.
 *
 * Endpoints:
 * - GET /api/admin/resources - List all resources with pagination
 * - GET /api/admin/resources/:code - Get a specific resource by code
 * - POST /api/admin/resources - Create a new resource
 * - PATCH /api/admin/resources/:code - Update a resource
 * - DELETE /api/admin/resources/:code - Delete (soft) a resource
 * - POST /api/admin/resources/:code/toggle - Toggle active status
 */
@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminResourcesController {
  constructor(private readonly resourcesService: AdminResourcesService) {}

  /**
   * List all resources with pagination and optional search
   *
   * GET /api/admin/resources
   */
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('scope') scope?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: string,
  ) {
    return this.resourcesService.findAll({
      search,
      scope: scope as 'global' | 'condominium' | undefined,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 50,
      orderBy: orderBy as 'code' | 'name' | 'createdAt' | undefined,
      order: (order as 'asc' | 'desc') || 'asc',
    });
  }

  /**
   * Get a specific resource by code
   *
   * GET /api/admin/resources/:code
   */
  @Get(':code')
  async findOne(@Param('code') code: string) {
    const resource = await this.resourcesService.findByCode(code);
    if (!resource) {
      throw new NotFoundException(`Resource with code '${code}' not found`);
    }
    return resource;
  }

  /**
   * Create a new resource
   *
   * POST /api/admin/resources
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = createResourceSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation error',
        errors: messages,
      });
    }

    // Check for duplicate code
    const exists = await this.resourcesService.existsByCode(result.data.code);
    if (exists) {
      throw new ConflictException(
        `Resource with code '${result.data.code}' already exists`,
      );
    }

    return this.resourcesService.create(result.data);
  }

  /**
   * Update a resource
   *
   * PATCH /api/admin/resources/:code
   */
  @Patch(':code')
  async update(@Param('code') code: string, @Body() body: unknown) {
    const result = updateResourceSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation error',
        errors: messages,
      });
    }

    const resource = await this.resourcesService.updateByCode(code, result.data);
    if (!resource) {
      throw new NotFoundException(`Resource with code '${code}' not found`);
    }
    return resource;
  }

  /**
   * Delete (soft) a resource
   *
   * DELETE /api/admin/resources/:code
   */
  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('code') code: string) {
    const deleted = await this.resourcesService.deleteByCode(code);
    if (!deleted) {
      throw new NotFoundException(`Resource with code '${code}' not found`);
    }
  }

  /**
   * Toggle resource active status
   *
   * POST /api/admin/resources/:code/toggle
   */
  @Post(':code/toggle')
  async toggle(@Param('code') code: string) {
    const resource = await this.resourcesService.toggleByCode(code);
    if (!resource) {
      throw new NotFoundException(`Resource with code '${code}' not found`);
    }
    return resource;
  }
}
