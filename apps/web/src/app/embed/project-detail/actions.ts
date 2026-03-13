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
    'x-external-user-id': String(user.id ?? ''),
  };

  const [projectRes, cfTypesRes, cfDefsRes] = await Promise.all([
    fetch(`${API_BASE_URL}/ext/clients/${user.client_id}/projects/${projectId}`, { headers: extHeaders }),
    fetch(`${API_BASE_URL}/ext/custom_fields/cf_types`, { headers: extHeaders }),
    fetch(`${API_BASE_URL}/ext/clients/${user.client_id}/definitions_by_class?target_class=projects`, { headers: extHeaders }),
  ]);

  const [projectData, cfTypesData, cfDefsData] = await Promise.all([
    projectRes.json().catch(() => null),
    cfTypesRes.json().catch(() => null),
    cfDefsRes.json().catch(() => null),
  ]);

  const errors: Record<string, string> = {};

  if (!projectRes.ok) {
    errors.project = projectData?.errors?.join(', ') || projectData?.error || `Error ${projectRes.status}`;
  }
  if (!cfTypesRes.ok) {
    errors.cfTypes = cfTypesData?.errors?.join(', ') || cfTypesData?.error || `Error ${cfTypesRes.status}`;
  }
  if (!cfDefsRes.ok) {
    errors.cfDefinitions = cfDefsData?.errors?.join(', ') || cfDefsData?.error || `Error ${cfDefsRes.status}`;
  }

  if (errors.project && !projectData) {
    return { success: false as const, error: errors.project };
  }

  return {
    success: true as const,
    project: projectData,
    cfTypes: Array.isArray(cfTypesData) ? cfTypesData : [],
    cfDefinitions: Array.isArray(cfDefsData) ? cfDefsData : [],
    errors,
  };
}
