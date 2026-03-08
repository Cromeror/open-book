import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Integration } from '../../../entities/integration.entity';

export interface CreateIntegrationDto {
  code: string;
  name: string;
  description?: string | null;
  baseUrl: string;
  authType: string;
  authConfig?: Record<string, unknown> | null;
  connectionType: string;
}

export interface UpdateIntegrationDto {
  name?: string;
  description?: string | null;
  baseUrl?: string;
  authType?: string;
  authConfig?: Record<string, unknown> | null;
  connectionType?: string;
  isActive?: boolean;
}

export interface FindIntegrationsOptions {
  search?: string;
  isActive?: boolean;
  connectionType?: string;
  page?: number;
  limit?: number;
  orderBy?: 'code' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
}

@Injectable()
export class AdminIntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private readonly integrationRepository: Repository<Integration>,
  ) {}

  async findAll(options: FindIntegrationsOptions = {}) {
    const {
      search,
      isActive,
      connectionType,
      page = 1,
      limit = 50,
      orderBy = 'code',
      order = 'asc',
    } = options;

    const queryBuilder = this.integrationRepository
      .createQueryBuilder('i')
      .where('i.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere(
        '(i.code ILIKE :search OR i.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('i.isActive = :isActive', { isActive });
    }

    if (connectionType) {
      queryBuilder.andWhere('i.connectionType = :connectionType', { connectionType });
    }

    const total = await queryBuilder.getCount();

    const sortColumn = `i.${orderBy}`;
    queryBuilder.orderBy(sortColumn, order.toUpperCase() as 'ASC' | 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const data = await queryBuilder.getMany();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByCode(code: string): Promise<Integration | null> {
    return this.integrationRepository.findOne({
      where: { code },
    });
  }

  async create(dto: CreateIntegrationDto): Promise<Integration> {
    const integration = this.integrationRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
      baseUrl: dto.baseUrl,
      authType: dto.authType as Integration['authType'],
      authConfig: dto.authConfig ?? null,
      connectionType: dto.connectionType as Integration['connectionType'],
      isActive: true,
    });

    return this.integrationRepository.save(integration);
  }

  async updateByCode(
    code: string,
    dto: UpdateIntegrationDto,
  ): Promise<Integration | null> {
    const integration = await this.findByCode(code);
    if (!integration) return null;

    if (dto.name !== undefined) integration.name = dto.name;
    if (dto.description !== undefined) integration.description = dto.description;
    if (dto.baseUrl !== undefined) integration.baseUrl = dto.baseUrl;
    if (dto.authType !== undefined) integration.authType = dto.authType as Integration['authType'];
    if (dto.authConfig !== undefined) integration.authConfig = dto.authConfig;
    if (dto.connectionType !== undefined) integration.connectionType = dto.connectionType as Integration['connectionType'];
    if (dto.isActive !== undefined) integration.isActive = dto.isActive;

    return this.integrationRepository.save(integration);
  }

  async deleteByCode(code: string): Promise<boolean> {
    const integration = await this.findByCode(code);
    if (!integration) return false;

    integration.deletedAt = new Date();
    await this.integrationRepository.save(integration);
    return true;
  }

  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.integrationRepository
      .createQueryBuilder('i')
      .where('i.code = :code', { code })
      .andWhere('i.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('i.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async toggleByCode(code: string): Promise<Integration | null> {
    const integration = await this.findByCode(code);
    if (!integration) return null;

    integration.isActive = !integration.isActive;
    return this.integrationRepository.save(integration);
  }
}
