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
import { AdminOrganizationsService } from './organizations.service';

const credentialsSchema = z.object({
  email: z.string().email('email must be valid'),
  password: z.string().min(1, 'password is required'),
}).optional().nullable();

const createOrganizationSchema = z.object({
  code: z
    .string()
    .min(1, 'code is required')
    .max(50)
    .regex(/^[a-z][a-z0-9_-]*$/, 'code must be lowercase alphanumeric with underscores or hyphens'),
  name: z.string().min(1, 'name is required').max(150),
  description: z.string().max(500).optional().nullable(),
  externalId: z.string().max(255).optional().nullable(),
  integrationId: z.string().uuid('integrationId must be a valid UUID').optional().nullable(),
  credentials: credentialsSchema,
});

const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(500).optional().nullable(),
  externalId: z.string().max(255).optional().nullable(),
  integrationId: z.string().uuid('integrationId must be a valid UUID').optional().nullable(),
  credentials: credentialsSchema,
  isActive: z.boolean().optional(),
});

@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminOrganizationsController {
  constructor(private readonly organizationsService: AdminOrganizationsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('integrationId') integrationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('orderBy') orderBy?: string,
    @Query('order') order?: string,
  ) {
    return this.organizationsService.findAll({
      search,
      isActive:
        isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      integrationId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 50,
      orderBy: orderBy as 'code' | 'name' | 'createdAt' | undefined,
      order: (order as 'asc' | 'desc') || 'asc',
    });
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    const organization = await this.organizationsService.findByCode(code);
    if (!organization) {
      throw new NotFoundException(`Organization with code '${code}' not found`);
    }
    // Never expose encrypted credentials — only indicate whether they exist
    const { encryptedCredentials: _, ...safe } = organization;
    return {
      ...safe,
      hasCredentials: this.organizationsService.hasCredentials(organization),
    };
  }

  @Get(':code/external-users')
  async getExternalUsers(@Param('code') code: string) {
    const organization = await this.organizationsService.findByCode(code);
    if (!organization) {
      throw new NotFoundException(`Organization with code '${code}' not found`);
    }
    return this.organizationsService.fetchExternalUsers(organization);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const result = createOrganizationSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation error',
        errors: messages,
      });
    }

    const exists = await this.organizationsService.existsByCode(result.data.code);
    if (exists) {
      throw new ConflictException(
        `Organization with code '${result.data.code}' already exists`,
      );
    }

    return this.organizationsService.create(result.data);
  }

  @Patch(':code')
  async update(@Param('code') code: string, @Body() body: unknown) {
    const result = updateOrganizationSchema.safeParse(body);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation error',
        errors: messages,
      });
    }

    const organization = await this.organizationsService.updateByCode(code, result.data);
    if (!organization) {
      throw new NotFoundException(`Organization with code '${code}' not found`);
    }
    return organization;
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('code') code: string) {
    const deleted = await this.organizationsService.deleteByCode(code);
    if (!deleted) {
      throw new NotFoundException(`Organization with code '${code}' not found`);
    }
  }

  @Post(':code/toggle')
  async toggle(@Param('code') code: string) {
    const organization = await this.organizationsService.toggleByCode(code);
    if (!organization) {
      throw new NotFoundException(`Organization with code '${code}' not found`);
    }
    return organization;
  }
}
