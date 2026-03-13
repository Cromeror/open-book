'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchProjectData } from './actions';

interface AuthHeaders {
  'access-token': string;
  client: string;
  uid: string;
  expiry: string;
  'token-type': string;
}

interface EmbedMessage {
  type: 'embed:init' | 'embed:apply';
  payload: {
    authHeaders: AuthHeaders;
    user: { client_id: number;[key: string]: unknown };
    projectId: string;
    apiUrl: string;
  };
}

interface CfValue {
  id: number;
  value: string;
  cf_definition_id: number;
  definition_name: string;
  target_id: number;
  definition_type_id: number;
  unit: string | null;
  humanize_value: string;
}

interface CfType {
  id: number;
  name: string;
}

interface CfDefinition {
  id: number;
  name: string;
  cf_type_id: number;
  target_class: string;
  units: string | null;
  options: string[] | null;
}

interface ProjectData {
  id: number;
  name: string;
  description: string;
  project_type: string;
  client_id: number;
  archived: boolean;
  cf_values: CfValue[];
  [key: string]: unknown;
}

export default function ProjectDetailClient() {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [cfTypes, setCfTypes] = useState<CfType[]>([]);
  const [cfDefinitions, setCfDefinitions] = useState<CfDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestErrors, setRequestErrors] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState(false);
  const [externalUserId, setExternalUserId] = useState<string>('');

  const fetchProject = useCallback(
    async (payload: EmbedMessage['payload']) => {
      const { authHeaders, user, projectId, apiUrl } = payload;
      if (!authHeaders || !user?.client_id || !projectId) return;

      setLoading(true);
      setError('');
      setRequestErrors({});
      setExternalUserId(String(user.id ?? ''));

      try {
        const result = await fetchProjectData({ authHeaders, user, projectId, apiUrl });

        if (!result.success) {
          throw new Error(result.error);
        }

        setProject(result.project);
        setCfTypes(result.cfTypes);
        setCfDefinitions(result.cfDefinitions);
        if (result.errors && Object.keys(result.errors).length > 0) {
          setRequestErrors(result.errors);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error en la petición');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data as EmbedMessage;
      if (!data?.type) return;

      if (data.type === 'embed:init') {
        setConnected(true);
      }

      if (data.type === 'embed:init' || data.type === 'embed:apply') {
        fetchProject(data.payload);
      }
    }

    window.addEventListener('message', handleMessage);

    // Notify parent that the iframe is ready
    window.parent.postMessage({ type: 'embed:ready' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, [fetchProject]);

  if (!connected && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  if (loading && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-gray-500">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-md bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {loading && (
        <div className="mb-4 flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Actualizando...
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 rounded-md bg-gray-200 px-3 py-2 text-xs text-gray-700">
        <span className="font-semibold">x-external-user-id:</span> {externalUserId || '(vacío)'}
      </div>

      <div className="mb-6 space-y-2">
        <details className="rounded-lg bg-gray-100">
          <summary className={`cursor-pointer select-none p-3 text-sm font-semibold ${requestErrors.project ? 'text-red-600' : 'text-gray-700'}`}>
            GET /ext/clients/:client_id/projects/:projectId
            {requestErrors.project && <span className="ml-2 font-normal text-red-500">({requestErrors.project})</span>}
          </summary>
          {requestErrors.project ? (
            <div className="rounded-b-lg bg-red-50 p-3 text-xs text-red-600">{requestErrors.project}</div>
          ) : (
            <pre className="overflow-auto rounded-b-lg bg-gray-900 p-3 text-xs text-green-400">
              {JSON.stringify(project, null, 2)}
            </pre>
          )}
        </details>

        <details className="rounded-lg bg-gray-100">
          <summary className={`cursor-pointer select-none p-3 text-sm font-semibold ${requestErrors.cfTypes ? 'text-red-600' : 'text-gray-700'}`}>
            GET /ext/custom_fields/cf_types
            {requestErrors.cfTypes && <span className="ml-2 font-normal text-red-500">({requestErrors.cfTypes})</span>}
          </summary>
          {requestErrors.cfTypes ? (
            <div className="rounded-b-lg bg-red-50 p-3 text-xs text-red-600">{requestErrors.cfTypes}</div>
          ) : (
            <pre className="overflow-auto rounded-b-lg bg-gray-900 p-3 text-xs text-green-400">
              {JSON.stringify(cfTypes, null, 2)}
            </pre>
          )}
        </details>

        <details className="rounded-lg bg-gray-100">
          <summary className={`cursor-pointer select-none p-3 text-sm font-semibold ${requestErrors.cfDefinitions ? 'text-red-600' : 'text-gray-700'}`}>
            GET /ext/clients/:client_id/definitions_by_class?target_class=projects
            {requestErrors.cfDefinitions && <span className="ml-2 font-normal text-red-500">({requestErrors.cfDefinitions})</span>}
          </summary>
          {requestErrors.cfDefinitions ? (
            <div className="rounded-b-lg bg-red-50 p-3 text-xs text-red-600">{requestErrors.cfDefinitions}</div>
          ) : (
            <pre className="overflow-auto rounded-b-lg bg-gray-900 p-3 text-xs text-green-400">
              {JSON.stringify(cfDefinitions, null, 2)}
            </pre>
          )}
        </details>
      </div>

      {/* Custom Fields — only show definitions the user has access to */}
      {cfDefinitions.length > 0 && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Campos Personalizados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cfDefinitions.map((definition) => {
              const cfValue = project.cf_values?.find(
                (v) => v.cf_definition_id === definition.id
              );
              const cfType = cfTypes.find((t) => t.id === definition.cf_type_id);

              return (
                <div
                  key={definition.id}
                  className="rounded-md border border-gray-200 p-4"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {definition.name}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {cfValue
                      ? (cfValue.humanize_value || cfValue.value || '-')
                      : '-'}
                    {cfValue?.unit && (
                      <span className="ml-1 text-sm font-normal text-gray-500">
                        {cfValue.unit}
                      </span>
                    )}
                  </p>
                  {cfType && (
                    <p className="mt-1 text-xs text-gray-400">
                      Tipo: {cfType.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
