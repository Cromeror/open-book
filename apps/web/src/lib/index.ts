/**
 * Library exports for the web application
 *
 * Note: Some exports are server-only and should not be imported in client components.
 */

// Types (can be used anywhere)
export * from './types';

// Server-only exports should be imported directly:
// import { getServerPermissions } from '@/lib/permissions.server';
// import { withAuth, withPermission } from '@/lib/actions.server';
