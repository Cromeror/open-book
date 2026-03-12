# CaptuData Integration

This document describes how G.D.O.M. integrates with **CaptuData**, an external project management system. CaptuData uses [devise_token_auth](https://github.com/lynndylanhurley/devise_token_auth) for authentication.

## Architecture

```
Frontend (Next.js)
    ↓  HTTP (via Next.js API proxy routes)
G.D.O.M. API (NestJS)
    ↓  HTTP (devise_token_auth)
CaptuData API (https://api-staging.captudata.com)
```

G.D.O.M. acts as an **integration layer**: it stores organization credentials encrypted in its own database, authenticates with CaptuData server-side, and serves the data to the frontend. The frontend never sees credentials or directly contacts CaptuData.

---

## Data Model

### Integration (table: `integrations`)

A single integration record represents the CaptuData system:

| Field | Value |
|-------|-------|
| `code` | `captudata` |
| `name` | CaptuData |
| `baseUrl` | `https://api-staging.captudata.com` |
| `authType` | `devise_token_auth` |
| `connectionType` | `passthrough` |

### Organization (table: `organizations`)

Each organization maps to a **client** in CaptuData:

| Field | Description |
|-------|-------------|
| `code` | Unique identifier in G.D.O.M. (e.g., `bid`, `minfra`) |
| `name` | Display name |
| `externalId` | The **client ID** in CaptuData (used in API URLs like `/clients/{clientId}/users`) |
| `integrationId` | FK to the `captudata` integration |
| `encryptedCredentials` | AES-256-GCM encrypted JSON with `{ email, password }` for CaptuData auth |

### Seeded Organizations

| Code | Name | External ID (clientId) | Credentials |
|------|------|------------------------|-------------|
| `bid` | BID | 1 | Configured |
| `ayuda-en-accion` | Ayuda en Accion | 17 | Not configured |
| `minfra` | Minfra | 21 | Not configured |

### Resources (table: `resources`)

Pre-configured CaptuData API endpoints exposed through the resource registry:

| Code | Template URL | HATEOAS Links |
|------|-------------|---------------|
| `captudata-projects` | `/clients/{clientId}/projects/{projectId}` | → cf_types, → cf_definitions |
| `captudata-cf-types` | `/custom_fields/cf_types` | — |
| `captudata-cf-definitions` | `/clients/{clientId}/definitions_by_class` | — |

All resources are linked to the `captudata` integration, so their HATEOAS `_links` hrefs resolve with the integration's `baseUrl` as prefix.

---

## Credential Encryption

Credentials are encrypted at rest using **AES-256-GCM** (symmetric encryption with authentication).

**Implementation**: `apps/api/src/common/crypto.ts`

```
encrypt(plaintext) → iv (16 bytes) + authTag (16 bytes) + ciphertext  →  stored as hex string
decrypt(hexString) → original plaintext
```

**Key**: 32-byte hex string stored in `ENCRYPTION_KEY` environment variable. Generate with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Security rules**:
- `encryptedCredentials` is **never** returned to the frontend
- The API returns `hasCredentials: boolean` instead
- Decryption happens only server-side when making requests to CaptuData

---

## External Users Flow

### API Endpoint

```
GET /admin/organizations/:code/external-users
```

**Authentication**: Requires JWT + SuperAdmin guard.

### Server-Side Flow

1. Load organization with its integration
2. Decrypt credentials → `{ email, password }`
3. **Authenticate with CaptuData**: `POST {baseUrl}/auth/sign_in`
   - Body: `{ email, password }`
   - Response headers contain devise_token_auth tokens: `access-token`, `client`, `uid`, `token-type`, `expiry`
4. **Fetch users**: `GET {baseUrl}/clients/{externalId}/users`
   - Headers: auth tokens from step 3
5. Return `{ users: [...], error?: string }`

### Frontend Flow

1. **Server component** (`/admin/organizations/[code]/page.tsx`) fetches the organization
2. If `hasCredentials && integration`, it fetches external users server-side via the API
3. Passes users array to the client detail view component
4. **Client component** renders a table with: ID, Email, Name, Role

The external users are fetched **in real-time** on each page load (no caching).

---

## HATEOAS Link Resolution

When the HATEOAS interceptor resolves `_links` for a resource response:

```typescript
// apps/api/src/modules/hateoas/hateoas.service.ts
const baseUrl = config.targetIntegrationBaseUrl ?? env.API_BASE_URL ?? '';
const href = baseUrl.replace(/\/+$/, '') + resolvedPath;
```

- **External resource** (has integration): href = `https://api-staging.captudata.com/clients/1/projects/42`
- **Local resource** (no integration): href = `http://localhost:3001/api/goals`

Both cases produce **absolute URLs** so the frontend doesn't need to guess the domain.

---

## CRUD Operations

### Creating an Organization with Credentials

```
POST /admin/organizations
{
  "code": "new-org",
  "name": "New Organization",
  "externalId": "42",
  "integrationId": "<captudata-integration-uuid>",
  "credentials": {
    "email": "admin@org.com",
    "password": "secret"
  }
}
```

The `credentials` object is encrypted before storage. It is **not** included in any GET response.

### Updating Credentials

```
PATCH /admin/organizations/new-org
{
  "credentials": {
    "email": "new-admin@org.com",
    "password": "new-secret"
  }
}
```

Omit `credentials` to keep existing ones. Send `credentials: null` to clear them.

### Frontend Form Behavior

- **Create**: email/password fields are always shown and empty
- **Edit**: email/password fields are always empty (credentials are never loaded from the DB); a warning message is shown if credentials already exist indicating they will be kept unless new ones are entered

---

## File Map

### Backend (API)

| Path | Purpose |
|------|---------|
| `apps/api/src/common/crypto.ts` | AES-256-GCM encrypt/decrypt utility |
| `apps/api/src/config/env.ts` | `ENCRYPTION_KEY` env var validation |
| `apps/api/src/entities/organization.entity.ts` | Organization entity with `encryptedCredentials` |
| `apps/api/src/entities/integration.entity.ts` | Integration entity (authType, baseUrl) |
| `apps/api/src/modules/admin/organizations/` | Controller, Service, Module |
| `apps/api/src/modules/hateoas/hateoas.service.ts` | Integration-aware HATEOAS link builder |
| `apps/api/src/migrations/1741305800000-*` | Seed CaptuData integration + resources |
| `apps/api/src/migrations/1741306000000-*` | Seed organizations (BID, Ayuda en Accion, Minfra) |
| `apps/api/src/migrations/1741306100000-*` | Add credentials column + seed BID credentials |

### Frontend (Web)

| Path | Purpose |
|------|---------|
| `apps/web/src/types/business/organization.types.ts` | Organization + ExternalUser types |
| `apps/web/src/lib/http-api/organizations-api.ts` | HTTP client functions |
| `apps/web/src/app/api/admin/organizations/` | Next.js proxy routes (GET, POST, PATCH, DELETE, toggle, external-users) |
| `apps/web/src/app/(dashboard)/admin/organizations/` | Pages: list, new, [code] detail, [code]/edit |
| `apps/web/src/components/organisms/organizations/` | OrganizationList, OrganizationForm |

---

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `ENCRYPTION_KEY` | `apps/api/.env` | 64-character hex string (32 bytes) for AES-256-GCM |
| `API_BASE_URL` | `apps/api/.env` | Base URL for local resource HATEOAS links (e.g., `http://localhost:3001`) |
