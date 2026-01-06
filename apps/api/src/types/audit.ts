/**
 * Audit field types for entity tracking
 * Used across all entities that extend BaseEntity
 */

/**
 * Fields automatically populated on entity creation
 */
export interface CreationAuditFields {
  /** UUID of the user who created the record */
  createdBy?: string;
  /** Timestamp when the record was created */
  createdAt: Date;
}

/**
 * Fields automatically populated on entity update
 */
export interface UpdateAuditFields {
  /** UUID of the user who last updated the record */
  updatedBy?: string;
  /** Timestamp when the record was last updated */
  updatedAt: Date;
}

/**
 * Fields for soft delete tracking
 */
export interface DeletionAuditFields {
  /** UUID of the user who deleted the record */
  deletedBy?: string;
  /** Timestamp when the record was soft-deleted (null if active) */
  deletedAt?: Date;
}

/**
 * Complete audit trail fields
 * All entities extending BaseEntity will have these fields
 */
export interface AuditFields
  extends CreationAuditFields,
    UpdateAuditFields,
    DeletionAuditFields {}

/**
 * Context for audit operations
 * Passed through request context to subscribers
 */
export interface AuditContext {
  /** UUID of the current user performing the action */
  userId?: string;
  /** IP address of the request */
  ipAddress?: string;
  /** User agent of the request */
  userAgent?: string;
}

/**
 * Declare module augmentation for Express Request
 * This allows storing audit context in the request object
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auditContext?: AuditContext;
    }
  }
}
