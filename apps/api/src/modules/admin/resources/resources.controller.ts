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
const createResourceSchema = z.object({
  code: z
    .string()
    .min(1, 'code is required')
    .max(50)
    .regex(/^[a-z][a-z0-9_-]*$/, 'code must be lowercase alphanumeric with underscores or hyphens'),
  name: z.string().min(1, 'name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  templateUrl: z.string().min(1, 'templateUrl is required').max(255),
});

const updateResourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  templateUrl: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
});

const assignHttpMethodSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
  payloadMetadata: z.string().optional(),
  responseMetadata: z.string().optional(),
});

const paramMappingSchema = z.object({
  responseField: z.string().min(1),
  urlParam: z.string().min(1),
});

const replaceLinksSchema = z.array(
  z.object({
    rel: z.string().min(1).max(64),
    targetHttpMethodId: z.string().uuid('targetHttpMethodId must be a UUID'),
    paramMappings: z.array(paramMappingSchema).default([]),
  }),
);

/**
 * Controller for resource management (SuperAdmin only)
 *
 * All endpoints require SuperAdmin authentication.
 *
 * Endpoints:
 * - GET    /admin/resources                        - List all resources
 * - GET    /admin/resources/:code                  - Get a resource by code
 * - POST   /admin/resources                        - Create a resource
 * - PATCH  /admin/resources/:code                  - Update a resource
 * - DELETE /admin/resources/:code                  - Soft delete a resource
 * - POST   /admin/resources/:code/toggle           - Toggle active status
 * - POST   /admin/resources/:code/http-methods     - Assign an HTTP method
 * - DELETE /admin/resources/:code/http-methods/:method - Remove an HTTP method
 */
@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminResourcesController {
  constructor(private readonly resourcesService: AdminResourcesService) {}

  /**
   * GET /admin/resources
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
    return this.resourcesService.findAll({
      search,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 50,
      orderBy: orderBy as 'code' | 'name' | 'createdAt' | undefined,
      order: (order as 'asc' | 'desc') || 'asc',
    });
  }

  /**
   * GET /admin/resources/:code
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
   * POST /admin/resources
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

    const exists = await this.resourcesService.existsByCode(result.data.code);
    if (exists) {
      throw new ConflictException(
        `Resource with code '${result.data.code}' already exists`,
      );
    }

    return this.resourcesService.create(result.data);
  }

  /**
   * PATCH /admin/resources/:code
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
   * DELETE /admin/resources/:code
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
   * POST /admin/resources/:code/toggle
   */
  @Post(':code/toggle')
  async toggle(@Param('code') code: string) {
    const resource = await this.resourcesService.toggleByCode(code);
    if (!resource) {
      throw new NotFoundException(`Resource with code '${code}' not found`);
    }
    return resource;
  }

  /**
   * POST /admin/resources/:code/http-methods
   *
   * Assigns an HTTP method to a resource. If the method is already assigned,
   * updates its metadata.
   */
  @Post(':code/http-methods')
  @HttpCode(HttpStatus.CREATED)
  async assignHttpMethod(
    @Param('code') code: string,
    @Body() body: unknown,
  ) {
    const result = assignHttpMethodSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation error',
        errors: messages,
      });
    }

    const resource = await this.resourcesService.findByCode(code);
    if (!resource) {
      throw new NotFoundException(`Resource with code '${code}' not found`);
    }

    return this.resourcesService.assignHttpMethod(resource.id, result.data);
  }

  /**
   * DELETE /admin/resources/:code/http-methods/:method
   *
   * Removes an HTTP method from a resource.
   */
  @Delete(':code/http-methods/:method')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeHttpMethod(
    @Param('code') code: string,
    @Param('method') method: string,
  ) {
    const resource = await this.resourcesService.findByCode(code);
    if (!resource) {
      throw new NotFoundException(`Resource with code '${code}' not found`);
    }

    const deleted = await this.resourcesService.removeHttpMethod(
      resource.id,
      method.toUpperCase(),
    );
    if (!deleted) {
      throw new NotFoundException(
        `Method '${method.toUpperCase()}' not assigned to resource '${code}'`,
      );
    }
  }

  /**
   * PUT /admin/resources/:code/http-methods/:methodId/links
   *
   * Replaces all outbound HATEOAS links for a specific resource HTTP method.
   * Accepts an array of link configs; deletes existing ones and inserts the new set.
   *
   * @param methodId - UUID of the resource_http_methods row
   */
  @Put(':code/http-methods/:methodId/links')
  async replaceLinks(
    @Param('code') code: string,
    @Param('methodId') methodId: string,
    @Body() body: unknown,
  ) {
    const resource = await this.resourcesService.findByCode(code);
    if (!resource) {
      throw new NotFoundException(`Resource with code '${code}' not found`);
    }

    const rhm = (resource.httpMethods ?? []).find((m) => m.id === methodId);
    if (!rhm) {
      throw new NotFoundException(
        `HTTP method '${methodId}' not found in resource '${code}'`,
      );
    }

    const result = replaceLinksSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message);
      throw new BadRequestException({ statusCode: 400, message: 'Validation error', errors: messages });
    }

    return this.resourcesService.replaceLinks(methodId, result.data);
  }
}
