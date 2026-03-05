'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type {
  ListUiConfig,
  HateoasDataItem,
  LinkUiConfig,
  PostActionStep,
} from '@/lib/types/modules';
import { formatValue } from '@/lib/formatters';
import { Icon } from '@/components/layout/Icon';

interface GenericListProps {
  config: ListUiConfig;
  linkConfig?: Record<string, LinkUiConfig>;
  endpoint: string;
  title: string;
  moduleCode: string;
}

const variantStyles: Record<string, string> = {
  default: 'text-gray-500 hover:text-blue-600',
  danger: 'text-gray-400 hover:text-red-600',
  warning: 'text-gray-400 hover:text-yellow-600',
  success: 'text-gray-400 hover:text-green-600',
};

/** Resolve :param placeholders in a path template using item data */
function resolvePath(template: string, item: HateoasDataItem): string {
  return template.replace(/:(\w+)/g, (_, key) => {
    const val = item[key];
    return val != null ? String(val) : '';
  });
}

export function GenericList({
  config,
  linkConfig,
  endpoint,
  title,
  moduleCode,
}: GenericListProps) {
  const router = useRouter();
  const [data, setData] = useState<HateoasDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(
    config.defaultSort?.field || null
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    config.defaultSort?.order || 'asc'
  );
  const [confirmState, setConfirmState] = useState<{
    message: string;
    variant?: 'danger' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (sortField) {
        params.set('sortBy', sortField);
        params.set('sortOrder', sortOrder);
      }
      const url = params.toString() ? `${endpoint}?${params}` : endpoint;
      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }

      const result = await response.json();
      setData(result.data || result.items || result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [endpoint, sortField, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Run steps after confirm (or from the start if no confirm) */
  const runSteps = useCallback(
    async (steps: PostActionStep[], href: string, method: string, item: HateoasDataItem) => {
      for (const step of steps) {
        switch (step.type) {
          case 'confirm':
            // Should not appear here — handled before calling runSteps
            break;
          case 'execute': {
            const res = await fetch(href, { method, credentials: 'include' });
            if (!res.ok) {
              setError('Error al ejecutar la accion');
              return;
            }
            break;
          }
          case 'navigate': {
            const resolved = resolvePath(step.path, item);
            router.push(`/m/${moduleCode}/${resolved}`);
            return;
          }
          case 'refresh': {
            await fetchData();
            break;
          }
        }
      }
    },
    [fetchData, moduleCode, router],
  );

  const onAction = useCallback(
    (rel: string, href: string, method: string, item: HateoasDataItem) => {
      const ui = linkConfig?.[rel];
      const steps = ui?.postAction;

      if (!steps || steps.length === 0) return;

      // Find confirm step — if present, show dialog first then run remaining
      const confirmIdx = steps.findIndex((s) => s.type === 'confirm');
      if (confirmIdx >= 0) {
        const confirmStep = steps[confirmIdx] as PostActionStep & { type: 'confirm' };
        const remaining = steps.slice(confirmIdx + 1);
        setConfirmState({
          message: confirmStep.message,
          variant: confirmStep.variant,
          onConfirm: () => {
            setConfirmState(null);
            runSteps(remaining, href, method, item);
          },
        });
        return;
      }

      // No confirm — run all steps
      runSteps(steps, href, method, item);
    },
    [linkConfig, runSteps],
  );

  const isSortable = (field: string) =>
    config.columns.some((col) => col.field === field && col.sortable);

  const handleSort = (field: string) => {
    if (!isSortable(field)) return;
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getRowLinks = (item: HateoasDataItem) => {
    if (!item._links) return [];
    return Object.entries(item._links);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-500">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <Icon name="AlertCircle" className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const confirmVariantStyles: Record<string, { bg: string; border: string; text: string; btn: string }> = {
    danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', btn: 'bg-red-600 hover:bg-red-700 text-white' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', btn: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
  };

  return (
    <>
      {/* Confirm dialog */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className={`rounded-lg border p-6 shadow-lg max-w-sm w-full mx-4 ${confirmVariantStyles[confirmState.variant ?? 'danger']?.bg ?? 'bg-white'} ${confirmVariantStyles[confirmState.variant ?? 'danger']?.border ?? 'border-gray-200'}`}>
            <p className={`text-sm ${confirmVariantStyles[confirmState.variant ?? 'danger']?.text ?? 'text-gray-800'}`}>
              {confirmState.message}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${confirmVariantStyles[confirmState.variant ?? 'danger']?.btn ?? 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {config.columns.map((col) => (
                  <th
                    key={col.field}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${isSortable(col.field)
                      ? 'cursor-pointer hover:bg-gray-100 select-none'
                      : ''
                      }`}
                    onClick={() => isSortable(col.field) && handleSort(col.field)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortField === col.field && (
                        <Icon
                          name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                          className="w-4 h-4"
                        />
                      )}
                    </div>
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row) => {
                const links = getRowLinks(row);
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {config.columns.map((col) => (
                      <td
                        key={col.field}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {formatValue(row[col.field], col.format)}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-1">
                        {links.map(([rel, link]) => {
                          const ui = linkConfig?.[rel];
                          const variant = ui?.variant ?? 'default';
                          const iconName = ui?.icon ?? 'MoreHorizontal';
                          return (
                            <button
                              key={rel}
                              type="button"
                              onClick={() => onAction(rel, link.href, link.method, row)}
                              className={`p-1.5 rounded-md transition-colors ${variantStyles[variant] ?? variantStyles.default}`}
                              title={ui?.label ?? rel}
                            >
                              <Icon name={iconName} className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Icon name="Inbox" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay {title.toLowerCase()}s registrados.</p>
          </div>
        )}
      </div>
    </>
  );
}
