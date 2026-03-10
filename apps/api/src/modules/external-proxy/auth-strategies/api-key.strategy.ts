import type { Integration } from '../../../entities/integration.entity';
import type { ExternalAuthStrategy, ExternalCredentials } from './external-auth-strategy.interface';

export class ApiKeyAuthStrategy implements ExternalAuthStrategy {
  async getAuthHeaders(
    integration: Integration,
    _credentials: ExternalCredentials | null,
  ): Promise<Record<string, string>> {
    const config = integration.authConfig as Record<string, string> | null;
    const headerName = config?.headerName ?? 'X-Api-Key';
    const apiKey = config?.apiKey ?? '';

    if (!apiKey) {
      throw new Error('No API key configured for this integration');
    }

    return { [headerName]: apiKey };
  }
}
