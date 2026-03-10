'use server';

import { publicEnv } from '@/config/env';

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL;

interface FetchProjectParams {
  authHeaders: {
    'access-token': string;
    client: string;
    uid: string;
    expiry: string;
  };
  user: { id?: unknown; client_id: number };
  projectId: string;
  apiUrl: string;
}

export async function fetchProjectData(params: FetchProjectParams) {
  const { authHeaders, user, projectId, apiUrl } = params;

  const headers: Record<string, string> = {
    'access-token': authHeaders['access-token'] || '',
    client: authHeaders.client || '',
    uid: authHeaders.uid || '',
    expiry: authHeaders.expiry || '',
    'token-type': 'Bearer',
  };

  const extHeaders: Record<string, string> = {
    ...headers,
    'x-external-user-id': String(user.id ?? authHeaders.uid ?? ''),
  };

  const [projectRes, cfTypesRes, cfDefsRes] = await Promise.all([
    fetch(`${apiUrl}/clients/${user.client_id}/projects/${projectId}/`, { headers }),
    fetch(`${apiUrl}/custom_fields/cf_types`, { headers }),
    fetch(`${API_BASE_URL}/ext/clients/${user.client_id}/definitions_by_class?target_class=projects`, { headers: extHeaders }),
  ]);

  const [projectData, cfTypesData, cfDefsData] = await Promise.all([
    projectRes.json(),
    cfTypesRes.json(),
    cfDefsRes.json(),
  ]);

  if (!projectRes.ok) {
    const message = projectData.errors?.join(', ') || projectData.error || 'Error al consultar proyecto';
    return { success: false as const, error: message };
  }

  return {
    success: true as const,
    project: projectData,
    cfTypes: Array.isArray(cfTypesData) ? cfTypesData : [],
    cfDefinitions: Array.isArray(cfDefsData) ? cfDefsData : [],
  };
}
