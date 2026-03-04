/**
 * Utility exports
 */
export {
  Immutable,
  isImmutableEntity,
  SoftDeleteHelpers,
  IMMUTABLE_ENTITY_KEY,
} from './soft-delete';

export { hashPassword, comparePassword } from './password';

export { resolveTemplateUrl, TEMPLATE_PLACEHOLDER_RE, SESSION_PLACEHOLDER_RE, UNRESOLVED_PLACEHOLDER_RE } from './resolve-template-url';
