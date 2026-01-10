import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Module } from '../../entities';
import { UpdateModuleDto } from './dto/update-module.dto';

/**
 * Service for SuperAdmin to manage system modules
 */
@Injectable()
export class AdminModulesService {
  private readonly logger = new Logger(AdminModulesService.name);

  constructor(
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
  ) {}

  /**
   * Get all modules (including inactive ones)
   */
  async getAllModules(): Promise<Module[]> {
    return this.moduleRepo.find({
      relations: ['permissions'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get a single module by ID
   */
  async getModuleById(id: string): Promise<Module> {
    const module = await this.moduleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!module) {
      throw new NotFoundException(`Módulo con ID '${id}' no encontrado`);
    }

    return module;
  }

  /**
   * Get a single module by code
   */
  async getModuleByCode(code: string): Promise<Module> {
    const module = await this.moduleRepo.findOne({
      where: { code },
      relations: ['permissions'],
    });

    if (!module) {
      throw new NotFoundException(`Módulo '${code}' no encontrado`);
    }

    return module;
  }

  /**
   * Update a module
   */
  async updateModule(id: string, dto: UpdateModuleDto): Promise<Module> {
    const module = await this.getModuleById(id);

    // Apply updates
    if (dto.name !== undefined) {
      module.name = dto.name;
    }
    if (dto.description !== undefined) {
      module.description = dto.description ?? undefined;
    }
    if (dto.icon !== undefined) {
      module.icon = dto.icon ?? undefined;
    }
    if (dto.type !== undefined) {
      module.type = dto.type;
    }
    if (dto.entity !== undefined) {
      module.entity = dto.entity ?? undefined;
    }
    if (dto.endpoint !== undefined) {
      module.endpoint = dto.endpoint ?? undefined;
    }
    if (dto.component !== undefined) {
      module.component = dto.component ?? undefined;
    }
    if (dto.navConfig !== undefined) {
      module.navConfig = dto.navConfig ?? undefined;
    }
    if (dto.order !== undefined) {
      module.order = dto.order;
    }
    if (dto.isActive !== undefined) {
      module.isActive = dto.isActive;
    }

    await this.moduleRepo.save(module);

    this.logger.log(`Module updated: ${module.code} (${module.id})`);

    return this.getModuleById(id);
  }

  /**
   * Toggle module active status
   */
  async toggleModuleStatus(id: string): Promise<Module> {
    const module = await this.getModuleById(id);
    module.isActive = !module.isActive;
    await this.moduleRepo.save(module);

    this.logger.log(
      `Module ${module.code} ${module.isActive ? 'activated' : 'deactivated'}`,
    );

    return module;
  }
}
