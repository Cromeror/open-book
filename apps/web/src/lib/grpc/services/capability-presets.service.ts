/**
 * CapabilityPresets gRPC Service
 *
 * Client for the CapabilityPresets gRPC service.
 * Provides read-only access to active capability presets.
 *
 * This service maps gRPC transport types to business domain types.
 */

import { PROTO_FILES } from '../config';
import type { CapabilityPreset, PresetCapability, HttpMethod } from '@/types/business';
import { BaseGrpcService } from './base.service';

export class CapabilityPresetsService extends BaseGrpcService {
  constructor() {
    super(
      PROTO_FILES.capabilityPresets,
      'openbook.capabilitypresets',
      'CapabilityPresetsService',
    );
  }

  /**
   * Get all active capability presets
   * Requires JWT authentication
   *
   * @returns Business domain CapabilityPreset objects
   */
  async getActivePresets(token: string): Promise<CapabilityPreset[]> {
    const response = await this.call<
      Record<string, never>,
      GetActivePresetsResponseProto
    >('GetActivePresets', {}, token);

    return response.presets.map((preset) => this.mapToDomain(preset));
  }

  /**
   * Map gRPC proto response to business domain type
   */
  private mapToDomain(proto: CapabilityPresetProto): CapabilityPreset {
    return {
      id: proto.id,
      label: proto.label,
      description: proto.description || '',
      capabilities: (proto.capabilities || []).map((cap): PresetCapability => ({
        name: cap.name,
        method: cap.method as HttpMethod,
        urlPattern: cap.urlPattern || '',
      })),
      isSystem: proto.isSystem,
      order: proto.order,
    };
  }
}

/**
 * Proto response types
 */
interface PresetCapabilityProto {
  name: string;
  method: string;
  urlPattern?: string;
}

interface CapabilityPresetProto {
  id: string;
  label: string;
  description?: string;
  capabilities: PresetCapabilityProto[];
  isSystem: boolean;
  order: number;
}

interface GetActivePresetsResponseProto {
  presets: CapabilityPresetProto[];
}
