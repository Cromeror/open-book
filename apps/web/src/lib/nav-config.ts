/**
 * Navigation configuration for the application
 * Items are filtered based on user permissions
 */

import type { ModuleCode } from './types';

/**
 * Navigation item structure
 */
export interface NavItem {
  /** URL path for the item */
  path: string;
  /** Display label */
  label: string;
  /** Icon name (lucide-react icon) */
  icon: string;
  /** Module required to see this item (null = always visible) */
  module?: ModuleCode | null;
  /** Permission required to see this item */
  permission?: string;
  /** Only visible for SuperAdmin */
  superAdminOnly?: boolean;
  /** Child items (submenus) */
  children?: NavItem[];
}

/**
 * Main navigation configuration
 * Items are shown based on user's module access and permissions
 */
export const NAV_CONFIG: NavItem[] = [
  // Dashboard - always visible for authenticated users
  {
    path: '/dashboard',
    label: 'Inicio',
    icon: 'Home',
    module: null,
  },

  // Objetivos module
  {
    path: '/objetivos',
    label: 'Objetivos',
    icon: 'Target',
    module: 'objetivos',
    children: [
      { path: '/objetivos', label: 'Ver todos', icon: 'List', permission: 'objetivos:read' },
      { path: '/objetivos/nuevo', label: 'Crear', icon: 'Plus', permission: 'objetivos:create' },
    ],
  },

  // Actividades module
  {
    path: '/actividades',
    label: 'Actividades',
    icon: 'Calendar',
    module: 'actividades',
    children: [
      { path: '/actividades', label: 'Ver todas', icon: 'List', permission: 'actividades:read' },
      { path: '/actividades/nuevo', label: 'Crear', icon: 'Plus', permission: 'actividades:create' },
    ],
  },

  // Compromisos module
  {
    path: '/compromisos',
    label: 'Compromisos',
    icon: 'Handshake',
    module: 'compromisos',
    children: [
      { path: '/compromisos', label: 'Ver todos', icon: 'List', permission: 'compromisos:read' },
      { path: '/compromisos/nuevo', label: 'Crear', icon: 'Plus', permission: 'compromisos:create' },
    ],
  },

  // Aportes module
  {
    path: '/aportes',
    label: 'Aportes',
    icon: 'Banknote',
    module: 'aportes',
    children: [
      { path: '/aportes', label: 'Ver todos', icon: 'List', permission: 'aportes:read' },
      { path: '/aportes/registrar', label: 'Registrar', icon: 'Plus', permission: 'aportes:create' },
    ],
  },

  // PQR module
  {
    path: '/pqr',
    label: 'PQR',
    icon: 'MessageSquare',
    module: 'pqr',
    children: [
      { path: '/pqr', label: 'Mis PQR', icon: 'List', permission: 'pqr:read' },
      { path: '/pqr/nuevo', label: 'Nueva solicitud', icon: 'Plus', permission: 'pqr:create' },
      { path: '/pqr/gestionar', label: 'Gestionar', icon: 'Settings', permission: 'pqr:manage' },
    ],
  },

  // Reportes module
  {
    path: '/reportes',
    label: 'Reportes',
    icon: 'BarChart3',
    module: 'reportes',
    children: [
      { path: '/reportes', label: 'Ver reportes', icon: 'FileText', permission: 'reportes:read' },
      { path: '/reportes/exportar', label: 'Exportar', icon: 'Download', permission: 'reportes:export' },
    ],
  },

  // Users module
  {
    path: '/usuarios',
    label: 'Usuarios',
    icon: 'Users',
    module: 'users',
    children: [
      { path: '/usuarios', label: 'Ver usuarios', icon: 'List', permission: 'users:read' },
    ],
  },

  // Copropiedades module
  {
    path: '/copropiedades',
    label: 'Copropiedades',
    icon: 'Building2',
    module: 'copropiedades',
    children: [
      { path: '/copropiedades', label: 'Ver todas', icon: 'List', permission: 'copropiedades:read' },
    ],
  },

  // Apartamentos module
  {
    path: '/apartamentos',
    label: 'Apartamentos',
    icon: 'DoorOpen',
    module: 'apartamentos',
    children: [
      { path: '/apartamentos', label: 'Ver todos', icon: 'List', permission: 'apartamentos:read' },
      { path: '/apartamentos/nuevo', label: 'Crear', icon: 'Plus', permission: 'apartamentos:create' },
    ],
  },

  // Auditoria module
  {
    path: '/auditoria',
    label: 'Auditoria',
    icon: 'ClipboardList',
    module: 'auditoria',
  },

  // Notificaciones module
  {
    path: '/notificaciones',
    label: 'Notificaciones',
    icon: 'Bell',
    module: 'notificaciones',
  },

  // Configuracion module
  {
    path: '/configuracion',
    label: 'Configuracion',
    icon: 'Settings',
    module: 'configuracion',
  },

  // SuperAdmin only section
  {
    path: '/admin',
    label: 'Administracion',
    icon: 'Shield',
    superAdminOnly: true,
    children: [
      { path: '/admin/pools', label: 'Pools de Usuarios', icon: 'Users' },
      { path: '/admin/permisos', label: 'Gestion de Permisos', icon: 'Key' },
      { path: '/admin/modulos', label: 'Modulos del Sistema', icon: 'Boxes' },
    ],
  },
];

/**
 * Get breadcrumb path segments from a pathname
 */
export function getBreadcrumbs(pathname: string): { label: string; path: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; path: string }[] = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Find label from nav config
    const navItem = findNavItem(NAV_CONFIG, currentPath);
    const label = navItem?.label || formatSegment(segment);

    breadcrumbs.push({ label, path: currentPath });
  }

  return breadcrumbs;
}

/**
 * Find a nav item by path
 */
function findNavItem(items: NavItem[], path: string): NavItem | undefined {
  for (const item of items) {
    if (item.path === path) {
      return item;
    }
    if (item.children) {
      const found = findNavItem(item.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Format a URL segment to a readable label
 */
function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
