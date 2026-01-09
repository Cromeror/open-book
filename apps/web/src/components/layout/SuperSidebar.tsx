'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Shield,
  KeyRound,
  Building2,
  Settings,
  Blocks,
  SlidersHorizontal,
  Plug,
  Activity,
  FileBarChart,
  BarChart3,
  Bell,
  X,
} from 'lucide-react';

import { LogoutButton } from './LogoutButton';

interface SuperSidebarProps {
  /** Whether sidebar is open (mobile) */
  isOpen: boolean;
  /** Callback to close sidebar (mobile) */
  onClose: () => void;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <Home className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Gestión de Usuarios',
    items: [
      { label: 'Usuarios', path: '/admin/users', icon: <Users className="h-4 w-4" /> },
      { label: 'Roles', path: '/admin/roles', icon: <Shield className="h-4 w-4" /> },
      { label: 'Permisos', path: '/admin/permissions', icon: <KeyRound className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Gestion De Condominios',
    items: [
      { label: 'Condominios', path: '/admin/condominiums', icon: <Building2 className="h-4 w-4" /> },
      { label: 'Propiedades (Casas, aptos)', path: '/admin/properties', icon: <Building2 className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Configuración del Sistema',
    items: [
      { label: 'Módulos', path: '/admin/modules', icon: <Blocks className="h-4 w-4" /> },
      { label: 'Parámetros', path: '/admin/settings', icon: <SlidersHorizontal className="h-4 w-4" /> },
      { label: 'Integraciones', path: '/admin/integrations', icon: <Plug className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Auditoría y Reportes',
    items: [
      { label: 'Logs de Actividad', path: '/admin/audit', icon: <Activity className="h-4 w-4" /> },
      { label: 'Reportes', path: '/admin/reports', icon: <FileBarChart className="h-4 w-4" /> },
      { label: 'Métricas', path: '/admin/metrics', icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    title: 'Comunicaciones',
    items: [
      { label: 'Notificaciones', path: '/admin/notifications', icon: <Bell className="h-4 w-4" /> },
    ],
  },
];

/**
 * SuperSidebar - Static sidebar for SuperAdmin users
 * Contains all system administration options
 */
export function SuperSidebar({ isOpen, onClose }: SuperSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-slate-900
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:absolute
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-slate-900" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-white text-sm">OpenBook</span>
              <span className="text-xs text-amber-400">SuperAdmin</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-3 overflow-y-auto h-[calc(100%-4rem)]">
          <div className="space-y-6 flex-1">
            {navSections.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-3 py-1 rounded-lg text-sm
                          transition-colors duration-150
                          ${
                            isActive(item.path)
                              ? 'bg-amber-500/10 text-amber-400 font-medium'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Back to app link */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Volver a la App</span>
            </Link>
            <div className="mt-2">
              <LogoutButton variant="sidebar-dark" />
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
