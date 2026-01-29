/**
 * Capability Presets API Client
 *
 * HTTP client for managing capability presets
 */

export interface CapabilityPreset {
  id: string;
  label: string;
  description: string | null;
  capabilities: Array<{
    name: string;
    method: string;
    urlPattern: string;
    permission?: string;
  }>;
  isSystem: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresetDto {
  id: string;
  label: string;
  description?: string | null;
  capabilities: Array<{
    name: string;
    method: string;
    urlPattern: string;
    permission?: string;
  }>;
  isSystem?: boolean;
  isActive?: boolean;
  order?: number;
}

export interface UpdatePresetDto {
  label?: string;
  description?: string | null;
  capabilities?: Array<{
    name: string;
    method: string;
    urlPattern: string;
    permission?: string;
  }>;
  isActive?: boolean;
  order?: number;
}

/**
 * Get all active capability presets
 */
export async function getCapabilityPresets(): Promise<CapabilityPreset[]> {
  const response = await fetch('/api/admin/capability-presets', {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch capability presets');
  }

  return response.json();
}

/**
 * Get a single capability preset by ID
 */
export async function getCapabilityPreset(id: string): Promise<CapabilityPreset> {
  const response = await fetch(`/api/admin/capability-presets/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch capability preset: ${id}`);
  }

  return response.json();
}

/**
 * Create a new capability preset
 */
export async function createCapabilityPreset(data: CreatePresetDto): Promise<CapabilityPreset> {
  const response = await fetch('/api/admin/capability-presets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create capability preset');
  }

  return response.json();
}

/**
 * Update an existing capability preset
 */
export async function updateCapabilityPreset(
  id: string,
  data: UpdatePresetDto
): Promise<CapabilityPreset> {
  const response = await fetch(`/api/admin/capability-presets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update capability preset');
  }

  return response.json();
}

/**
 * Delete a capability preset (soft delete)
 */
export async function deleteCapabilityPreset(id: string): Promise<void> {
  const response = await fetch(`/api/admin/capability-presets/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    // Only try to parse JSON if there's content
    if (response.status !== 204) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete capability preset');
    }
    throw new Error('Failed to delete capability preset');
  }
}

/**
 * Toggle active status of a capability preset
 */
export async function toggleCapabilityPresetStatus(id: string): Promise<CapabilityPreset> {
  const response = await fetch(`/api/admin/capability-presets/${id}/toggle`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle preset status');
  }

  return response.json();
}
