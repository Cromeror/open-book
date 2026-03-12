import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards';
import { PoolsService } from './pools.service';
import { CurrentUser } from './decorators';
import { SuperAdminGuard } from './guards/superadmin.guard';
import {
  CreatePoolDto,
  validateCreatePoolDto,
  AddPoolMemberDto,
  validateAddPoolMemberDto,
  GrantPoolPermissionDto,
  validateGrantPoolPermissionDto,
} from './dto';

/**
 * Controller for SuperAdmin to manage user pools
 *
 * All endpoints require SuperAdmin authentication.
 */
@Controller('admin/pools')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class PoolsController {
  constructor(private poolsService: PoolsService) {}

  /**
   * POST /api/admin/pools
   * Create a new user pool
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() superAdmin: User, @Body() body: unknown) {
    let dto: CreatePoolDto;
    try {
      dto = validateCreatePoolDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    return this.poolsService.create(superAdmin.id, dto);
  }

  /**
   * GET /api/admin/pools
   * Get all pools
   */
  @Get()
  async findAll() {
    return this.poolsService.findAll();
  }

  /**
   * GET /api/admin/pools/:id
   * Get a pool with all its relations
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.poolsService.findOne(id);
  }

  /**
   * PATCH /api/admin/pools/:id
   * Update pool details
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    let dto: Partial<CreatePoolDto>;
    try {
      dto = validateCreatePoolDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    return this.poolsService.update(id, dto);
  }

  /**
   * DELETE /api/admin/pools/:id
   * Deactivate a pool (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivate(@Param('id') id: string) {
    await this.poolsService.deactivate(id);
  }

  /**
   * POST /api/admin/pools/:id/members
   * Add a user to a pool
   */
  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @CurrentUser() superAdmin: User,
    @Param('id') poolId: string,
    @Body() body: unknown,
  ) {
    let dto: AddPoolMemberDto;
    try {
      dto = validateAddPoolMemberDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    return this.poolsService.addMember(superAdmin.id, poolId, dto.userId);
  }

  /**
   * DELETE /api/admin/pools/:id/members/:userId
   * Remove a user from a pool
   */
  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('id') poolId: string,
    @Param('userId') userId: string,
  ) {
    await this.poolsService.removeMember(poolId, userId);
  }

  /**
   * POST /api/admin/pools/:id/permissions
   * Grant a permission to a pool
   */
  @Post(':id/permissions')
  @HttpCode(HttpStatus.CREATED)
  async grantPermission(
    @CurrentUser() superAdmin: User,
    @Param('id') poolId: string,
    @Body() body: unknown,
  ) {
    let dto: GrantPoolPermissionDto;
    try {
      dto = validateGrantPoolPermissionDto(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    return this.poolsService.grantPermission(superAdmin.id, poolId, dto);
  }

  /**
   * POST /api/admin/pools/:id/external-members
   * Add an external user to a pool
   */
  @Post(':id/external-members')
  @HttpCode(HttpStatus.CREATED)
  async addExternalMember(
    @CurrentUser() superAdmin: User,
    @Param('id') poolId: string,
    @Body() body: unknown,
  ) {
    const schema = z.object({
      externalUserId: z.string().min(1, 'externalUserId es requerido'),
      organizationCode: z.string().min(1, 'organizationCode es requerido'),
      name: z.string().optional(),
      email: z.string().optional(),
      clientId: z.string().optional(),
      clientName: z.string().optional(),
    });

    let dto: z.infer<typeof schema>;
    try {
      dto = schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    return this.poolsService.addExternalMember(
      superAdmin.id,
      poolId,
      dto.externalUserId,
      dto.organizationCode,
      { name: dto.name, email: dto.email, clientId: dto.clientId, clientName: dto.clientName },
    );
  }

  /**
   * DELETE /api/admin/pools/:id/external-members/:externalUserId
   * Remove an external user from a pool
   */
  @Delete(':id/external-members/:externalUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeExternalMember(
    @Param('id') poolId: string,
    @Param('externalUserId') externalUserId: string,
  ) {
    await this.poolsService.removeExternalMember(poolId, externalUserId);
  }

  /**
   * DELETE /api/admin/pools/:id/permissions/:permissionId
   * Revoke a permission from a pool
   */
  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokePermission(
    @Param('id') poolId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.poolsService.revokePermission(poolId, permissionId);
  }

  /**
   * POST /api/admin/pools/:id/resource-access
   * Grant resource access to a pool
   */
  @Post(':id/resource-access')
  @HttpCode(HttpStatus.CREATED)
  async grantResourceAccess(
    @CurrentUser() superAdmin: User,
    @Param('id') poolId: string,
    @Body() body: unknown,
  ) {
    const schema = z.object({
      resourceId: z.string().uuid('resourceId debe ser un UUID valido'),
      resourceHttpMethodId: z.string().uuid().nullable().optional(),
      responseFilter: z.object({
        field: z.string().min(1),
        type: z.enum(['include', 'exclude']),
        values: z.array(z.string()),
      }).nullable().optional(),
    });

    let dto: z.infer<typeof schema>;
    try {
      dto = schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => issue.message);
        throw new BadRequestException({
          statusCode: 400,
          message: 'Error de validación',
          errors: messages,
        });
      }
      throw error;
    }

    return this.poolsService.grantResourceAccess(
      superAdmin.id,
      poolId,
      dto.resourceId,
      dto.resourceHttpMethodId ?? null,
      dto.responseFilter ?? null,
    );
  }

  /**
   * DELETE /api/admin/pools/:id/resource-access/:accessId
   * Revoke resource access from a pool
   */
  @Delete(':id/resource-access/:accessId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeResourceAccess(
    @Param('id') poolId: string,
    @Param('accessId') accessId: string,
  ) {
    await this.poolsService.revokeResourceAccess(poolId, accessId);
  }
}
