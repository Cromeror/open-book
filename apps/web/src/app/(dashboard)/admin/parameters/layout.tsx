'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Parameters Layout
 *
 * Provides tab navigation for parameter categories
 */

const CATEGORIES = [
  { id: 'general', label: 'General', icon: '⚙️', path: '/admin/parameters/general' },
  { id: 'variables', label: 'Configuración de variables', icon: '🔧', path: '/admin/parameters/variables' },
  { id: 'security', label: 'Seguridad', icon: '🔒', path: '/admin/parameters/security' },
  { id: 'audit', label: 'Auditoría', icon: '📝', path: '/admin/parameters/audit' },
  { id: 'limits', label: 'Límites', icon: '📊', path: '/admin/parameters/limits' },
];

export default function ParametersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="rounded-lg border border-gray-200 bg-white shadow">
        <div className="border-b border-gray-200 px-4 pt-4">
          <div className="flex overflow-x-auto">
            <div className="flex space-x-1" role="tablist">
              {CATEGORIES.map((category) => {
                // Check if current path starts with category path (includes nested routes)
                const isActive = pathname.startsWith(category.path);
                return (
                  <Link
                    key={category.id}
                    href={category.path}
                    role="tab"
                    aria-selected={isActive}
                    className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div role="tabpanel">
          {children}
        </div>
      </div>
    </div>
  );
}
