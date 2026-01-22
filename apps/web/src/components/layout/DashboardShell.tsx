'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import type { NavItem } from '@/lib/types/modules';
import type { Condominium } from '@/components/molecules';

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
  /** Condominiums the user has access to */
  condominiums: Condominium[];
  /** Currently selected condominium (from UserState or fallback to primary) */
  selectedCondominium: Condominium | null;
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
  condominiums,
  selectedCondominium,
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
          condominiums={condominiums}
          selectedCondominium={selectedCondominium}
        />
      )}

      <div className="lg:pl-64 h-screen flex flex-col">
        <Header
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="shrink-0 px-4 md:px-6 pt-4 md:pt-6 bg-gray-50">
            <Breadcrumbs />
          </div>
          <div className="flex-1 overflow-auto px-4 md:px-6 pb-4 md:pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
