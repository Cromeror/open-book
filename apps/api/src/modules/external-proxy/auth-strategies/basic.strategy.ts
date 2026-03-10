import type { Integration } from '../../../entities/integration.entity';
import type { ExternalAuthStrategy, ExternalCredentials } from './external-auth-strategy.interface';

export class BasicAuthStrategy implements ExternalAuthStrategy {
  async getAuthHeaders(
    _integration: Integration,
    credentials: ExternalCredentials | null,
  ): Promise<Record<string, string>> {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('No credentials configured for basic auth');
    }

    const encoded = Buffer.from(
      `${credentials.email}:${credentials.password}`,
    ).toString('base64');

    return { Authorization: `Basic ${encoded}` };
  }
}
