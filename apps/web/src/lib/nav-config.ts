/**
 * Navigation configuration for the application
 * Items are filtered based on user permissions
 *
 * NOTE: This static configuration is being replaced by dynamic navigation
 * from /api/auth/me modules. See OB-014-E-004 for details.
 */

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
  /** Module code required to see this item (null = always visible) */
  module?: string | null;
  /** Permission required to see this item (format: "module:action") */
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

  // Goals module (Objetivos)
  {
    path: '/goals',
    label: 'Objetivos',
    icon: 'Target',
    module: 'objetivos',
    children: [
      { path: '/goals', label: 'Ver todos', icon: 'List', permission: 'objetivos:read' },
      { path: '/goals/new', label: 'Crear', icon: 'Plus', permission: 'objetivos:create' },
    ],
  },

  // Activities module (Actividades)
  {
    path: '/activities',
    label: 'Actividades',
    icon: 'Calendar',
    module: 'actividades',
    children: [
      { path: '/activities', label: 'Ver todas', icon: 'List', permission: 'actividades:read' },
      { path: '/activities/new', label: 'Crear', icon: 'Plus', permission: 'actividades:create' },
    ],
  },

  // Commitments module (Compromisos)
  {
    path: '/commitments',
    label: 'Compromisos',
    icon: 'Handshake',
    module: 'compromisos',
    children: [
      { path: '/commitments', label: 'Ver todos', icon: 'List', permission: 'compromisos:read' },
      { path: '/commitments/new', label: 'Crear', icon: 'Plus', permission: 'compromisos:create' },
    ],
  },

  // Contributions module (Aportes)
  {
    path: '/contributions',
    label: 'Aportes',
    icon: 'Banknote',
    module: 'aportes',
    children: [
      { path: '/contributions', label: 'Ver todos', icon: 'List', permission: 'aportes:read' },
      { path: '/contributions/register', label: 'Registrar', icon: 'Plus', permission: 'aportes:create' },
    ],
  },

  // PQR module (kept as acronym - Peticiones, Quejas, Reclamos)
  {
    path: '/pqr',
    label: 'PQR',
    icon: 'MessageSquare',
    module: 'pqr',
    children: [
      { path: '/pqr', label: 'Mis PQR', icon: 'List', permission: 'pqr:read' },
      { path: '/pqr/new', label: 'Nueva solicitud', icon: 'Plus', permission: 'pqr:create' },
      { path: '/pqr/manage', label: 'Gestionar', icon: 'Settings', permission: 'pqr:manage' },
    ],
  },

  // Reports module (Reportes)
  {
    path: '/reports',
    label: 'Reportes',
    icon: 'BarChart3',
    module: 'reportes',
    children: [
      { path: '/reports', label: 'Ver reportes', icon: 'FileText', permission: 'reportes:read' },
      { path: '/reports/export', label: 'Exportar', icon: 'Download', permission: 'reportes:export' },
    ],
  },

  // Users module (Usuarios)
  {
    path: '/users',
    label: 'Usuarios',
    icon: 'Users',
    module: 'users',
    children: [
      { path: '/users', label: 'Ver usuarios', icon: 'List', permission: 'users:read' },
    ],
  },

  // Properties module (Copropiedades)
  {
    path: '/properties',
    label: 'Copropiedades',
    icon: 'Building2',
    module: 'copropiedades',
    children: [
      { path: '/properties', label: 'Ver todas', icon: 'List', permission: 'copropiedades:read' },
    ],
  },

  // Apartments module (Apartamentos)
  {
    path: '/apartments',
    label: 'Apartamentos',
    icon: 'DoorOpen',
    module: 'apartamentos',
    children: [
      { path: '/apartments', label: 'Ver todos', icon: 'List', permission: 'apartamentos:read' },
      { path: '/apartments/new', label: 'Crear', icon: 'Plus', permission: 'apartamentos:create' },
    ],
  },

  // Audit module (Auditoria)
  {
    path: '/audit',
    label: 'Auditoria',
    icon: 'ClipboardList',
    module: 'auditoria',
  },

  // Notifications module (Notificaciones)
  {
    path: '/notifications',
    label: 'Notificaciones',
    icon: 'Bell',
    module: 'notificaciones',
  },

  // Settings module (Configuracion)
  {
    path: '/settings',
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
      { path: '/admin/permissions', label: 'Gestion de Permisos', icon: 'Key' },
      { path: '/admin/modules', label: 'Modulos del Sistema', icon: 'Boxes' },
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
