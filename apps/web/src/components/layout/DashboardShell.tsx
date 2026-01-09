'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import type { NavItem } from '@/lib/types/modules';

import { Sidebar } from './Sidebar';
import { SuperSidebar } from './SuperSidebar';
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
  /** Navigation items derived from user's modules */
  navItems: NavItem[];
  /** Whether user is SuperAdmin */
  isSuperAdmin: boolean;
}

/**
 * Dashboard shell component that wraps the main content
 * This is a Client Component that manages sidebar state
 *
 * The navItems are generated from user's modules (already filtered by backend)
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
      {isSuperAdmin ? (
        <SuperSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : (
        <Sidebar
          navItems={navItems}
          isSuperAdmin={isSuperAdmin}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

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
