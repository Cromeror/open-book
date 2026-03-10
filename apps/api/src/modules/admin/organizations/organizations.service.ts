import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Organization } from '../../../entities/organization.entity';
import { encrypt, decrypt } from '../../../common/crypto';

export interface ExternalCredentials {
  email: string;
  password: string;
}

export interface CreateOrganizationDto {
  code: string;
  name: string;
  description?: string | null;
  externalId?: string | null;
  integrationId?: string | null;
  credentials?: ExternalCredentials | null;
}

export interface UpdateOrganizationDto {
  name?: string;
  description?: string | null;
  externalId?: string | null;
  integrationId?: string | null;
  credentials?: ExternalCredentials | null;
  isActive?: boolean;
}

export interface FindOrganizationsOptions {
  search?: string;
  isActive?: boolean;
  integrationId?: string;
  page?: number;
  limit?: number;
  orderBy?: 'code' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
}

@Injectable()
export class AdminOrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async findAll(options: FindOrganizationsOptions = {}) {
    const {
      search,
      isActive,
      integrationId,
      page = 1,
      limit = 50,
      orderBy = 'name',
      order = 'asc',
    } = options;

    const queryBuilder = this.organizationRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.integration', 'integration')
      .where('o.deletedAt IS NULL');

    if (search) {
      queryBuilder.andWhere(
        '(o.code ILIKE :search OR o.name ILIKE :search OR o.externalId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('o.isActive = :isActive', { isActive });
    }

    if (integrationId) {
      queryBuilder.andWhere('o.integrationId = :integrationId', { integrationId });
    }

    const total = await queryBuilder.getCount();

    const sortColumn = `o.${orderBy}`;
    queryBuilder.orderBy(sortColumn, order.toUpperCase() as 'ASC' | 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const rawData = await queryBuilder.getMany();
    const data = rawData.map(({ encryptedCredentials: _, ...org }) => ({
      ...org,
      hasCredentials: !!_,
    }));

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

  async findByCode(code: string): Promise<Organization | null> {
    return this.organizationRepository.findOne({
      where: { code },
      relations: ['integration'],
    });
  }

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    const organization = this.organizationRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description ?? null,
      externalId: dto.externalId ?? null,
      integrationId: dto.integrationId ?? null,
      encryptedCredentials: dto.credentials ? encrypt(JSON.stringify(dto.credentials)) : null,
      isActive: true,
    });

    return this.organizationRepository.save(organization);
  }

  async updateByCode(
    code: string,
    dto: UpdateOrganizationDto,
  ): Promise<Organization | null> {
    const organization = await this.findByCode(code);
    if (!organization) return null;

    if (dto.name !== undefined) organization.name = dto.name;
    if (dto.description !== undefined) organization.description = dto.description;
    if (dto.externalId !== undefined) organization.externalId = dto.externalId;
    if (dto.integrationId !== undefined) organization.integrationId = dto.integrationId;
    if (dto.credentials !== undefined) {
      organization.encryptedCredentials = dto.credentials
        ? encrypt(JSON.stringify(dto.credentials))
        : null;
    }
    if (dto.isActive !== undefined) organization.isActive = dto.isActive;

    return this.organizationRepository.save(organization);
  }

  async deleteByCode(code: string): Promise<boolean> {
    const organization = await this.findByCode(code);
    if (!organization) return false;

    organization.deletedAt = new Date();
    await this.organizationRepository.save(organization);
    return true;
  }

  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.organizationRepository
      .createQueryBuilder('o')
      .where('o.code = :code', { code })
      .andWhere('o.deletedAt IS NULL');

    if (excludeId) {
      queryBuilder.andWhere('o.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async toggleByCode(code: string): Promise<Organization | null> {
    const organization = await this.findByCode(code);
    if (!organization) return null;

    organization.isActive = !organization.isActive;
    return this.organizationRepository.save(organization);
  }

  /**
   * Returns decrypted credentials for an organization.
   * Returns null if no credentials are stored.
   */
  getDecryptedCredentials(organization: Organization): ExternalCredentials | null {
    if (!organization.encryptedCredentials) return null;
    const json = decrypt(organization.encryptedCredentials);
    return JSON.parse(json) as ExternalCredentials;
  }

  /**
   * Check whether an organization has credentials configured.
   */
  hasCredentials(organization: Organization): boolean {
    return !!organization.encryptedCredentials;
  }

  /**
   * Authenticate with CaptuData (devise_token_auth) and fetch users for the organization.
   */
  async fetchExternalUsers(
    organization: Organization,
  ): Promise<{ users: unknown[]; error?: string }> {
    if (!organization.integration) {
      return { users: [], error: 'Organization has no integration configured' };
    }

    const credentials = this.getDecryptedCredentials(organization);
    if (!credentials) {
      return { users: [], error: 'Organization has no credentials configured' };
    }

    const baseUrl = organization.integration.baseUrl.replace(/\/+$/, '');

    // Step 1: Authenticate with devise_token_auth
    let authHeaders: Record<string, string>;
    try {
      const signInResponse = await fetch(`${baseUrl}/auth/sign_in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!signInResponse.ok) {
        const body = await signInResponse.text();
        return { users: [], error: `Authentication failed: ${signInResponse.status} ${body}` };
      }

      // devise_token_auth returns auth tokens in response headers
      authHeaders = {
        'access-token': signInResponse.headers.get('access-token') ?? '',
        'client': signInResponse.headers.get('client') ?? '',
        'uid': signInResponse.headers.get('uid') ?? '',
        'token-type': signInResponse.headers.get('token-type') ?? 'Bearer',
        'expiry': signInResponse.headers.get('expiry') ?? '',
      };
    } catch (err) {
      return { users: [], error: `Authentication request failed: ${(err as Error).message}` };
    }

    // Step 2: Fetch users for this client (organization)
    try {
      const clientId = organization.externalId;
      const usersUrl = `${baseUrl}/clients/${clientId}/users`;

      const usersResponse = await fetch(usersUrl, {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
      });

      if (!usersResponse.ok) {
        const body = await usersResponse.text();
        return { users: [], error: `Failed to fetch users: ${usersResponse.status} ${body}` };
      }

      const data = await usersResponse.json();
      // CaptuData returns array directly or { data: [] }
      const users = Array.isArray(data) ? data : (data.data ?? data);
      return { users };
    } catch (err) {
      return { users: [], error: `Users request failed: ${(err as Error).message}` };
    }
  }
}
