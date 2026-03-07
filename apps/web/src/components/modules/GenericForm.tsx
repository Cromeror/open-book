'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useMemo, useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormUiConfig } from '@/lib/types/modules';
import type { HttpMethod, PayloadMetadata } from '@/types/business';
import { HTTP_METHODS } from '@/types/business';
import { payloadMetadataToForm } from '@/lib/validations/payload-metadata';
import { DynamicField } from './fields';

type ConfigFormProps = {
  config: FormUiConfig;
  endpoint: string;
  mode: 'create' | 'edit';
  id?: string;
  onSuccess: () => void;
  onCancel: () => void;
};

type MetadataFormProps = {
  payloadMetadata: PayloadMetadata;
  endpoint: string;
  method: HttpMethod;
};

type GenericFormProps = ConfigFormProps | MetadataFormProps;

function hasConfig(props: GenericFormProps): props is ConfigFormProps {
  return 'config' in props;
}

/**
 * Generic form component that renders fields based on:
 * - FormUiConfig (admin-defined UI config), or
 * - PayloadMetadata (OpenAPI-like schema from resource HTTP method)
 */
export function GenericForm(props: GenericFormProps) {
  const { endpoint } = props;
  const isConfigMode = hasConfig(props);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditMode = isConfigMode
    ? props.mode === 'edit'
    : props.method === HTTP_METHODS.PATCH || props.method === HTTP_METHODS.PUT;

  const [initialLoading, setInitialLoading] = useState(isEditMode);

  const metadataForm = useMemo(() => {
    if (isConfigMode) return null;
    return payloadMetadataToForm(props.payloadMetadata);
  }, [isConfigMode ? null : props.payloadMetadata]);

  const fields = isConfigMode ? props.config.fields : (metadataForm?.fields ?? []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: metadataForm ? zodResolver(metadataForm.schema) : undefined,
  });

  // Stable ref for reset to avoid re-triggering the fetch effect
  const resetRef = useRef(reset);
  resetRef.current = reset;

  // For PATCH/PUT: load existing data via GET to the same endpoint (REST convention).
  // If the GET fails, continue with an empty form — do not block editing.
  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;
    setInitialLoading(true);

    fetch(endpoint, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar datos');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) resetRef.current(data);
      })
      .catch(() => {
        // GET failed — continue with empty form
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });

    return () => { cancelled = true; };
  }, [isEditMode, endpoint]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    setServerError(null);

    try {
      const method = isConfigMode
        ? props.mode === 'create' ? 'POST' : 'PUT'
        : props.method;

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

      if (isConfigMode) {
        props.onSuccess();
      } else {
        setSuccess(true);
      }
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

  if (success) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 p-6">
        <p className="text-sm text-green-800">Operacion realizada con exito.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {serverError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      {fields.length === 0 ? (
        <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            No se encontraron campos para este formulario.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <DynamicField
              key={field.name}
              field={field}
              register={register}
              errors={errors}
              disabled={loading}
            />
          ))}
        </div>
      )}

      <div className="flex gap-4 justify-end pt-4 border-t">
        {isConfigMode && (
          <button
            type="button"
            onClick={props.onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading || fields.length === 0}
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
