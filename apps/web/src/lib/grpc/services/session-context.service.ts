/**
 * SessionContext gRPC Service
 *
 * Client for the SessionContext gRPC service.
 * Returns a flat object with resolved user context data.
 */

import { PROTO_FILES } from '../config';
import type { GrpcSessionContext, GrpcSessionContextMetadata } from '../types';
import type { SessionContext, SessionContextFieldDescriptor } from '@/types/business';
import { BaseGrpcService } from './base.service';

export class SessionContextService extends BaseGrpcService {
  constructor() {
    super(PROTO_FILES.sessionContext, 'openbook.sessioncontext', 'SessionContextService');
  }

  /**
   * Get session context for the authenticated user
   * Returns a flat object with user data, condominium, and preferences
   */
  async getSessionContext(token: string): Promise<SessionContext> {
    const response = await this.call<Record<string, never>, GrpcSessionContext>(
      'GetSessionContext',
      {},
      token,
    );
    return this.fromProto(response);
  }

  /**
   * Get session context metadata (schema)
   * Returns field names and types of the SessionContext structure
   */
  async getSessionContextMetadata(token: string): Promise<SessionContextFieldDescriptor[]> {
    const response = await this.call<Record<string, never>, GrpcSessionContextMetadata>(
      'GetSessionContextMetadata',
      {},
      token,
    );
    return (response.fields ?? []).map((f) => ({
      name: f.name || '',
      type: f.type || '',
    }));
  }

  private fromProto(proto: GrpcSessionContext): SessionContext {
    return {
      userId: proto.userId || '',
      userEmail: proto.userEmail || '',
      userFirstName: proto.userFirstName || '',
      userLastName: proto.userLastName || '',
      isSuperAdmin: proto.isSuperAdmin ?? false,
      condominiumId: proto.condominiumId || '',
      condominiumName: proto.condominiumName || '',
      userStateTheme: proto.userStateTheme || 'system',
      userStateLanguage: proto.userStateLanguage || 'es',
      userStateSidebarCollapsed: proto.userStateSidebarCollapsed ?? false,
    };
  }
}
