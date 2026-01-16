import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Module } from '../../../entities';
import { ModulePermission } from '../../../entities/module-permission.entity';
import {
  UpdateModuleDto,
  validateCrudActionsConfig,
  validateSpecializedActionsConfig,
} from '../../permissions/dto/update-module.dto';
import { CreateModuleDto } from '../../permissions/dto/create-module.dto';

/**
 * Service for SuperAdmin to manage system modules
 */
@Injectable()
export class AdminModulesService {
  private readonly logger = new Logger(AdminModulesService.name);

  constructor(
    @InjectRepository(Module)
    private moduleRepo: Repository<Module>,
    @InjectRepository(ModulePermission)
    private permissionRepo: Repository<ModulePermission>,
  ) {}

  /**
   * Create a new module
   */
  async createModule(dto: CreateModuleDto): Promise<Module> {
    // Check if module code already exists
    const existing = await this.moduleRepo.findOne({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un módulo con el código '${dto.code}'`,
      );
    }

    // Validate actionsConfig if provided
    if (dto.actionsConfig && dto.actionsConfig.length > 0) {
      // For new modules, we need to create permissions first
      // Extract permission codes from actionsConfig
      const permissionCodes = dto.actionsConfig.map((action) => action.code);

      // Validate based on module type
      if (dto.type === 'crud') {
        validateCrudActionsConfig(dto.actionsConfig, permissionCodes);
      } else {
        validateSpecializedActionsConfig(dto.actionsConfig, permissionCodes);
      }
    }

    // Create the module
    const module = this.moduleRepo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description ?? undefined,
      icon: dto.icon ?? undefined,
      type: dto.type,
      entity: dto.entity ?? undefined,
      endpoint: dto.endpoint ?? undefined,
      component: dto.component ?? undefined,
      navConfig: dto.navConfig ?? undefined,
      actionsConfig: dto.actionsConfig ?? undefined,
      order: dto.order,
      tags: dto.tags,
      isActive: true,
    });

    await this.moduleRepo.save(module);

    // Create permissions from actionsConfig
    if (dto.actionsConfig && dto.actionsConfig.length > 0) {
      for (const action of dto.actionsConfig) {
        const permission = this.permissionRepo.create({
          moduleId: module.id,
          code: action.code,
          name: action.label,
          description: action.description ?? undefined,
        });
        await this.permissionRepo.save(permission);
      }
    }

    this.logger.log(`Module created: ${module.code} (${module.id})`);

    // Return the module with its permissions
    return this.getModuleById(module.id);
  }

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

    // Determine the effective module type (from dto or existing)
    const effectiveType = dto.type ?? module.type;

    // Validate actionsConfig if provided
    if (dto.actionsConfig !== undefined && dto.actionsConfig !== null) {
      const permissionCodes = module.permissions.map((p) => p.code);

      try {
        if (effectiveType === 'crud') {
          validateCrudActionsConfig(dto.actionsConfig, permissionCodes);
        } else {
          validateSpecializedActionsConfig(dto.actionsConfig, permissionCodes);
        }
      } catch (error) {
        throw new BadRequestException(
          error instanceof Error ? error.message : 'Error de validacion',
        );
      }
    }

    // Apply updates
    if (dto.code !== undefined) {
      module.code = dto.code;
    }
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
    if (dto.actionsConfig !== undefined) {
      module.actionsConfig = dto.actionsConfig ?? undefined;
    }
    if (dto.order !== undefined) {
      module.order = dto.order;
    }
    if (dto.tags !== undefined) {
      module.tags = dto.tags;
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
