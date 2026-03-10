import type { Integration } from '../../../entities/integration.entity';
import type { ExternalAuthStrategy, ExternalCredentials } from './external-auth-strategy.interface';

export class BearerAuthStrategy implements ExternalAuthStrategy {
  async getAuthHeaders(
    integration: Integration,
    credentials: ExternalCredentials | null,
  ): Promise<Record<string, string>> {
    // Token can come from authConfig or credentials
    const token =
      (integration.authConfig as Record<string, string>)?.token ??
      (credentials as unknown as Record<string, string>)?.token ??
      '';

    if (!token) {
      throw new Error('No bearer token configured for this integration');
    }

    return { Authorization: `Bearer ${token}` };
  }
}
