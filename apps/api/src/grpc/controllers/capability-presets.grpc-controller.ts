import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { CapabilityPresetsService } from '../../modules/admin/capability-presets/capability-presets.service';
import { GrpcExceptionFilter } from '../filters/grpc-exception.filter';
import { GrpcJwtAuthGuard } from '../guards/grpc-jwt-auth.guard';
import { GrpcPermissionsGuard } from '../guards/grpc-permissions.guard';
import { GrpcCurrentUser } from '../decorators/grpc-user.decorator';
import { RequestUser } from '../../modules/auth/strategies/jwt.strategy';
import { CapabilityPreset } from '../../entities/capability-preset.entity';

/**
 * gRPC Controller for Capability Presets
 *
 * Implements the CapabilityPresetsService proto definition.
 * Provides read-only access to active capability presets.
 * Requires JWT authentication and SuperAdmin role (consistent with HTTP endpoint).
 */
@Controller()
@UseGuards(GrpcJwtAuthGuard, GrpcPermissionsGuard)
@UseFilters(GrpcExceptionFilter)
export class CapabilityPresetsGrpcController {
  constructor(
    private readonly capabilityPresetsService: CapabilityPresetsService,
  ) {}

  /**
   * Get all active capability presets
   * Requires SuperAdmin role
   */
  @GrpcMethod('CapabilityPresetsService', 'GetActivePresets')
  async getActivePresets(
    _request: Record<string, never>,
    @GrpcCurrentUser() user: RequestUser,
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Forbidden: SuperAdmin access required');
    }

    const presets = await this.capabilityPresetsService.findAll(false);

    return {
      presets: presets.map((preset) => this.toProtoPreset(preset)),
    };
  }

  /**
   * Convert entity to proto format
   */
  private toProtoPreset(preset: CapabilityPreset) {
    return {
      id: preset.id,
      label: preset.label,
      description: preset.description || '',
      capabilities: preset.capabilities.map((cap) => ({
        name: cap.name,
        method: cap.method,
        url_pattern: cap.urlPattern,
      })),
      is_system: preset.isSystem,
      order: preset.order,
    };
  }
}
