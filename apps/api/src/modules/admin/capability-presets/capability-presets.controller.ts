import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../permissions/guards/superadmin.guard';
import { CapabilityPresetsService } from './capability-presets.service';
import { validateCreatePresetDto, CreatePresetDto } from './dto/create-preset.dto';
import { validateUpdatePresetDto, UpdatePresetDto } from './dto/update-preset.dto';
import { CapabilityPreset } from '../../../entities/capability-preset.entity';

/**
 * Capability Presets Controller
 *
 * Manages CRUD operations for capability presets
 * Only accessible by SuperAdmins
 *
 * Routes are prefixed by AdminModule RouterModule: /admin/capability-presets
 */
@Controller()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class CapabilityPresetsController {
  constructor(private readonly presetsService: CapabilityPresetsService) {}

  /**
   * GET /admin/capability-presets
   * List all capability presets
   */
  @Get()
  async findAll(): Promise<CapabilityPreset[]> {
    return this.presetsService.findAll();
  }

  /**
   * GET /admin/capability-presets/:id
   * Get a single preset by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string): Promise<CapabilityPreset> {
    return this.presetsService.findById(id);
  }

  /**
   * POST /admin/capability-presets
   * Create a new capability preset
   */
  @Post()
  async create(@Body() body: unknown): Promise<CapabilityPreset> {
    const dto: CreatePresetDto = validateCreatePresetDto(body);
    return this.presetsService.create(dto);
  }

  /**
   * PATCH /admin/capability-presets/:id
   * Update an existing capability preset
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown): Promise<CapabilityPreset> {
    const dto: UpdatePresetDto = validateUpdatePresetDto(body);
    return this.presetsService.update(id, dto);
  }

  /**
   * DELETE /admin/capability-presets/:id
   * Delete a capability preset
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    return this.presetsService.delete(id);
  }

  /**
   * POST /admin/capability-presets/:id/toggle
   * Toggle active status of a preset
   */
  @Post(':id/toggle')
  async toggleStatus(@Param('id') id: string): Promise<CapabilityPreset> {
    return this.presetsService.toggleStatus(id);
  }
}
