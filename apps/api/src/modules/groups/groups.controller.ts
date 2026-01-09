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

import { GroupsService } from './groups.service';

// Zod schemas for validation
const createGroupSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().optional(),
  condominiumId: z.string().uuid('ID de condominio inválido'),
  parentId: z.string().uuid('ID de grupo padre inválido').nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const moveGroupSchema = z.object({
  parentId: z.string().uuid('ID de grupo padre inválido').nullable(),
});

/**
 * Controller for group management
 *
 * Provides endpoints for managing hierarchical groups within condominiums.
 * Requires authentication and appropriate permissions.
 *
 * Endpoints:
 * - GET /api/groups - List groups for a condominium
 * - GET /api/groups/tree - Get full group tree for a condominium
 * - GET /api/groups/:id - Get a specific group
 * - GET /api/groups/:id/children - Get children of a group
 * - GET /api/groups/:id/ancestors - Get ancestors of a group
 * - GET /api/groups/:id/descendants - Get all descendants of a group
 * - POST /api/groups - Create a new group
 * - PATCH /api/groups/:id - Update a group
 * - PATCH /api/groups/:id/move - Move a group to a new parent
 * - DELETE /api/groups/:id - Delete (soft) a group
 */
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * List groups for a condominium with optional filters
   *
   * GET /api/groups
   *
   * Query params:
   * - condominiumId: Required - ID of the condominium
   * - parentId: Filter by parent (use 'null' for root groups)
   * - isActive: Filter by active status
   * - page: Page number (default 1)
   * - limit: Items per page (default 50)
   *
   * @returns Paginated list of groups (200)
   */
  @Get()
  async findAll(
    @Query('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query('parentId') parentId?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.groupsService.findAll({
      condominiumId,
      parentId:
        parentId === 'null' ? null : parentId ? parentId : undefined,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 50,
    });
  }

  /**
   * Get the full group tree for a condominium
   *
   * GET /api/groups/tree
   *
   * @returns Full tree structure of groups (200)
   */
  @Get('tree')
  async getTree(@Query('condominiumId', ParseUUIDPipe) condominiumId: string) {
    return this.groupsService.getTree(condominiumId);
  }

  /**
   * Get a specific group by ID
   *
   * GET /api/groups/:id
   *
   * @returns Group details (200)
   * @throws NotFoundException if group not found (404)
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const group = await this.groupsService.findById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  /**
   * Get children of a group
   *
   * GET /api/groups/:id/children
   *
   * @returns List of child groups (200)
   * @throws NotFoundException if group not found (404)
   */
  @Get(':id/children')
  async getChildren(@Param('id', ParseUUIDPipe) id: string) {
    const group = await this.groupsService.findById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.groupsService.findAll({
      condominiumId: group.condominiumId,
      parentId: id,
    });
  }

  /**
   * Get ancestors of a group (from root to parent)
   *
   * GET /api/groups/:id/ancestors
   *
   * @returns List of ancestor groups (200)
   * @throws NotFoundException if group not found (404)
   */
  @Get(':id/ancestors')
  async getAncestors(@Param('id', ParseUUIDPipe) id: string) {
    const group = await this.groupsService.findById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.groupsService.getAncestors(id);
  }

  /**
   * Get all descendants of a group
   *
   * GET /api/groups/:id/descendants
   *
   * @returns List of descendant groups (200)
   * @throws NotFoundException if group not found (404)
   */
  @Get(':id/descendants')
  async getDescendants(@Param('id', ParseUUIDPipe) id: string) {
    const group = await this.groupsService.findById(id);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return this.groupsService.getDescendants(id);
  }

  /**
   * Create a new group
   *
   * POST /api/groups
   *
   * @returns Created group (201)
   * @throws BadRequestException for validation errors or limit exceeded (400)
   * @throws NotFoundException if condominium or parent not found (404)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = createGroupSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    return this.groupsService.create(result.data);
  }

  /**
   * Update a group
   *
   * PATCH /api/groups/:id
   *
   * @returns Updated group (200)
   * @throws BadRequestException for validation errors (400)
   * @throws NotFoundException if group not found (404)
   */
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const result = updateGroupSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    const group = await this.groupsService.update(id, result.data);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  /**
   * Move a group to a new parent
   *
   * PATCH /api/groups/:id/move
   *
   * @returns Moved group (200)
   * @throws BadRequestException for invalid move (400)
   * @throws NotFoundException if group or new parent not found (404)
   */
  @Patch(':id/move')
  async move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const result = moveGroupSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Error de validación',
        errors: messages,
      });
    }

    const group = await this.groupsService.move(id, result.data.parentId);
    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
    return group;
  }

  /**
   * Delete (soft) a group
   *
   * DELETE /api/groups/:id
   *
   * @returns 204 No Content
   * @throws BadRequestException if group has children or properties (400)
   * @throws NotFoundException if group not found (404)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const deleted = await this.groupsService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }
  }
}
