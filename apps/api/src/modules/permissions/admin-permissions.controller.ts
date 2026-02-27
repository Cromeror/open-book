import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards';
import { AdminPermissionsService } from './admin-permissions.service';
import { CurrentUser } from './decorators';
import { SuperAdminGuard } from './guards/superadmin.guard';
import {
  GrantPermissionDto,
  validateGrantPermissionDto,
} from './dto';

/**
 * Controller for SuperAdmin to manage user permissions
 *
 * All endpoints require SuperAdmin authentication.
 */
@Controller('admin/permissions')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminPermissionsController {
  constructor(private adminPermissionsService: AdminPermissionsService) {}

  /**
   * GET /api/admin/permissions/modules
   * Get all available modules with their permissions
   */
  @Get('modules')
  async getModules() {
    return this.adminPermissionsService.getAllModules();
  }

  /**
   * GET /api/admin/permissions/modules/:code/permissions
   * Get permissions for a specific module
   */
  @Get('modules/:code/permissions')
  async getModulePermissions(@Param('code') code: string) {
    return this.adminPermissionsService.getModulePermissions(code);
  }

  /**
   * GET /api/admin/permissions/users/:userId/permissions
   * Get effective permissions for a user (direct + pools)
   */
  @Get('users/:userId/permissions')
  async getUserEffectivePermissions(@Param('userId') userId: string) {
    return this.adminPermissionsService.getUserEffectivePermissions(userId);
  }

  /**
   * POST /api/admin/permissions/users/:userId/permissions
   * Grant a permission to a user
   */
  @Post('users/:userId/permissions')
  @HttpCode(HttpStatus.CREATED)
  async grantUserPermission(
    @CurrentUser() superAdmin: User,
    @Param('userId') userId: string,
    @Body() body: unknown,
  ) {
    let dto: GrantPermissionDto;
    try {
      dto = validateGrantPermissionDto(body);
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

    return this.adminPermissionsService.grantPermission(
      superAdmin.id,
      userId,
      dto,
    );
  }

  /**
   * DELETE /api/admin/permissions/users/:userId/permissions/:permissionId
   * Revoke a permission from a user
   */
  @Delete('users/:userId/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeUserPermission(
    @CurrentUser() superAdmin: User,
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.adminPermissionsService.revokePermission(
      superAdmin.id,
      userId,
      permissionId,
    );
  }

  /**
   * GET /api/admin/permissions/users
   * Search users with optional filters
   */
  @Get('users')
  async searchUsers(
    @Query('search') search?: string,
    @Query('moduleCode') moduleCode?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminPermissionsService.searchUsers({
      search,
      moduleCode,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  /**
   * GET /api/admin/permissions/users/by-module/:moduleCode
   * Get module info with actions filtered by current user's permissions
   */
  @Get('users/by-module/:moduleCode')
  async getModuleWithUserActions(
    @CurrentUser() currentUser: User,
    @Param('moduleCode') moduleCode: string,
  ) {
    return this.adminPermissionsService.getModuleWithUserActions(
      moduleCode,
      currentUser,
    );
  }
}
