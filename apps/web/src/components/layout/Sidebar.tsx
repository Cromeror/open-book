'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Shield, X } from 'lucide-react';

import type { NavItem } from '@/lib/types/modules';

import { Icon } from './Icon';
import { LogoutButton } from './LogoutButton';

interface SidebarProps {
  /** Navigation items from user modules */
  navItems: NavItem[];
  /** Whether user is SuperAdmin */
  isSuperAdmin: boolean;
  /** Whether sidebar is open (mobile) */
  isOpen: boolean;
  /** Callback to close sidebar (mobile) */
  onClose: () => void;
}

/**
 * Sidebar navigation component
 * Receives navigation items derived from user's modules
 */
export function Sidebar({ navItems, isSuperAdmin, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
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
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:absolute
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OB</span>
            </div>
            <span className="font-semibold text-gray-900">OpenBook</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-4 overflow-y-auto h-[calc(100%-4rem)]">
          {isSuperAdmin && (
            <div className="mb-4 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-xs font-medium text-amber-800">SuperAdmin</span>
            </div>
          )}

          <ul className="space-y-1 flex-1">
            {/* Dashboard - always visible */}
            <li>
              <Link
                href="/dashboard"
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                  transition-colors duration-150
                  ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                <Home className="h-5 w-5" />
                <span>Inicio</span>
              </Link>
            </li>

            {/* Dynamic module navigation */}
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  onClick={onClose}
                  data-module={item.module}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                    transition-colors duration-150
                    ${isActive(item.path) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}

            {/* Admin section - SuperAdmin only */}
            {isSuperAdmin && (
              <li>
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                    transition-colors duration-150
                    ${isActive('/admin') ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Shield className="h-5 w-5" />
                  <span>Administracion</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Logout button at bottom */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <LogoutButton variant="sidebar" />
          </div>
        </nav>
      </aside>
    </>
  );
}
