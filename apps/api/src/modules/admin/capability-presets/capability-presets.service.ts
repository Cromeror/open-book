import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CapabilityPreset } from '../../../entities/capability-preset.entity';
import { CreatePresetDto } from './dto/create-preset.dto';
import { UpdatePresetDto } from './dto/update-preset.dto';

@Injectable()
export class CapabilityPresetsService {
  constructor(
    @InjectRepository(CapabilityPreset)
    private readonly presetRepository: Repository<CapabilityPreset>,
  ) {}

  /**
   * Get all capability presets
   */
  async findAll(): Promise<CapabilityPreset[]> {
    return this.presetRepository.find({
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * Get a single preset by ID
   */
  async findById(id: string): Promise<CapabilityPreset> {
    const preset = await this.presetRepository.findOne({ where: { id } });

    if (!preset) {
      throw new NotFoundException(`Capability preset with id "${id}" not found`);
    }

    return preset;
  }

  /**
   * Create a new capability preset
   */
  async create(dto: CreatePresetDto): Promise<CapabilityPreset> {
    // Check if ID already exists
    const existing = await this.presetRepository.findOne({ where: { id: dto.id } });
    if (existing) {
      throw new ConflictException(`Capability preset with id "${dto.id}" already exists`);
    }

    const preset = this.presetRepository.create(dto);
    return this.presetRepository.save(preset);
  }

  /**
   * Update an existing capability preset
   */
  async update(id: string, dto: UpdatePresetDto): Promise<CapabilityPreset> {
    const preset = await this.findById(id);

    // Prevent updating system presets
    if (preset.isSystem) {
      throw new BadRequestException('Cannot update system presets');
    }

    Object.assign(preset, dto);
    return this.presetRepository.save(preset);
  }

  /**
   * Delete a capability preset (soft delete - marks as inactive)
   */
  async delete(id: string): Promise<void> {
    const preset = await this.findById(id);

    // Prevent deleting system presets
    if (preset.isSystem) {
      throw new BadRequestException('Cannot delete system presets');
    }

    // Soft delete: mark as inactive instead of removing from database
    preset.isActive = false;
    await this.presetRepository.save(preset);
  }

  /**
   * Toggle active status of a preset
   */
  async toggleStatus(id: string): Promise<CapabilityPreset> {
    const preset = await this.findById(id);
    preset.isActive = !preset.isActive;
    return this.presetRepository.save(preset);
  }
}
