import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  SoftRemoveEvent,
  DataSource,
} from 'typeorm';

import { BaseEntity } from '../entities/base.entity';
import { AuditContext } from '../types/audit';

/**
 * Storage for the current request's audit context
 * Uses AsyncLocalStorage pattern via cls-hooked or manual injection
 *
 * In production, this should be populated by a middleware that extracts
 * the user ID from the JWT token and stores it in the request context.
 */
let currentAuditContext: AuditContext | undefined;

/**
 * Set the current audit context for the request
 * Call this from a middleware or guard after authenticating the user
 *
 * @example
 * ```typescript
 * // In an auth middleware or guard
 * setAuditContext({ userId: user.id, ipAddress: req.ip });
 * ```
 */
export function setAuditContext(context: AuditContext | undefined): void {
  currentAuditContext = context;
}

/**
 * Get the current audit context
 */
export function getAuditContext(): AuditContext | undefined {
  return currentAuditContext;
}

/**
 * Clear the current audit context
 * Call this at the end of request processing
 */
export function clearAuditContext(): void {
  currentAuditContext = undefined;
}

/**
 * TypeORM subscriber that automatically populates audit fields
 *
 * This subscriber listens to all entities that extend BaseEntity and:
 * - Sets createdBy on insert
 * - Sets updatedBy on update
 * - Sets deletedBy on soft delete
 *
 * The user ID is obtained from the current request context via setAuditContext()
 *
 * @example
 * ```typescript
 * // In your auth middleware
 * @Injectable()
 * export class AuditMiddleware implements NestMiddleware {
 *   use(req: Request, res: Response, next: NextFunction) {
 *     const userId = req.user?.id;
 *     setAuditContext({ userId });
 *
 *     res.on('finish', () => clearAuditContext());
 *     next();
 *   }
 * }
 * ```
 */
@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<BaseEntity> {
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
   * Before inserting a new entity, set the createdBy field
   */
  beforeInsert(event: InsertEvent<BaseEntity>): void {
    const context = getAuditContext();
    if (context?.userId && event.entity) {
      event.entity.createdBy = context.userId;
    }
  }

  /**
   * Before updating an entity, set the updatedBy field
   */
  beforeUpdate(event: UpdateEvent<BaseEntity>): void {
    const context = getAuditContext();
    if (context?.userId && event.entity) {
      (event.entity as BaseEntity).updatedBy = context.userId;
    }
  }

  /**
   * Before soft removing an entity, set the deletedBy field
   */
  beforeSoftRemove(event: SoftRemoveEvent<BaseEntity>): void {
    const context = getAuditContext();
    if (context?.userId && event.entity) {
      event.entity.deletedBy = context.userId;
    }
  }
}
