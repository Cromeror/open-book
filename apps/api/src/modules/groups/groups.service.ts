import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Group } from '../../entities/group.entity';
import { Condominium } from '../../entities/condominium.entity';

/**
 * Query options for listing groups
 */
export interface FindGroupsOptions {
  condominiumId: string;
  parentId?: string | null;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * DTO for creating a group
 */
export interface CreateGroupDto {
  name: string;
  description?: string;
  condominiumId: string;
  parentId?: string | null;
  displayOrder?: number;
}

/**
 * DTO for updating a group
 */
export interface UpdateGroupDto {
  name?: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * Service for managing groups within condominiums
 *
 * Groups are hierarchical containers that can hold other groups or properties.
 * They follow a tree structure with materialized path for efficient queries.
 */
@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Condominium)
    private readonly condominiumRepository: Repository<Condominium>,
  ) {}

  /**
   * Find all groups for a condominium with optional filters
   */
  async findAll(options: FindGroupsOptions) {
    const {
      condominiumId,
      parentId,
      isActive,
      page = 1,
      limit = 50,
    } = options;

    const queryBuilder = this.groupRepository
      .createQueryBuilder('g')
      .where('g.condominiumId = :condominiumId', { condominiumId })
      .andWhere('g.deletedAt IS NULL');

    // Filter by parent (null for root groups)
    if (parentId === null) {
      queryBuilder.andWhere('g.parentId IS NULL');
    } else if (parentId !== undefined) {
      queryBuilder.andWhere('g.parentId = :parentId', { parentId });
    }

    // Filter by active status
    if (isActive !== undefined) {
      queryBuilder.andWhere('g.isActive = :isActive', { isActive });
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Order by display order, then name
    queryBuilder.orderBy('g.displayOrder', 'ASC').addOrderBy('g.name', 'ASC');

    // Apply pagination
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

  /**
   * Find root groups (groups without parent) for a condominium
   */
  async findRootGroups(condominiumId: string): Promise<Group[]> {
    return this.groupRepository.find({
      where: {
        condominiumId,
        parentId: IsNull(),
        deletedAt: undefined,
      },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Find a group by ID
   */
  async findById(id: string): Promise<Group | null> {
    return this.groupRepository.findOne({
      where: { id, deletedAt: undefined },
    });
  }

  /**
   * Find a group by ID with its children
   */
  async findByIdWithChildren(id: string): Promise<Group | null> {
    return this.groupRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['children', 'properties'],
    });
  }

  /**
   * Tree node type for group hierarchy
   */
  // Using interface for tree node

  /**
   * Get the full tree of groups for a condominium
   */
  async getTree(condominiumId: string): Promise<Record<string, unknown>[]> {
    const groups = await this.groupRepository.find({
      where: { condominiumId, deletedAt: undefined },
      order: { depth: 'ASC', displayOrder: 'ASC', name: 'ASC' },
    });

    // Build tree structure using plain objects
    type GroupTreeNode = Record<string, unknown> & { children: GroupTreeNode[] };
    const groupMap = new Map<string, GroupTreeNode>();
    const rootGroups: GroupTreeNode[] = [];

    // First pass: create map with empty children arrays
    for (const group of groups) {
      const node: GroupTreeNode = {
        id: group.id,
        name: group.name,
        description: group.description,
        condominiumId: group.condominiumId,
        parentId: group.parentId,
        depth: group.depth,
        path: group.path,
        displayOrder: group.displayOrder,
        isActive: group.isActive,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        children: [],
      };
      groupMap.set(group.id, node);
    }

    // Second pass: build tree
    for (const group of groups) {
      const node = groupMap.get(group.id)!;
      if (group.parentId) {
        const parent = groupMap.get(group.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootGroups.push(node);
      }
    }

    return rootGroups;
  }

  /**
   * Create a new group
   */
  async create(dto: CreateGroupDto): Promise<Group> {
    // Validate condominium exists
    const condominium = await this.condominiumRepository.findOne({
      where: { id: dto.condominiumId, deletedAt: undefined },
    });
    if (!condominium) {
      throw new NotFoundException(
        `Condominium with ID ${dto.condominiumId} not found`,
      );
    }

    let depth = 1;
    let path = '';
    let parent: Group | null = null;

    // Validate parent group if provided
    if (dto.parentId) {
      parent = await this.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException(
          `Parent group with ID ${dto.parentId} not found`,
        );
      }
      if (parent.condominiumId !== dto.condominiumId) {
        throw new BadRequestException(
          'Parent group must belong to the same condominium',
        );
      }
      depth = parent.depth + 1;
    }

    // Create the group first to get its ID
    const group = this.groupRepository.create({
      name: dto.name,
      description: dto.description,
      condominiumId: dto.condominiumId,
      parentId: dto.parentId ?? null,
      depth,
      displayOrder: dto.displayOrder ?? 0,
      isActive: true,
    });

    const savedGroup = await this.groupRepository.save(group);

    // Update path after we have the ID
    if (parent) {
      path = parent.path ? `${parent.path}.${savedGroup.id}` : savedGroup.id;
    } else {
      path = savedGroup.id;
    }

    savedGroup.path = path;
    return this.groupRepository.save(savedGroup);
  }

  /**
   * Update a group
   */
  async update(id: string, dto: UpdateGroupDto): Promise<Group | null> {
    const group = await this.findById(id);
    if (!group) {
      return null;
    }

    if (dto.name !== undefined) group.name = dto.name;
    if (dto.description !== undefined) group.description = dto.description ?? undefined;
    if (dto.displayOrder !== undefined) group.displayOrder = dto.displayOrder;
    if (dto.isActive !== undefined) group.isActive = dto.isActive;

    return this.groupRepository.save(group);
  }

  /**
   * Soft delete a group
   *
   * Note: This will fail if the group has children or properties
   */
  async delete(id: string): Promise<boolean> {
    const group = await this.findByIdWithChildren(id);
    if (!group) {
      return false;
    }

    // Check for children
    const childrenCount = await this.groupRepository.count({
      where: { parentId: id, deletedAt: undefined },
    });
    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete group with child groups. Delete children first.',
      );
    }

    // Check for properties
    const propertiesCount = await this.groupRepository
      .createQueryBuilder('g')
      .leftJoin('properties', 'p', 'p.group_id = g.id AND p.deleted_at IS NULL')
      .where('g.id = :id', { id })
      .select('COUNT(p.id)', 'count')
      .getRawOne();

    if (propertiesCount && parseInt(propertiesCount.count) > 0) {
      throw new BadRequestException(
        'Cannot delete group with properties. Remove or move properties first.',
      );
    }

    group.deletedAt = new Date();
    await this.groupRepository.save(group);
    return true;
  }

  /**
   * Move a group to a new parent
   */
  async move(id: string, newParentId: string | null): Promise<Group | null> {
    const group = await this.findById(id);
    if (!group) {
      return null;
    }

    let newDepth = 1;
    let newPath = group.id;

    if (newParentId) {
      const newParent = await this.findById(newParentId);
      if (!newParent) {
        throw new NotFoundException(
          `New parent group with ID ${newParentId} not found`,
        );
      }
      if (newParent.condominiumId !== group.condominiumId) {
        throw new BadRequestException(
          'Cannot move group to a different condominium',
        );
      }

      // Prevent moving to self or descendant
      if (newParent.path?.includes(group.id)) {
        throw new BadRequestException(
          'Cannot move group to itself or its descendant',
        );
      }

      newDepth = newParent.depth + 1;
      newPath = newParent.path
        ? `${newParent.path}.${group.id}`
        : group.id;
    }

    const depthDiff = newDepth - group.depth;
    const oldPath = group.path || group.id;

    // Update this group
    group.parentId = newParentId;
    group.depth = newDepth;
    group.path = newPath;

    await this.groupRepository.save(group);

    // Update all descendants' paths and depths
    if (depthDiff !== 0 || oldPath !== newPath) {
      await this.groupRepository
        .createQueryBuilder()
        .update(Group)
        .set({
          depth: () => `depth + ${depthDiff}`,
          path: () => `REPLACE(path, '${oldPath}', '${newPath}')`,
        })
        .where('path LIKE :pattern', { pattern: `${oldPath}.%` })
        .execute();
    }

    return group;
  }

  /**
   * Get ancestors of a group (from root to parent)
   */
  async getAncestors(id: string): Promise<Group[]> {
    const group = await this.findById(id);
    if (!group || !group.path) {
      return [];
    }

    const ancestorIds = group.path.split('.').slice(0, -1);
    if (ancestorIds.length === 0) {
      return [];
    }

    return this.groupRepository
      .createQueryBuilder('g')
      .where('g.id IN (:...ids)', { ids: ancestorIds })
      .andWhere('g.deletedAt IS NULL')
      .orderBy('g.depth', 'ASC')
      .getMany();
  }

  /**
   * Get descendants of a group (all levels)
   */
  async getDescendants(id: string): Promise<Group[]> {
    const group = await this.findById(id);
    if (!group) {
      return [];
    }

    const path = group.path || group.id;

    return this.groupRepository
      .createQueryBuilder('g')
      .where('g.path LIKE :pattern', { pattern: `${path}.%` })
      .andWhere('g.deletedAt IS NULL')
      .orderBy('g.depth', 'ASC')
      .addOrderBy('g.displayOrder', 'ASC')
      .getMany();
  }
}
