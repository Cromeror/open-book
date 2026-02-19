# Architecture Decisions: Security & Communication

Document generated from architectural discussion — February 2026.

## Context

This document captures the decisions and reasoning behind OpenBook's frontend-backend communication strategy, authentication model, and the role of gRPC in the system.

---

## 1. Authentication Model

### Decision: Server-side session with HTTP-only cookies

All session information lives on the server. The browser never has direct access to tokens.

| Aspect | Implementation |
|--------|---------------|
| Access Token | `httpOnly`, `secure`, `sameSite: lax` cookie — 15 min TTL |
| Refresh Token | `httpOnly`, `secure`, `sameSite: lax` cookie — 7 days TTL |
| Client Storage | None. No `localStorage`, no `sessionStorage` |
| Session Context | Resolved server-side via gRPC, passed to client as React props (no tokens) |

### Why this is solid

- **XSS resistant**: `httpOnly` prevents JavaScript from reading tokens
- **CSRF resistant**: `sameSite: lax` ensures cookies only travel from same-origin navigations
- **Zero token exposure**: The browser receives resolved user data (name, preferences), never JWTs
- **Server-side validation**: Middleware validates every request against the backend (`/auth/me`)

---

## 2. Communication Strategy

### Decision: gRPC from Server Components/Actions, no public API proxy needed

```
Browser ──RSC/Actions──▶ Next.js Server ──gRPC (mTLS)──▶ NestJS Backend ──▶ PostgreSQL
```

The browser never communicates directly with the backend. Next.js acts as the only entry point.

### Evaluated alternatives

| Approach | Pros | Cons |
|----------|------|------|
| **Browser → Proxy → API** | Simple to implement | Extra hop, extra service to maintain, needs custom CSRF |
| **Browser → Next.js API Routes → API** | Works without gRPC | Still HTTP/JSON both ways, routes to maintain |
| **Server Components → gRPC → API** ✅ | No extra hop, Protobuf, mTLS, no public surface | Requires proto management |

### Why Server Components + gRPC wins

1. **No public API surface**: gRPC is only reachable from Next.js server, not from browsers
2. **No CSRF needed on gRPC**: Server-to-server calls don't need CSRF — the cookie-based auth happens at the Next.js layer, and the gRPC call is internal
3. **Fewer hops**: `Browser → Next.js → Backend` instead of `Browser → Proxy → Backend`
4. **Protobuf contracts**: Strict typing between frontend and backend, breaks are caught at compile time

---

## 3. gRPC vs REST Performance

### Conclusion: In local network, performance difference is negligible

| Factor | HTTP/JSON | gRPC/Protobuf |
|--------|-----------|---------------|
| Serialization | ~1-5ms | ~0.1-0.5ms |
| Payload size | Larger (text + repeated keys) | ~30-50% smaller (binary) |
| Network latency (local) | ~0.1ms | ~0.1ms |
| Connection reuse | Keep-alive | HTTP/2 multiplexed |
| **Typical DB query** | **5-50ms** | **5-50ms** |

The database is the real bottleneck. The transport layer difference (JSON vs Protobuf) is microseconds when services are on the same network.

### When gRPC performance matters

- Large lists (1000+ items): Protobuf serialization is significantly faster
- High concurrency (thousands of req/sec): HTTP/2 multiplexing reuses a single TCP connection
- Streaming: Native bidirectional streaming vs HTTP polling

### Why we still choose gRPC

The value of gRPC in this project is **not primarily performance**. It's:

1. **Contract enforcement**: `.proto` files are the single source of truth between services
2. **No API exposure**: The backend has zero publicly accessible HTTP endpoints for business logic
3. **Type safety**: Proto-generated types prevent silent contract drift
4. **Future readiness**: If the system grows to multiple microservices, gRPC scales naturally

---

## 4. What We Already Have Configured

### Transport Security: mTLS

- CA certificate validates both server and client
- Client (Next.js) presents certificate to backend
- Backend rejects connections without valid client cert
- Certificates generated via `./scripts/generate-dev-certs.sh`

### gRPC Services (operational)

| Service | Proto Package | Purpose |
|---------|---------------|---------|
| SessionContext | `openbook.session_context` | User session resolution |
| UserState | `openbook.user_state` | Preferences (theme, language, sidebar) |
| Condominiums | `openbook.condominiums` | Property management (user + admin) |
| CapabilityPresets | `openbook.capability_presets` | Resource configuration templates |

### Authentication Guards

- `GrpcJwtAuthGuard`: Extracts JWT from gRPC metadata, validates signature, checks user status
- `GrpcPermissionsGuard`: Role-based authorization per method
- Reuses the same `JwtStrategy` as HTTP endpoints — consistent validation

### Frontend Architecture

- `BaseGrpcService`: Abstract class with credential caching, auth metadata injection
- `getGrpcClient()`: Singleton with lazy-loaded services
- `handleGrpcError()`: Maps gRPC status codes to HTTP equivalents
- Graceful degradation: gRPC failures don't crash the dashboard layout

### Session Flow

```
Dashboard Layout (Server Component)
    │
    ├── gRPC: SessionContext.GetSessionContext()
    ├── gRPC: UserState.GetUserState()
    └── REST: GET /condominiums
            │
            ▼
    SessionContextProvider (React Context)
        → Client components receive resolved data, never tokens
```

---

## 5. Server Actions: Security Considerations

Server Actions in Next.js are **public POST endpoints**. Anyone can call them directly.

### Mitigations in place

- `httpOnly` + `sameSite: lax` cookies: Attacker cannot forge requests from another domain
- Middleware validates token on every request against backend
- gRPC calls inside Server Actions require valid JWT extracted from cookie

### Required discipline

Every Server Action must:

```typescript
"use server"

export async function someAction(rawData: unknown) {
  // 1. Validate input (Zod)
  const data = schema.parse(rawData);

  // 2. Auth is handled by cookie + middleware,
  //    but gRPC calls will fail without valid token anyway

  // 3. Business logic via gRPC
  const grpc = getGrpcClient();
  const result = await grpc.someService.someMethod(data);
}
```

The gRPC layer acts as a second gate: even if someone bypasses the Server Action validation, the backend rejects unauthenticated gRPC calls.

---

## 6. Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Session storage | Server-only (httpOnly cookies) | Zero client exposure |
| Browser → Backend | Never direct | Reduced attack surface |
| Next.js → Backend | gRPC with mTLS | Contracts, type safety, no public API |
| Performance strategy | Optimize DB queries + caching | Transport is not the bottleneck |
| Why gRPC | Contracts > Performance | Strict typing, not exposed, future-proof |
| Server Actions | Validated via cookie + gRPC auth | Double gate: Next.js + Backend |
