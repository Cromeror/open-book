'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

import { getBreadcrumbs } from '@/lib/nav-config';

/**
 * Breadcrumbs navigation component
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  if (breadcrumbs.length === 0 || pathname === '/dashboard') {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-gray-700 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={crumb.path} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.path}
                className="hover:text-gray-700 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
