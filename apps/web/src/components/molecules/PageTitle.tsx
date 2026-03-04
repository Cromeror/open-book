import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  tooltip?: ReactNode;
}

/**
 * PageTitle - Molecule component
 *
 * Displays a page/section title with an optional help tooltip icon.
 */
export function PageTitle({ title, tooltip }: PageTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {tooltip && (
        <div className="group relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-help"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <div className="pointer-events-none absolute left-1/2 top-7 z-10 hidden w-80 -translate-x-1/2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600 shadow-lg group-hover:block">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
}

export type { PageTitleProps };
