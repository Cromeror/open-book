'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import type { NavItem } from '@/lib/nav-config';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';

interface DashboardShellProps {
  children: ReactNode;
  /** User information from server */
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isSuperAdmin: boolean;
  } | null;
  /** Navigation items pre-filtered by server based on permissions */
  navItems: NavItem[];
  /** Whether user is SuperAdmin */
  isSuperAdmin: boolean;
}

/**
 * Dashboard shell component that wraps the main content
 * This is a Client Component that manages sidebar state
 *
 * The navItems are pre-filtered on the server based on user permissions
 */
export function DashboardShell({
  children,
  user,
  navItems,
  isSuperAdmin,
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        navItems={navItems}
        isSuperAdmin={isSuperAdmin}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Header
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="p-4 md:p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
