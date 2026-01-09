import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';

import { JwtAuthGuard } from '../auth/guards';
import { AdminModulesService } from './admin-modules.service';
import { SuperAdminGuard } from './guards/superadmin.guard';
import { UpdateModuleDto, validateUpdateModuleDto } from './dto/update-module.dto';

/**
 * Controller for SuperAdmin to manage system modules
 *
 * All endpoints require SuperAdmin authentication.
 *
 * Endpoints:
 * - GET /api/admin/modules - List all modules
 * - GET /api/admin/modules/:id - Get a single module
 * - PATCH /api/admin/modules/:id - Update a module
 * - POST /api/admin/modules/:id/toggle - Toggle module active status
 */
@Controller('admin/modules')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminModulesController {
  constructor(private adminModulesService: AdminModulesService) {}

  /**
   * GET /api/admin/modules
   * Get all system modules (including inactive ones)
   */
  @Get()
  async getAllModules() {
    return this.adminModulesService.getAllModules();
  }

  /**
   * GET /api/admin/modules/:id
   * Get a single module by ID
   */
  @Get(':id')
  async getModuleById(@Param('id') id: string) {
    return this.adminModulesService.getModuleById(id);
  }

  /**
   * PATCH /api/admin/modules/:id
   * Update a module's configuration
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateModule(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    let dto: UpdateModuleDto;
    try {
      dto = validateUpdateModuleDto(body);
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

    return this.adminModulesService.updateModule(id, dto);
  }

  /**
   * POST /api/admin/modules/:id/toggle
   * Toggle module active/inactive status
   */
  @Post(':id/toggle')
  @HttpCode(HttpStatus.OK)
  async toggleModuleStatus(@Param('id') id: string) {
    return this.adminModulesService.toggleModuleStatus(id);
  }
}
