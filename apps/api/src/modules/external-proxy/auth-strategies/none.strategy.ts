import type { ExternalAuthStrategy } from './external-auth-strategy.interface';

export class NoneAuthStrategy implements ExternalAuthStrategy {
  async getAuthHeaders(): Promise<Record<string, string>> {
    return {};
  }
}
