'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, Calendar, DollarSign, Users, TrendingUp, Loader2 } from 'lucide-react';

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
    user: { client_id: number; [key: string]: unknown };
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
  const [connected, setConnected] = useState(false);

  const fetchProject = useCallback(
    async (payload: EmbedMessage['payload']) => {
      const { authHeaders, user, projectId, apiUrl } = payload;
      if (!authHeaders || !user?.client_id || !projectId) return;

      setLoading(true);
      setError('');

      const headers: Record<string, string> = {
        'access-token': authHeaders['access-token'] || '',
        client: authHeaders.client || '',
        uid: authHeaders.uid || '',
        expiry: authHeaders.expiry || '',
        'token-type': 'Bearer',
      };

      // Headers for the /ext/ proxy (internal permission check)
      const extHeaders: Record<string, string> = {
        ...headers,
        'x-external-user-id': String(user.id ?? authHeaders.uid ?? ''),
      };

      try {
        console.log(apiUrl);
        
        const [projectRes, cfTypesRes, cfDefsRes] = await Promise.all([
          fetch(`${apiUrl}/clients/${user.client_id}/projects/${projectId}/`, { headers }),
          fetch(`${apiUrl}/custom_fields/cf_types`, { headers }),
          fetch(`http://localhost:3001/api/ext/clients/${user.client_id}/definitions_by_class?target_class=projects`, { headers: extHeaders }),
        ]);

        const [projectData, cfTypesData, cfDefsData] = await Promise.all([
          projectRes.json(),
          cfTypesRes.json(),
          cfDefsRes.json(),
        ]);

        if (!projectRes.ok) {
          throw new Error(
            projectData.errors?.join(', ') || projectData.error || 'Error al consultar proyecto'
          );
        }

        setProject(projectData);
        setCfTypes(Array.isArray(cfTypesData) ? cfTypesData : []);
        setCfDefinitions(Array.isArray(cfDefsData) ? cfDefsData : []);
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
            Esperando conexión con la aplicación padre...
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

      {/* Custom Fields */}
      {project.cf_values && project.cf_values.length > 0 && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Campos Personalizados
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.cf_values.map((cfValue) => {
              const definition = cfDefinitions.find(
                (d) => d.id === cfValue.cf_definition_id
              );
              const cfType = definition
                ? cfTypes.find((t) => t.id === definition.cf_type_id)
                : null;

              return (
                <div
                  key={cfValue.id}
                  className="rounded-md border border-gray-200 p-4"
                >
                  <p className="text-sm font-medium text-gray-500">
                    {definition?.name || cfValue.definition_name}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {cfValue.humanize_value || cfValue.value || '-'}
                    {cfValue.unit && (
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

      {/* Raw data */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            Ver datos completos del proyecto
          </summary>
          <pre className="mt-3 max-h-96 overflow-auto rounded-md bg-gray-100 p-4 text-xs">
            {JSON.stringify(project, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
