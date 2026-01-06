'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

import type { NavItem } from '@/lib/nav-config';

import { Icon } from './Icon';
import { LogoutButton } from './LogoutButton';

interface SidebarProps {
  /** Navigation items filtered by permissions (from server) */
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
 * Receives pre-filtered nav items from server based on permissions
 */
export function Sidebar({ navItems, isSuperAdmin, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.path);
    const active = isActive(item.path);

    return (
      <li key={item.path}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpanded(item.path)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm
                transition-colors duration-150
                ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}
                ${depth > 0 ? 'pl-8' : ''}
              `}
            >
              <span className="flex items-center gap-3">
                <Icon name={item.icon} className="h-5 w-5" />
                <span>{item.label}</span>
              </span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {isExpanded && (
              <ul className="mt-1 space-y-1">
                {item.children!.map((child) => renderNavItem(child, depth + 1))}
              </ul>
            )}
          </>
        ) : (
          <Link
            href={item.path}
            onClick={onClose}
            className={`
              flex items-center gap-3 px-3 py-2 rounded-lg text-sm
              transition-colors duration-150
              ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}
              ${depth > 0 ? 'pl-8' : ''}
            `}
          >
            <Icon name={item.icon} className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        )}
      </li>
    );
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
          lg:translate-x-0 lg:static lg:z-0
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
            {navItems.map((item) => renderNavItem(item))}
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
