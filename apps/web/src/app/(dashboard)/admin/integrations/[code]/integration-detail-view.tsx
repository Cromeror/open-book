'use client';

import type { Integration } from '@/types/business/integration.types';

const AUTH_TYPE_LABELS: Record<string, string> = {
  none: 'Sin autenticacion',
  bearer: 'Bearer Token',
  basic: 'Basic Auth',
  api_key: 'API Key',
  devise_token_auth: 'Devise Token Auth',
};

const CONNECTION_TYPE_LABELS: Record<string, string> = {
  passthrough: 'Passthrough',
  oauth: 'OAuth',
  api_key_stored: 'API Key (almacenado)',
};

interface Props {
  integration: Integration;
}

export function IntegrationDetailView({ integration }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{integration.name}</h1>
          <code className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-sm font-mono text-gray-700">
            {integration.code}
          </code>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
            integration.isActive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {integration.isActive ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      {integration.description && (
        <p className="text-sm text-gray-600">{integration.description}</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Conexion
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500">Base URL</dt>
              <dd className="mt-0.5 font-mono text-sm text-gray-900">{integration.baseUrl}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Tipo de Conexion</dt>
              <dd className="mt-0.5">
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                  {CONNECTION_TYPE_LABELS[integration.connectionType] || integration.connectionType}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Tipo de Autenticacion</dt>
              <dd className="mt-0.5">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {AUTH_TYPE_LABELS[integration.authType] || integration.authType}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Configuracion de Auth
          </h3>
          {integration.authConfig ? (
            <pre className="rounded-md bg-gray-50 p-3 text-xs overflow-auto max-h-48">
              {JSON.stringify(integration.authConfig, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-gray-400 italic">Sin configuracion adicional</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">
          Metadata
        </h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">Creado</dt>
            <dd className="mt-0.5 text-sm text-gray-900">
              {new Date(integration.createdAt).toLocaleString('es-CO')}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Actualizado</dt>
            <dd className="mt-0.5 text-sm text-gray-900">
              {new Date(integration.updatedAt).toLocaleString('es-CO')}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
