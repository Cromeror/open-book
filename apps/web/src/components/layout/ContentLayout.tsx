import type { ReactNode } from 'react';

interface ContentLayoutProps {
  /** Optional fixed header content */
  header?: ReactNode;
  /** Main scrollable content */
  children: ReactNode;
  /** Optional fixed footer content */
  footer?: ReactNode;
  /** Additional class for the container */
  className?: string;
}

/**
 * Content layout with optional fixed header and footer
 *
 * - Header stays fixed at top (if provided)
 * - Footer stays fixed at bottom (if provided)
 * - Content in the middle scrolls independently
 * - Takes full available height from parent
 *
 * @example
 * ```tsx
 * <ContentLayout
 *   header={<h1>Title</h1>}
 *   footer={<button>Save</button>}
 * >
 *   <div>Scrollable content here...</div>
 * </ContentLayout>
 * ```
 */
export function ContentLayout({
  header,
  children,
  footer,
  className = '',
}: ContentLayoutProps) {
  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {header && (
        <div className="shrink-0">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      {footer && (
        <div className="shrink-0">
          {footer}
        </div>
      )}
    </div>
  );
}
