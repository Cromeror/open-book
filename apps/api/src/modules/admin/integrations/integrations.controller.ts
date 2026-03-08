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
import { AdminIntegrationsService } from './integrations.service';

const AUTH_TYPES = ['none', 'bearer', 'basic', 'api_key', 'devise_token_auth'] as const;
const CONNECTION_TYPES = ['passthrough', 'oauth', 'api_key_stored'] as const;

const createIntegrationSchema = z.object({
  code: z
    .string()
    .min(1, 'code is required')
    .max(50)
    .regex(/^[a-z][a-z0-9_-]*$/, 'code must be lowercase alphanumeric with underscores or hyphens'),
  name: z.string().min(1, 'name is required').max(100),
  description: z.string().max(500).optional().nullable(),
  baseUrl: z.string().url('baseUrl must be a valid URL').max(500),
  authType: z.enum(AUTH_TYPES),
  authConfig: z.record(z.string(), z.unknown()).optional().nullable(),
  connectionType: z.enum(CONNECTION_TYPES).default('passthrough'),
});

const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  baseUrl: z.string().url('baseUrl must be a valid URL').max(500).optional(),
  authType: z.enum(AUTH_TYPES).optional(),
  authConfig: z.record(z.string(), z.unknown()).optional().nullable(),
  connectionType: z.enum(CONNECTION_TYPES).optional(),
  isActive: z.boolean().optional(),
});

@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminIntegrationsController {
  constructor(private readonly integrationsService: AdminIntegrationsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('connectionType') connectionType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: string,
  ) {
    return this.integrationsService.findAll({
      search,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      connectionType,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 50,
      orderBy: orderBy as 'code' | 'name' | 'createdAt' | undefined,
      order: (order as 'asc' | 'desc') || 'asc',
    });
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    const integration = await this.integrationsService.findByCode(code);
    if (!integration) {
      throw new NotFoundException(`Integration with code '${code}' not found`);
    }
    return integration;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = createIntegrationSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation error',
        errors: messages,
      });
    }

    const exists = await this.integrationsService.existsByCode(result.data.code);
    if (exists) {
      throw new ConflictException(
        `Integration with code '${result.data.code}' already exists`,
      );
    }

    return this.integrationsService.create(result.data);
  }

  @Patch(':code')
  async update(@Param('code') code: string, @Body() body: unknown) {
    const result = updateIntegrationSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation error',
        errors: messages,
      });
    }

    const integration = await this.integrationsService.updateByCode(code, result.data);
    if (!integration) {
      throw new NotFoundException(`Integration with code '${code}' not found`);
    }
    return integration;
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('code') code: string) {
    const deleted = await this.integrationsService.deleteByCode(code);
    if (!deleted) {
      throw new NotFoundException(`Integration with code '${code}' not found`);
    }
  }

  @Post(':code/toggle')
  async toggle(@Param('code') code: string) {
    const integration = await this.integrationsService.toggleByCode(code);
    if (!integration) {
      throw new NotFoundException(`Integration with code '${code}' not found`);
    }
    return integration;
  }
}
