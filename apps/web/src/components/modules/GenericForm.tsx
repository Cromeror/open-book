'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import type { CreateActionSettings, UpdateActionSettings } from '@/lib/types/modules';
import { DynamicField } from './fields';

interface GenericFormProps {
  config: CreateActionSettings | UpdateActionSettings;
  endpoint: string;
  entity: string;
  mode: 'create' | 'edit';
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Generic form component that renders fields based on action settings
 */
export function GenericForm({
  config,
  endpoint,
  entity,
  mode,
  id,
  onSuccess,
  onCancel,
}: GenericFormProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(mode === 'edit');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Load existing data when editing
  useEffect(() => {
    if (mode === 'edit' && id) {
      setInitialLoading(true);
      fetch(endpoint, { credentials: 'include' })
        .then((res) => {
          if (!res.ok) throw new Error('Error al cargar datos');
          return res.json();
        })
        .then((data) => {
          reset(data);
        })
        .catch((err) => {
          setServerError(err.message);
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [mode, id, endpoint, reset]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    setServerError(null);

    try {
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al guardar');
      }

      onSuccess();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {mode === 'create' ? `Crear ${entity}` : `Editar ${entity}`}
      </h2>

      {serverError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {config.fields.map((field) => (
          <DynamicField
            key={field.name}
            field={field}
            register={register}
            errors={errors}
            disabled={loading}
          />
        ))}
      </div>

      <div className="flex gap-4 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
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
              Guardando...
            </span>
          ) : (
            'Guardar'
          )}
        </button>
      </div>
    </form>
  );
}
