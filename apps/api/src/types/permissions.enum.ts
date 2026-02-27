/**
 * Permission action types
 * Defines the possible actions that can be performed on a module
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  MANAGE = 'manage',
}

/**
 * Permission string format
 * Format: "module:action"
 *
 * Examples:
 * - "goals:create" - Create goals
 * - "contributions:read" - Read contributions
 * - "reports:export" - Export reports
 */
export type Permission = `${string}:${Action}`;
