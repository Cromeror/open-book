'use client';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ResponsiveColumns = Partial<Record<Breakpoint, number>>;

export type ResponsiveSpan = Partial<Record<Breakpoint, number>>;

export interface MosaicItemConfig {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  value?: string | number;
  href?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  colSpan?: ResponsiveSpan;
  rowSpan?: ResponsiveSpan;
}

export interface MosaicWidgetProps {
  items: MosaicItemConfig[];
  columns?: ResponsiveColumns;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapMap = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
} as const;

const breakpointPrefix: Record<Breakpoint, string> = {
  xs: '',
  sm: 'sm:',
  md: 'md:',
  lg: 'lg:',
  xl: 'xl:',
};

const variantStyles: Record<NonNullable<MosaicItemConfig['variant']>, string> = {
  default: 'bg-white border-gray-200',
  primary: 'bg-blue-50 border-blue-200',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  danger: 'bg-red-50 border-red-200',
};

const variantValueStyles: Record<NonNullable<MosaicItemConfig['variant']>, string> = {
  default: 'text-gray-900',
  primary: 'text-blue-700',
  success: 'text-green-700',
  warning: 'text-yellow-700',
  danger: 'text-red-700',
};

function buildGridColsClasses(cols: ResponsiveColumns): string {
  return (Object.entries(cols) as [Breakpoint, number][])
    .map(([bp, n]) => `${breakpointPrefix[bp]}grid-cols-${n}`)
    .join(' ');
}

function buildColSpanClasses(span: ResponsiveSpan): string {
  return (Object.entries(span) as [Breakpoint, number][])
    .map(([bp, n]) => `${breakpointPrefix[bp]}col-span-${n}`)
    .join(' ');
}

function buildRowSpanClasses(span: ResponsiveSpan): string {
  return (Object.entries(span) as [Breakpoint, number][])
    .map(([bp, n]) => `${breakpointPrefix[bp]}row-span-${n}`)
    .join(' ');
}

const defaultColumns: ResponsiveColumns = { xs: 1, sm: 2, md: 3 };

function MosaicTile({ item }: { item: MosaicItemConfig }) {
  const variant = item.variant ?? 'default';
  const baseClasses = `rounded-lg border p-4 h-full ${variantStyles[variant]} transition-shadow hover:shadow-md`;

  const content = (
    <>
      {item.value != null && (
        <p className={`text-2xl font-semibold ${variantValueStyles[variant]}`}>
          {item.value}
        </p>
      )}
      <p className="text-sm font-medium text-gray-700">{item.title}</p>
      {item.description && (
        <p className="mt-1 text-xs text-gray-500">{item.description}</p>
      )}
    </>
  );

  if (item.href) {
    return (
      <a href={item.href} className={`${baseClasses} block cursor-pointer`}>
        {content}
      </a>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}

export function MosaicWidget(props: MosaicWidgetProps | { moduleCode: string; componentConfig: Record<string, unknown> }) {
  const config: MosaicWidgetProps = 'componentConfig' in props
    ? (props.componentConfig as unknown as MosaicWidgetProps)
    : props;

  const { items, columns = defaultColumns, gap = 'md', className } = config;

  if (!items || items.length === 0) return null;

  const gridClasses = [
    'grid',
    buildGridColsClasses(columns),
    gapMap[gap],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={gridClasses}>
      {items.map((item) => (
        <div
          key={item.id}
          className={[
            item.colSpan ? buildColSpanClasses(item.colSpan) : undefined,
            item.rowSpan ? buildRowSpanClasses(item.rowSpan) : undefined,
          ].filter(Boolean).join(' ') || undefined}
        >
          <MosaicTile item={item} />
        </div>
      ))}
    </div>
  );
}
