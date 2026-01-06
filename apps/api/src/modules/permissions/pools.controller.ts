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
} from '@nestjs/common';
import { z } from 'zod';

import { User } from '../../entities/user.entity';
import { PoolsService } from './pools.service';
import { CurrentUser } from './decorators';
import {
  CreatePoolDto,
  validateCreatePoolDto,
  AddPoolMemberDto,
  validateAddPoolMemberDto,
  GrantPoolModuleDto,
  validateGrantPoolModuleDto,
  GrantPoolPermissionDto,
  validateGrantPoolPermissionDto,
} from './dto';

/**
 * Controller for SuperAdmin to manage user pools
 *
 * All endpoints require SuperAdmin authentication.
 * Access is controlled by SuperAdminGuard applied at the module level.
 */
@Controller('admin/pools')
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
   * POST /api/admin/pools/:id/modules
   * Grant module access to a pool
   */
  @Post(':id/modules')
  @HttpCode(HttpStatus.CREATED)
  async grantModuleAccess(
    @CurrentUser() superAdmin: User,
    @Param('id') poolId: string,
    @Body() body: unknown,
  ) {
    let dto: GrantPoolModuleDto;
    try {
      dto = validateGrantPoolModuleDto(body);
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

    return this.poolsService.grantModuleAccess(
      superAdmin.id,
      poolId,
      dto.moduleId,
    );
  }

  /**
   * DELETE /api/admin/pools/:id/modules/:moduleId
   * Revoke module access from a pool
   */
  @Delete(':id/modules/:moduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeModuleAccess(
    @Param('id') poolId: string,
    @Param('moduleId') moduleId: string,
  ) {
    await this.poolsService.revokeModuleAccess(poolId, moduleId);
  }

  /**
   * POST /api/admin/pools/:id/permissions
   * Grant a granular permission to a pool
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
   * DELETE /api/admin/pools/:id/permissions/:permissionId
   * Revoke a granular permission from a pool
   */
  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokePermission(
    @Param('id') poolId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.poolsService.revokePermission(poolId, permissionId);
  }
}
