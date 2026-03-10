import type { ResourceMatch } from '../modules/external-proxy/resource-matcher.service';
import type { ResponseFilter } from './resource-access.types';

declare global {
  namespace Express {
    interface Request {
      /** Resource match result set by ResourceMatchMiddleware */
      resourceMatch?: ResourceMatch;
      /** External user identifier set by custom validator */
      externalUserId?: string;
      /** Response filter to apply to proxy response */
      responseFilter?: ResponseFilter;
    }
  }
}
