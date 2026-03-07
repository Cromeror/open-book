'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ResponseMetadata, HttpMethod } from '@/types/business';
import { formatValue } from '@/lib/formatters';
import { responseMetadataToDetail } from '@/lib/validations/response-metadata';
import { Icon } from '@/components/layout/Icon';

interface GenericDetailProps {
  responseMetadata: ResponseMetadata;
  endpoint: string;
  method: HttpMethod;
}

interface DataItem {
  [key: string]: unknown;
}

/**
 * Generic detail view component that displays a single record.
 * Fields are derived from ResponseMetadata schema properties.
 */
export function GenericDetail({
  responseMetadata,
  endpoint,
}: GenericDetailProps) {
  const [data, setData] = useState<DataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fields = useMemo(
    () => responseMetadataToDetail(responseMetadata),
    [responseMetadata],
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(endpoint, {
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
  }, [endpoint]);

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
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Icon name="AlertCircle" className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>Registro no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      {fields.length === 0 ? (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 m-6">
          <p className="text-sm text-yellow-800">
            No se encontraron campos para mostrar.
          </p>
        </div>
      ) : (
        <dl className="divide-y divide-gray-200">
          {fields.map((col) => (
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
      )}
    </div>
  );
}
