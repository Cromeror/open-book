import type { Request } from 'express';

import { Integration } from '../../../entities/integration.entity';

export interface ExternalCredentials {
  email: string;
  password: string;
}

/**
 * Strategy interface for authenticating with external systems.
 * Each AuthType has a corresponding strategy implementation.
 */
export interface ExternalAuthStrategy {
  /**
   * Generate authentication headers for the external system.
   *
   * @param integration - The integration configuration
   * @param credentials - Decrypted credentials (may be null for NONE auth)
   * @param req - The incoming request (used by passthrough strategies to forward headers)
   * @returns Headers to attach to the outgoing request
   */
  getAuthHeaders(
    integration: Integration,
    credentials: ExternalCredentials | null,
    req?: Request,
  ): Promise<Record<string, string>>;
}
