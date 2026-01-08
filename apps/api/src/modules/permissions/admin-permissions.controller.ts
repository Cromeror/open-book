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
  GrantModuleAccessDto,
  validateGrantModuleAccessDto,
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
   * GET /api/admin/permissions/users/:userId/modules
   * Get modules a user has direct access to
   */
  @Get('users/:userId/modules')
  async getUserModules(@Param('userId') userId: string) {
    return this.adminPermissionsService.getUserModules(userId);
  }

  /**
   * POST /api/admin/permissions/users/:userId/modules
   * Grant module access to a user
   */
  @Post('users/:userId/modules')
  @HttpCode(HttpStatus.CREATED)
  async grantUserModuleAccess(
    @CurrentUser() superAdmin: User,
    @Param('userId') userId: string,
    @Body() body: unknown,
  ) {
    let dto: GrantModuleAccessDto;
    try {
      dto = validateGrantModuleAccessDto(body);
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

    return this.adminPermissionsService.grantModuleAccess(
      superAdmin.id,
      userId,
      dto,
    );
  }

  /**
   * DELETE /api/admin/permissions/users/:userId/modules/:moduleId
   * Revoke module access from a user
   */
  @Delete('users/:userId/modules/:moduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeUserModuleAccess(
    @CurrentUser() superAdmin: User,
    @Param('userId') userId: string,
    @Param('moduleId') moduleId: string,
  ) {
    await this.adminPermissionsService.revokeModuleAccess(
      superAdmin.id,
      userId,
      moduleId,
    );
  }

  /**
   * POST /api/admin/permissions/users/:userId/permissions
   * Grant a granular permission to a user
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
   * Revoke a granular permission from a user
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
   * Get users who have access to a specific module
   */
  @Get('users/by-module/:moduleCode')
  async getUsersByModule(@Param('moduleCode') moduleCode: string) {
    return this.adminPermissionsService.getUsersByModule(moduleCode);
  }
}
