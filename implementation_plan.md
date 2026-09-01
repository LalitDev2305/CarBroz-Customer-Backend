# Splash Bootstrap Config API Implementation Plan

## Scope
Implement the production backend half of the Partner app Splash/bootstrap handshake on top of `architecture-v2` without changing the frozen architecture or SDUI hierarchy.

Canonical endpoint: `GET /api/v1/app`.

This phase is backend-only. It will not implement Login/OTP/Dashboard SDUI payloads or modify the frontend repository.

## Existing Owners Reused
- `ConfigProvider` + `IConfigProvider` for database-backed system configuration.
- `FeatureFlagProvider` + `IFeatureFlagProvider` for feature flags.
- `IUserRepository` / `IUserSessionRepository` for authenticated identity/session context.
- `IPartnerMemberRepository` / `IPartnerRepository` for Partner context.
- Existing Fastify JWT soft-decode hook for optional authentication.
- `ResponseHelper` for standard API response envelopes.
- Existing request correlation/trace context.

## Consolidation
The repository currently has two overlapping startup endpoints:
- `/v1/config/init`
- `/api/v1/app/init`

The production Splash contract will have one authoritative application bootstrap endpoint: `/api/v1/app`.

The old hard-coded `AppController` startup logic will be replaced by a typed bootstrap controller/use case under the existing application API ownership. The old `/v1/config/init` remains a legacy configuration endpoint for now and is not used by the Partner Splash path; no duplicate new Config repository/provider will be introduced.

## Response Contract
The API will preserve the repository API standard using `ResponseHelper.success`:

```json
{
  "success": true,
  "data": {
    "meta": {},
    "config": {},
    "updatePolicy": {},
    "maintenance": {},
    "session": {},
    "user": null,
    "partner": null,
    "sdui": {},
    "featureFlags": {},
    "capabilities": {},
    "serviceability": {},
    "realtime": {},
    "localization": {},
    "support": {},
    "runtimePolicy": {},
    "nextScreen": {}
  }
}
```

Only cacheable global configuration participates in version reuse. Session/user/Partner/policies/nextScreen are resolved fresh on every request.

## Client Capability Headers
Read and validate:
- `X-CarBroz-App-Version`
- `X-CarBroz-Build-Number`
- `X-CarBroz-Application-Id`
- `X-CarBroz-Bootstrap-Schema`
- `X-CarBroz-Sdui-Protocol`
- `X-CarBroz-Sdui-Schema`
- optional `X-CarBroz-Config-Version`

## Config Versioning
Build a deterministic canonical representation of the cacheable global config and derive a stable SHA-256 version string.

If the client version matches the current hash:
- return `config.changed = false`
- omit `config.data`

Otherwise:
- return `config.changed = true`
- return full `config.data`

No manual config-version database field or duplicate cache store will be added.

## Startup Policies
Use existing ConfigProvider keys with safe defaults for:
- minimum/latest build
- update mode/content/store URL
- maintenance policy
- SDUI protocol/schema versions
- localization
- support
- runtime policy
- capabilities/serviceability/realtime JSON blobs

Missing optional keys use safe defaults. Required protocol values are always returned.

## Session/User/Partner Resolution
If the soft JWT hook produced a user:
1. resolve current user by JWT user id;
2. validate session when a session id is present;
3. ensure session is not revoked/deleted;
4. return authenticated session/user snapshot;
5. resolve Partner memberships by user id;
6. use the first active membership deterministically and resolve Partner details;
7. return only fields supported by current domain models; unsupported fields remain null.

Invalid/missing optional auth produces an unauthenticated bootstrap response rather than failing the public startup endpoint.

## Next Screen
Return a generic `DynamicScreenInstruction`-compatible object. The backend may select the initial instruction from authenticated context, but the payload remains generic and the client contains no Login/Dashboard navigation mapping.

For this backend-only phase the endpoint values are configured through system-config keys with safe defaults; actual Login/OTP screen implementation is explicitly out of scope.

## API/Architecture Constraints
- No new HTTP stack.
- No new Config repository/provider.
- No direct Prisma access from controller/use case.
- No change to frozen SDUI hierarchy.
- No frontend-specific screen class logic.
- No unrelated refactor.
- No database migration required.

## Tests
Add API/use-case tests covering:
- anonymous bootstrap;
- authenticated session/user/Partner snapshot;
- config changed response;
- config unchanged response;
- maintenance policy;
- required update policy/minimum build;
- unsupported bootstrap/SDUI capabilities;
- malformed headers;
- stable deterministic config version;
- generic nextScreen structure;
- no stale user/session/Partner data in cached config.

## Risks
- Existing auth JWT/session model is inconsistent in some historical code paths. Bootstrap will use only existing authoritative repository methods and fail optional auth closed to anonymous state.
- Existing `/v1/config/init` is still used by historical tests; it will not be removed in this phase to avoid unrelated breakage.

## Rollback
Rollback consists only of reverting the files changed for the canonical `/api/v1/app` bootstrap endpoint and its tests. No schema/data migration is introduced.
