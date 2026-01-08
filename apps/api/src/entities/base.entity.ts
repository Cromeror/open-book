import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm';

import { AuditFields } from '../types/audit';

/**
 * Base entity with audit fields for all OpenBook entities
 *
 * Provides:
 * - UUID primary key
 * - Creation tracking (createdAt, createdBy)
 * - Update tracking (updatedAt, updatedBy)
 * - Soft delete support (deletedAt, deletedBy)
 *
 * All audit fields (createdBy, updatedBy, deletedBy) are automatically
 * populated by the AuditSubscriber when a user context is available.
 *
 * @example
 * ```typescript
 * @Entity('users')
 * export class User extends BaseEntity {
 *   @Column()
 *   email: string;
 *
 *   @Column()
 *   name: string;
 * }
 * ```
 */
export abstract class BaseEntity
  extends TypeOrmBaseEntity
  implements AuditFields
{
  /**
   * Primary key - UUID v4 generated automatically
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Timestamp when the record was created
   * Automatically set by TypeORM on insert
   */
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  /**
   * UUID of the user who created the record
   * Populated automatically by AuditSubscriber if user context exists
   */
  @Column({
    name: 'created_by',
    type: 'uuid',
    nullable: true,
  })
  createdBy?: string;

  /**
   * Timestamp when the record was last updated
   * Automatically updated by TypeORM on every update
   */
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;

  /**
   * UUID of the user who last updated the record
   * Populated automatically by AuditSubscriber if user context exists
   */
  @Column({
    name: 'updated_by',
    type: 'uuid',
    nullable: true,
  })
  updatedBy?: string;

  /**
   * Timestamp when the record was soft-deleted
   * NULL means the record is active
   * Automatically filters deleted records from queries
   */
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt?: Date;

  /**
   * UUID of the user who deleted the record
   * Populated automatically by AuditSubscriber on soft delete
   */
  @Column({
    name: 'deleted_by',
    type: 'uuid',
    nullable: true,
  })
  deletedBy?: string;
}
