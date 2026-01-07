'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ReadActionSettings } from '@/lib/types/modules';
import { formatValue } from '@/lib/formatters';
import { Icon } from '@/components/layout/Icon';

interface GenericListProps {
  config: ReadActionSettings;
  endpoint: string;
  entity: string;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface DataItem {
  id: string;
  [key: string]: unknown;
}

/**
 * Generic list/table component that renders data based on ReadActionSettings
 */
export function GenericList({
  config,
  endpoint,
  entity,
  onView,
  onEdit,
  onDelete,
}: GenericListProps) {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(
    config.defaultSort?.field || null
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    config.defaultSort?.order || 'asc'
  );

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

  const handleSort = (field: string) => {
    if (!config.sortable?.includes(field)) return;
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const isSortable = (field: string) => config.sortable?.includes(field);

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

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {config.listColumns.map((col) => (
                <th
                  key={col.field}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    isSortable(col.field)
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
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {config.listColumns.map((col) => (
                  <td
                    key={col.field}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {formatValue(row[col.field], col.format)}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(row.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver
                    </button>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row.id)}
                        className="text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Icon name="Inbox" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay {entity.toLowerCase()}s registrados.</p>
        </div>
      )}
    </div>
  );
}
