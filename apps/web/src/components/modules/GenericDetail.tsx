'use client';

import { useEffect, useState } from 'react';
import type { ReadActionSettings } from '@/lib/types/modules';
import { formatValue } from '@/lib/formatters';
import { Icon } from '@/components/layout/Icon';

interface GenericDetailProps {
  config: ReadActionSettings;
  endpoint: string;
  entity: string;
  id: string;
  onEdit?: () => void;
  onBack: () => void;
}

interface DataItem {
  id: string;
  [key: string]: unknown;
}

/**
 * Generic detail view component that displays a single record
 */
export function GenericDetail({
  config,
  endpoint,
  entity,
  id,
  onEdit,
  onBack,
}: GenericDetailProps) {
  const [data, setData] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${endpoint}/${id}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error al cargar datos');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, id]);

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
              onClick={onBack}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Icon name="AlertCircle" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>{entity} no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Detalle de {entity}
        </h2>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            <Icon name="Pencil" className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      <dl className="divide-y divide-gray-200">
        {config.listColumns.map((col) => (
          <div
            key={col.field}
            className="px-6 py-4 grid grid-cols-3 gap-4"
          >
            <dt className="text-sm font-medium text-gray-500">{col.label}</dt>
            <dd className="text-sm text-gray-900 col-span-2">
              {formatValue(data[col.field], col.format)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
