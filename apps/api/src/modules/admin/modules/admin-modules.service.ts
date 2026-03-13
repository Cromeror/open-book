import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Module } from '../../../entities';
import { ModulePermission } from '../../../entities/module-permission.entity';
import { ModuleResource } from '../../../entities/module-resource.entity';
import { Resource } from '../../../entities/resource.entity';
import { ResourceHttpMethod } from '../../../entities/resource-http-method.entity';
import {
  UpdateModuleDto,
  validateActionsConfig,
} from '../../permissions/dto/update-module.dto';
import { CreateModuleDto } from '../../permissions/dto/create-module.dto';

/**
 * Inferred action from a resource HTTP method.
 * Maps HTTP verbs to canonical CRUD action codes.
 */
export interface InferredAction {
  /** Canonical action code (read | create | update | delete) */
  code: string;
  /** Human-readable label */
  label: string;
  /** HTTP method that triggered the inference */
  httpMethod: string;
  /** Resource code the method belongs to */
  resourceCode: string;
  /** ResourceHttpMethod id */
  resourceHttpMethodId: string;
}

const HTTP_METHOD_TO_ACTION: Record<string, { code: string; label: string } | undefined> = {
  GET: { code: 'read', label: 'Ver' },
  POST: { code: 'create', label: 'Crear' },
  PATCH: { code: 'update', label: 'Actualizar' },
  PUT: { code: 'update', label: 'Actualizar' },
  DELETE: { code: 'delete', label: 'Eliminar' },
};

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
    @InjectRepository(ModuleResource)
    private moduleResourceRepo: Repository<ModuleResource>,
    @InjectRepository(Resource)
    private resourceRepo: Repository<Resource>,
  ) {}

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private async resolveResourcesByCode(codes: string[]): Promise<Resource[]> {
    if (!codes.length) return [];
    const resources = await this.resourceRepo.find({
      where: { code: In(codes) },
    });
    const found = new Set(resources.map((r) => r.code));
    const missing = codes.filter((c) => !found.has(c));
    if (missing.length) {
      throw new BadRequestException(
        `Recursos no encontrados: ${missing.join(', ')}`,
      );
    }
    return resources;
  }

  private async syncModuleResources(
    moduleId: string,
    resourceCodes: string[],
  ): Promise<void> {
    const resources = await this.resolveResourcesByCode(resourceCodes);
    await this.moduleResourceRepo.delete({ moduleId });
    if (resources.length) {
      const entries = resources.map((resource) =>
        this.moduleResourceRepo.create({ moduleId, resourceId: resource.id }),
      );
      await this.moduleResourceRepo.save(entries);
    }
  }

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------

  /**
   * Create a new module
   */
  async createModule(dto: CreateModuleDto): Promise<Module> {
    const existing = await this.moduleRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Ya existe un módulo con el código '${dto.code}'`);
    }

    if (dto.actionsConfig && dto.actionsConfig.length > 0) {
      const permissionCodes = dto.actionsConfig.map((action) => action.code);
      validateActionsConfig(dto.actionsConfig, permissionCodes);
    }

    const module = this.moduleRepo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description ?? undefined,
      icon: dto.icon ?? undefined,
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

    if (dto.actionsConfig && dto.actionsConfig.length > 0) {
      for (const action of dto.actionsConfig) {
        const permission = this.permissionRepo.create({
          moduleId: module.id,
          code: action.code,
          name: action.label ?? action.code,
        });
        await this.permissionRepo.save(permission);
      }
    }

    if (dto.resourceCodes && dto.resourceCodes.length > 0) {
      await this.syncModuleResources(module.id, dto.resourceCodes);
    }

    this.logger.log(`Module created: ${module.code} (${module.id})`);
    return this.getModuleById(module.id);
  }

  /**
   * Get all modules (including inactive ones)
   */
  async getAllModules(): Promise<Module[]> {
    return this.moduleRepo.find({
      relations: ['permissions', 'resources', 'resources.resource'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get a single module by ID
   */
  async getModuleById(id: string): Promise<Module> {
    const module = await this.moduleRepo.findOne({
      where: { id },
      relations: ['permissions', 'resources', 'resources.resource'],
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
      relations: ['permissions', 'resources', 'resources.resource'],
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

    if (dto.actionsConfig !== undefined && dto.actionsConfig !== null) {
      const permissionCodes = module.permissions.map((p) => p.code);
      try {
        validateActionsConfig(dto.actionsConfig, permissionCodes);
      } catch (error) {
        throw new BadRequestException(
          error instanceof Error ? error.message : 'Error de validacion',
        );
      }
    }

    if (dto.code !== undefined) module.code = dto.code;
    if (dto.name !== undefined) module.name = dto.name;
    if (dto.description !== undefined) module.description = dto.description ?? undefined;
    if (dto.icon !== undefined) module.icon = dto.icon ?? undefined;
    if (dto.entity !== undefined) module.entity = dto.entity ?? undefined;
    if (dto.endpoint !== undefined) module.endpoint = dto.endpoint ?? undefined;
    if (dto.component !== undefined) module.component = dto.component ?? undefined;
    if (dto.componentConfig !== undefined) module.componentConfig = dto.componentConfig ?? undefined;
    if (dto.navConfig !== undefined) module.navConfig = dto.navConfig ?? undefined;
    if (dto.actionsConfig !== undefined) module.actionsConfig = dto.actionsConfig ?? undefined;
    if (dto.order !== undefined) module.order = dto.order;
    if (dto.tags !== undefined) module.tags = dto.tags;
    if (dto.isActive !== undefined) module.isActive = dto.isActive;

    await this.moduleRepo.save(module);

    if (dto.resourceCodes !== undefined) {
      await this.syncModuleResources(id, dto.resourceCodes);
    }

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
    this.logger.log(`Module ${module.code} ${module.isActive ? 'activated' : 'deactivated'}`);
    return module;
  }

  // ---------------------------------------------------------------------------
  // Action inference
  // ---------------------------------------------------------------------------

  /**
   * Infer possible actions for a module based on its associated resources.
   *
   * Mapping:
   *   GET    → read
   *   POST   → create
   *   PATCH / PUT → update
   *   DELETE → delete
   *
   * Duplicate action codes are deduplicated (first resource wins).
   */
  async inferActionsForModule(id: string): Promise<InferredAction[]> {
    const module = await this.moduleRepo.findOne({
      where: { id },
      relations: [
        'resources',
        'resources.resource',
        'resources.resource.httpMethods',
        'resources.resource.httpMethods.httpMethod',
      ],
    });

    if (!module) {
      throw new NotFoundException(`Módulo con ID '${id}' no encontrado`);
    }

    const seen = new Set<string>();
    const inferred: InferredAction[] = [];

    for (const moduleResource of module.resources ?? []) {
      const resource = moduleResource.resource;
      if (!resource?.httpMethods) continue;

      for (const rhm of resource.httpMethods as (ResourceHttpMethod & { httpMethod?: { method?: string } })[]) {
        if (!rhm.isActive) continue;

        const httpVerb = rhm.httpMethod?.method?.toUpperCase() ?? '';
        const mapping = HTTP_METHOD_TO_ACTION[httpVerb];
        if (!mapping || seen.has(mapping.code)) continue;

        seen.add(mapping.code);
        inferred.push({
          code: mapping.code,
          label: mapping.label,
          httpMethod: httpVerb,
          resourceCode: resource.code,
          resourceHttpMethodId: rhm.id,
        });
      }
    }

    return inferred;
  }
}
