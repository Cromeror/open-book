import { Repository, SelectQueryBuilder } from 'typeorm';

import { BaseEntity } from '../entities/base.entity';

/**
 * Metadata key for marking entities as immutable (cannot be deleted)
 */
export const IMMUTABLE_ENTITY_KEY = 'openbook:immutable';

/**
 * Decorator to mark an entity as immutable (cannot be soft-deleted)
 *
 * Use this for financial records and other data that must never be deleted
 * to comply with transparency and audit requirements.
 *
 * @example
 * ```typescript
 * @Entity('aportes_reales')
 * @Immutable()
 * export class AporteReal extends BaseEntity {
 *   // This entity cannot be soft-deleted
 * }
 * ```
 */
export function Immutable(): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(IMMUTABLE_ENTITY_KEY, true, target);
  };
}

/**
 * Check if an entity class is marked as immutable
 */
export function isImmutableEntity(entityClass: object): boolean {
  return Reflect.getMetadata(IMMUTABLE_ENTITY_KEY, entityClass) === true;
}

/**
 * Soft delete helper functions for repository operations
 */
export const SoftDeleteHelpers = {
  /**
   * Soft delete an entity by ID
   * Throws error if entity is marked as @Immutable
   *
   * @param repository - TypeORM repository
   * @param id - Entity ID to soft delete
   */
  async softDelete<T extends BaseEntity>(
    repository: Repository<T>,
    id: string
  ): Promise<void> {
    const entityClass = repository.target;
    if (isImmutableEntity(entityClass as object)) {
      throw new Error(
        `Cannot delete immutable entity: ${(entityClass as { name: string }).name}. ` +
          'Financial records must never be deleted to maintain audit trail.'
      );
    }
    await repository.softDelete(id);
  },

  /**
   * Restore a soft-deleted entity by ID
   *
   * @param repository - TypeORM repository
   * @param id - Entity ID to restore
   */
  async restore<T extends BaseEntity>(
    repository: Repository<T>,
    id: string
  ): Promise<void> {
    await repository.restore(id);
  },

  /**
   * Find all entities including soft-deleted ones
   *
   * @param repository - TypeORM repository
   * @returns All entities including deleted
   */
  async findAllWithDeleted<T extends BaseEntity>(
    repository: Repository<T>
  ): Promise<T[]> {
    return repository.find({ withDeleted: true });
  },

  /**
   * Find one entity by ID including soft-deleted
   *
   * @param repository - TypeORM repository
   * @param id - Entity ID
   * @returns Entity or null
   */
  async findOneWithDeleted<T extends BaseEntity>(
    repository: Repository<T>,
    id: string
  ): Promise<T | null> {
    return repository.findOne({
      where: { id } as never,
      withDeleted: true,
    });
  },

  /**
   * Check if an entity has been soft-deleted
   *
   * @param entity - Entity to check
   * @returns true if deleted
   */
  isDeleted(entity: BaseEntity): boolean {
    return entity.deletedAt !== null && entity.deletedAt !== undefined;
  },

  /**
   * Create a query builder that includes deleted records
   *
   * @param repository - TypeORM repository
   * @param alias - Query builder alias
   * @returns Query builder with deleted records
   */
  createQueryBuilderWithDeleted<T extends BaseEntity>(
    repository: Repository<T>,
    alias: string
  ): SelectQueryBuilder<T> {
    return repository.createQueryBuilder(alias).withDeleted();
  },
};
