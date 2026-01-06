import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
  SoftRemoveEvent,
  DataSource,
} from 'typeorm';

import { BaseEntity } from '../entities/base.entity';
import { isImmutableEntity } from '../utils/soft-delete';

/**
 * TypeORM subscriber that prevents deletion of immutable entities
 *
 * Entities marked with @Immutable decorator cannot be deleted
 * (neither hard delete nor soft delete) to maintain financial
 * record integrity and audit compliance.
 *
 * This enforces the transparency principle at the database level.
 */
@Injectable()
@EventSubscriber()
export class ImmutableSubscriber
  implements EntitySubscriberInterface<BaseEntity>
{
  constructor(@InjectDataSource() dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  /**
   * Listen to all entities that extend BaseEntity
   */
  listenTo() {
    return BaseEntity;
  }

  /**
   * Prevent hard delete of immutable entities
   */
  beforeRemove(event: RemoveEvent<BaseEntity>): void {
    this.checkImmutable(event);
  }

  /**
   * Prevent soft delete of immutable entities
   */
  beforeSoftRemove(event: SoftRemoveEvent<BaseEntity>): void {
    this.checkImmutable(event);
  }

  /**
   * Check if the entity is immutable and throw error if deletion is attempted
   */
  private checkImmutable(
    event: RemoveEvent<BaseEntity> | SoftRemoveEvent<BaseEntity>
  ): void {
    const entityClass = event.metadata.target;

    if (typeof entityClass === 'function' && isImmutableEntity(entityClass)) {
      throw new Error(
        `Cannot delete immutable entity: ${event.metadata.name}. ` +
          'Financial records must never be deleted to maintain transparency and audit trail. ' +
          'Use corrections with proper justification instead.'
      );
    }
  }
}
