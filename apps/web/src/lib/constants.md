# Constants Organization Pattern

This document explains how constants should be organized in the web application.

## Pattern Overview

The project follows a **domain-proximity pattern** for constants:

1. **Global constants** → `lib/constants.ts` (app-wide utilities)
2. **Domain-specific constants** → Near their usage in component/feature folders

## Examples

### ✅ Global Constants (`lib/constants.ts`)

Use for constants that are shared across **multiple domains/features**:

```typescript
// apps/web/src/lib/constants.ts
export const ICON_MAP: Record<string, string> = {
  Target: '🎯',
  Users: '👥',
  // ... used throughout the app
};
```

**When to use:**
- Icon mappings used by multiple modules
- App-wide configuration values
- Shared utility constants

### ✅ Domain-Specific Constants (Near Usage)

Use for constants specific to a **single domain or feature**:

```typescript
// apps/web/src/components/organisms/module-form/constants.ts
export const DEFAULT_CRUD_ACTIONS: ModuleAction[] = [
  { code: 'read', label: 'Ver', ... },
  { code: 'create', label: 'Crear', ... },
  // ... only used by module-form
];

// apps/web/src/components/organisms/resources/constants.ts
export const CAPABILITY_PRESETS: Record<string, CapabilityPreset> = {
  crud: { ... },
  readOnly: { ... },
  // ... only used by resource forms
};
```

**When to use:**
- Presets/templates for a specific feature
- Configuration specific to one domain
- Constants that are tightly coupled to a component

## Decision Tree

```
Is the constant used by multiple, unrelated features?
├─ YES → lib/constants.ts (global)
└─ NO  → Create constants.ts in the feature/component folder (domain-specific)
```

## Project Structure

```
apps/web/src/
├── lib/
│   └── constants.ts                           # Global constants (ICON_MAP, etc.)
│
├── components/
│   └── organisms/
│       ├── module-form/
│       │   └── constants.ts                   # Module-specific constants
│       └── resources/
│           └── constants.ts                   # HATEOAS resource presets
│
└── config/
    └── env.ts                                 # Environment configuration (uses Zod)
```

## Naming Conventions

### Constants (Exported)
- Use `SCREAMING_SNAKE_CASE` for constant objects/arrays
- Examples: `ICON_MAP`, `DEFAULT_CRUD_ACTIONS`, `CAPABILITY_PRESETS`

### Helper Functions
- Use `camelCase` for utility functions
- Examples: `getIconEmoji()`, `getPresetOptions()`, `isCrudActionCode()`

### Files
- Always use `constants.ts` (never `constant.ts` or `consts.ts`)
- One file per feature/domain
- Add JSDoc comments to explain purpose

## Migration Guide

If you find constants in the wrong place:

### Move from global to domain-specific:
```typescript
// Before: apps/web/src/lib/constants.ts
export const CAPABILITY_PRESETS = { ... }; // ❌ Only used by resources

// After: apps/web/src/components/organisms/resources/constants.ts
export const CAPABILITY_PRESETS = { ... }; // ✅ Near usage
```

### Move from inline to constants file:
```typescript
// Before: ResourceForm.tsx (inline)
const PRESETS = { crud: {...}, readOnly: {...} }; // ❌ Hard to reuse

// After: constants.ts (separate file)
export const CAPABILITY_PRESETS = { ... }; // ✅ Reusable and testable
```

## Related Patterns

- **Validation schemas:** `lib/validations/*.schema.ts` (Zod schemas)
- **Types:** `types/*.ts` (TypeScript interfaces)
- **Configuration:** `config/*.ts` (App configuration)
- **API clients:** `lib/api/*.ts` (Backend communication)

## Examples in Codebase

| Constant | Location | Scope |
|----------|----------|-------|
| `ICON_MAP` | `lib/constants.ts` | Global (used by multiple modules) |
| `DEFAULT_CRUD_ACTIONS` | `components/organisms/module-form/constants.ts` | Domain (module forms only) |
| `CAPABILITY_PRESETS` | `components/organisms/resources/constants.ts` | Domain (resource forms only) |

## Best Practices

1. ✅ **Keep constants close to usage** - Easier to understand context
2. ✅ **Export helper functions** - Don't force consumers to understand structure
3. ✅ **Add JSDoc comments** - Explain what the constants are for
4. ✅ **Use TypeScript** - Type-safe constant definitions
5. ❌ **Avoid magic numbers** - Extract to named constants
6. ❌ **Don't over-centralize** - Not everything needs to be in `lib/constants.ts`
