'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const AUTH_TYPES = [
  { value: 'none', label: 'Sin autenticacion' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'api_key', label: 'API Key' },
  { value: 'devise_token_auth', label: 'Devise Token Auth' },
] as const;

const CONNECTION_TYPES = [
  { value: 'passthrough', label: 'Passthrough' },
  { value: 'oauth', label: 'OAuth' },
  { value: 'api_key_stored', label: 'API Key (almacenado)' },
] as const;

const integrationFormSchema = z.object({
  code: z
    .string()
    .min(1, 'El codigo es requerido')
    .max(50)
    .regex(/^[a-z][a-z0-9_-]*$/, 'Solo minusculas, numeros, guiones y guion bajo'),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional().nullable(),
  baseUrl: z.string().url('Debe ser una URL valida').max(500),
  authType: z.enum(['none', 'bearer', 'basic', 'api_key', 'devise_token_auth']),
  connectionType: z.enum(['passthrough', 'oauth', 'api_key_stored']),
});

type IntegrationFormValues = z.infer<typeof integrationFormSchema>;

interface IntegrationFormProps {
  defaultValues?: Partial<IntegrationFormValues>;
  onSubmit: (data: IntegrationFormValues) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  loading?: boolean;
}

export function IntegrationForm({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
}: IntegrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      baseUrl: '',
      authType: 'none',
      connectionType: 'passthrough',
      ...defaultValues,
    },
  });

  const authType = watch('authType');

  const authConfigHint: Record<string, string> = {
    none: '',
    bearer: 'El token sera proporcionado por el contexto del usuario (passthrough)',
    basic: 'Las credenciales seran proporcionadas por el contexto del usuario',
    api_key: 'La API key sera proporcionada por el contexto del usuario',
    devise_token_auth: 'Headers: access-token, client, uid, token-type, expiry. Proporcionados via postMessage',
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Informacion General
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Codigo
            </label>
            <input
              id="code"
              type="text"
              disabled={isEditing}
              {...register('code')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="captudata"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Captudata"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripcion
          </label>
          <textarea
            id="description"
            rows={2}
            {...register('description')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Descripcion de la integracion..."
          />
        </div>

        <div className="mt-4">
          <label htmlFor="baseUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Base URL
          </label>
          <input
            id="baseUrl"
            type="url"
            {...register('baseUrl')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://api-staging.captudata.com"
          />
          {errors.baseUrl && (
            <p className="mt-1 text-xs text-red-600">{errors.baseUrl.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Configuracion de Conexion
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="connectionType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Conexion
            </label>
            <select
              id="connectionType"
              {...register('connectionType')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {CONNECTION_TYPES.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="authType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Autenticacion
            </label>
            <select
              id="authType"
              {...register('authType')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {AUTH_TYPES.map((at) => (
                <option key={at.value} value={at.value}>
                  {at.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {authConfigHint[authType] && (
          <p className="mt-3 rounded-md bg-blue-50 p-3 text-xs text-blue-700">
            {authConfigHint[authType]}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Integracion'}
        </button>
      </div>
    </form>
  );
}
