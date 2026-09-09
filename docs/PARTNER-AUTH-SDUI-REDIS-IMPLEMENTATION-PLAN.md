# Partner Authentication + SDUI + Redis Implementation Plan

> **Status:** APPROVED IMPLEMENTATION CONTRACT — Phases 0–5 complete and repository-verified; Phase 6 Send OTP canonical destination result is next. Phase 5 Partner Login request alignment is frozen on the existing generic request/reference architecture.
>
> **Branch:** `development`
>
> **Authority:** Subordinate to `MASTER-BACKEND-CONSTITUTION.md`, `PRODUCTION_FREEZE_CONSTITUTION.md`, `ENGINEERING-DOCUMENTATION-STANDARD.md`, and `FORENSIC-CHANGE-GATE.md`. If a conflict exists, the higher-authority document wins and implementation stops until the conflict is resolved.
>
> **Scope:** Partner Login → Send OTP → OTP Screen → Verify OTP → authenticated destination, including SDUI contracts, API response/error semantics, Redis-backed OTP challenge persistence, tests, documentation and final backend-to-frontend handoff. Frontend implementation remains out of scope until backend freeze.

---

## 1. Non-negotiable engineering rules

1. **Source first.** Inspect current `development` HEAD and canonical owners before every phase.
2. **Reuse before create.** Order of preference: KEEP → EXTEND → MODIFY → CREATE. CREATE is last.
3. **Single ownership.** Every responsibility has one canonical owner.
4. **Clean Architecture + DDD.** Domain/application code never depends on Fastify, Redis vendor APIs, Prisma clients, environment variables or transport DTOs.
5. **Dependency inversion.** Application/domain owns ports; infrastructure implements them.
6. **SRP.** Route = registration; controller = HTTP adaptation; DTO/schema = transport validation; use case = orchestration/business policy; repository port = persistence contract; infrastructure adapter = technology; `sdui/ui-sdk` = generic UI language.
7. **No duplicate frameworks.** No second SDUI engine, cache abstraction, Redis wrapper, response envelope, navigation contract, ActionEngine or authentication stack.
8. **One-way data flow.** HTTP input → validated transport input → application use case → ports → infrastructure → application result → HTTP envelope.
9. **Open/closed design.** Extend generic actions/references/cache contracts rather than introducing Login/OTP-specific framework types.
10. **MVI/UDF compatibility.** Backend outputs must be deterministic, immutable in semantics and reducer-friendly. MVI/UDF itself remains frontend architecture; backend must not introduce frontend reducers/stores.
11. **Documentation before implementation.** A code phase may start only after its contract/ownership is documented here or in the canonical owning README/contract document.
12. **Tests before promotion.** Focused tests + affected regression/build gates are required.
13. **No gate weakening.** A failing architecture/security/error gate is fixed at its canonical owner, never bypassed for convenience.
14. **Frontend untouched** until Phase 13 handoff and explicit frontend approval.

---

## 2. Canonical assets that must be reused

- `sdui/ui-sdk/src/contract/screen.schema.ts`
  - loaded Screen: `screenId`, `schemaVersion`, `targetApp`, `template`, optional `theme`, optional `metadata`;
  - no root `templateId/templateType`;
  - strict validation and structural ID uniqueness.
- `sdui/ui-sdk/src/contract/action.schema.ts`
  - generic actions: `request`, `navigate`, `present`, `dismiss`, `state`, `external_uri`, `sequence`;
  - generic references: `$binding`, `$literal`, `$response`, `$context`;
  - `responseMode: none | destination`;
  - canonical DynamicDestination.
- `apps/api/src/surfaces/partner/screens/partner-login.screen.ts`
  - `screenId = partner_login`;
  - template `tpl_7K2M9Q` / `stack_template`;
  - generic Continue request action.
- `domains/configuration` Partner Bootstrap
  - guest destination already points to current Partner Login.
- shared Identity auth transport
  - `POST /api/v1/partner/auth/send_otp`;
  - `POST /api/v1/partner/auth/verify_otp`.
- `domains/identity/application/AuthUseCases.ts`
  - existing OTP generation/hash/cooldown/rate-limit/attempt/expiry/invalidation/provider/session/token behavior must be preserved.
- `domains/identity/domain/repositories/IOtpChallengeRepository.ts`
  - canonical OTP persistence port.
- `platform/cache/src/ports/ICacheProvider.ts`
  - canonical generic cache abstraction.
- `apps/api/src/transport/response/ResponseHelper.ts` + global error handling
  - canonical API envelope owner.

Nothing above may be replaced without an explicit architecture amendment.

---

## 3. Frozen ownership matrix

| Concern | Owner | Rule |
| --- | --- | --- |
| Loaded Screen contract | `sdui/ui-sdk` | No root template identity duplication |
| Destination contract | `sdui/ui-sdk` | Generic pre-fetch navigation metadata |
| Partner Login/OTP screen composition | Partner API surface | Product composition only; generic SDUI primitives |
| Auth business/security rules | `domains/identity` | No Fastify/Redis/Prisma vendor dependency |
| OTP persistence port | `domains/identity` | Keep `IOtpChallengeRepository` |
| Generic cache behavior | `platform/cache` | Domain-neutral only |
| Concrete Redis client creation/options | `apps/api` composition root | Existing `ioredis`; runtime config only |
| Redis OTP adapter | `platform/integrations` | Technical adapter implementing the Identity-owned port; owns Redis key/serialization/atomic persistence mechanics |
| HTTP auth validation | `apps/api/src/transport/auth/dto` | Transport boundary only |
| HTTP auth controller | shared auth transport | Adapter only |
| API response/error envelope | `ResponseHelper` + global handler | One response contract |
| Partner startup destination | `domains/configuration` | Startup routing only |
| Frontend state/navigation execution | frontend MVI/UDF + existing ActionEngine | Never reimplemented in backend |

---

## 4. Loaded Screen vs Destination

### Loaded Screen

```json
{
  "screenId": "partner_login",
  "schemaVersion": "3.0.0",
  "targetApp": "PARTNER",
  "template": {
    "id": "tpl_7K2M9Q",
    "type": "stack_template",
    "components": []
  }
}
```

Loaded Screen MUST NOT contain root `templateId` or `templateType`.

### Destination

```json
{
  "screenId": "partner_otp",
  "templateId": "<published-template-id>",
  "templateType": "<published-template-type>",
  "endpoint": "/api/v1/partner/screen/<route>",
  "method": "GET",
  "authentication": "NONE"
}
```

On fetch, runtime must be able to verify:

```text
destination.screenId     == screen.screenId
destination.templateId   == screen.template.id
destination.templateType == screen.template.type
```

Authentication requirement must be enforced before/following fetch as defined by the runtime contract.

---

## 5. Generic request action

The existing generic `request` action remains the only request mechanism.

For `responseMode: destination`:

1. validate bound form state when requested;
2. resolve `$binding/$context/$literal/$response` references;
3. send HTTP request;
4. on failure, expose error state and do not navigate;
5. on success, read the canonical destination from result payload;
6. validate destination then fetch/navigate.

No `LoginContinueAction`, `OtpVerifyAction`, screen-specific `onSuccess`, second ActionEngine or backend navigation framework may be created.

---

## 6. Login → Send OTP input contract

Phase 5 frozen request payload:

```json
{
  "phoneNumber": { "$binding": "mobileNumber" },
  "deviceId": { "$context": "deviceId" }
}
```

Ownership:

```text
phoneNumber ← visible Login binding `mobileNumber`
deviceId    ← runtime/application context `deviceId`
```

No fake Device ID input Element or Login-specific request mapper is allowed. The existing shared `SendOtpSchema` remains the transport owner for resolved `{ phoneNumber, deviceId }` input.

The detailed frozen Phase 5 contract is `sdui/PHASE-5-PARTNER-LOGIN-REQUEST-CONTRACT.md`.

---

## 7. Send OTP success contract

Legacy `{ template, api }` navigation metadata is not canonical.

Target result semantics:

```json
{
  "message": "OTP sent successfully",
  "challengeId": "...",
  "expiresInSeconds": 300,
  "isNewUser": true,
  "nextScreen": {
    "screenId": "partner_otp",
    "templateId": "<otp-template-id>",
    "templateType": "<otp-template-type>",
    "endpoint": "/api/v1/partner/screen/<otp-route>",
    "method": "GET",
    "authentication": "NONE"
  }
}
```

`nextScreen` must use the same semantic Destination contract as bootstrap/navigation. Identity must not depend on `sdui/ui-sdk` merely to reuse a Zod schema; reuse a neutral lower-level contract if one exists, otherwise keep the smallest application value contract and validate/map at boundaries.

Concrete OTP destination identity is frozen only when the OTP screen exists.

---

## 8. Redis architecture — APPROVED

Redis is approved for OTP challenge runtime state.

### Dependency direction

```text
SendOtpUseCase / VerifyOtpUseCase
             ↓
IOtpChallengeRepository              # Identity-owned port
             ↓
RedisOtpChallengeRepository          # platform/integrations technical adapter
             ↓
IRedisClient                          # platform/cache technical Redis port
             ↓
concrete ioredis client from apps/api
```

Identity application/domain must never import Redis vendor APIs, Fastify, platform implementation packages or environment configuration. The Redis OTP adapter lives in `platform/integrations` because the Constitution forbids `domains/*` from importing platform packages; the adapter depends inward on the Identity public port.

### Phase 3 generic infrastructure boundary

Current implemented generic infrastructure is:

```text
apps/api/src/bootstrap/plugins/redis-cache.plugin.ts
      ├── idempotent singleton registration in canonical Awilix root
      ├── initialize at startup
      └── shutdown through Fastify onClose
             ↓
apps/api/src/bootstrap/cache/create-cache-provider.ts
             ↓
RedisCacheProvider / InMemoryCacheProvider
             ↓
ICacheProvider + IRedisClient
```

Rules:

- `ICacheProvider` is the only generic cache contract.
- Redis is used in development/production.
- In-memory provider is selected only for `NODE_ENV=test`; no runtime fallback.
- `RedisCacheConfig` contains only provider-owned behavior: `keyPrefix`, `defaultTtlSeconds`.
- `REDIS_URL`, vendor timeout/retry options and concrete `ioredis` creation remain in `apps/api`.
- current generic prefix: `carbroz:cache:`.
- generic values use JSON serialization.
- TTL is a positive integer when supplied.
- `clear()` uses namespaced `SCAN` + `DEL`; `FLUSHDB/FLUSHALL` are forbidden.
- readiness checks the same cache singleton with a 3-second timeout.
- startup fails closed if Redis cannot pass initialization health verification.
- shutdown uses `QUIT` with forced disconnect fallback.

BullMQ/messaging is a separate platform capability. Phase 3 found no competing custom Redis cache provider there; if BullMQ later uses Redis-managed queue connections, those are queue-technology connections and must not be confused with or exposed as a second generic cache abstraction.

### OTP Redis state requirements for Phase 4

The Identity adapter must preserve:

- opaque challenge ID;
- normalized phone;
- device binding;
- OTP hash only;
- creation/expiry timestamps;
- attempt/max-attempt state;
- consumed/invalidated terminal state;
- latest challenge lookup;
- cooldown/rate window behavior;
- explicit TTL cleanup;
- one-time consume;
- no OTP leakage.

Frozen Identity OTP Redis namespace/key design:

```text
carbroz:identity:otp:v1:seq
carbroz:identity:otp:v1:challenge:<internalId>
carbroz:identity:otp:v1:public:<publicId>
carbroz:identity:otp:v1:phone:<encodedPhone>:latest
carbroz:identity:otp:v1:rate:<encodedPhone>
```

The namespace is semantically Identity-owned; technical key construction, serialization and atomic scripts are implemented only by `platform/integrations/RedisOtpChallengeRepository`.

### Atomicity requirements

Race-safe operations include:

- challenge creation under concurrent send/rate-limit conditions;
- failed-attempt increments;
- invalidation at max attempts;
- exactly-once consume;
- concurrent verify requests;
- resend/cooldown decisions where persistence semantics participate.

Prefer Redis-native atomic commands/transactions. Use a small Lua script only when a multi-step/multi-key invariant requires it. Do not add distributed locking unless simpler atomic primitives cannot protect the invariant.

### Failure policy

- Redis dependency failure fails OTP auth closed.
- No silent fallback to process memory or Prisma.
- No Prisma+Redis dual write unless separately documented/approved.
- Existing Prisma adapter remains until Redis parity and DI migration are proven.
- Database table/schema removal is a separate explicit later migration.

---

## 9. API envelope/error gate — PHASE 2 FROZEN

The repository-wide response/error contract has one canonical envelope owner: `apps/api/src/transport/response/ResponseHelper.ts` plus the single global Fastify error handler.

Canonical JSON envelope:

```text
{
  status,
  code,
  message,
  data,
  traceId
}
```

Frozen rules:

- actual HTTP status equals body `status` for JSON envelopes;
- `code` is stable and machine-readable;
- mapped failures use `data: null`;
- `traceId` is propagated when request context provides it;
- successful creation remains HTTP 200 under the current API contract;
- HTTP 204 carries no response body;
- transport validation maps to 400 + `VALIDATION_ERROR` without reflecting raw schema details;
- typed `ApplicationError`/`DomainError` codes are preserved when available;
- domain validation defaults to 422 unless a stronger status mapping applies;
- unknown/unhandled failures map to 500 with a generic safe message;
- required provider/infrastructure failures may map to 503;
- unknown routes use the same non-reflective envelope;
- no product/controller may define a competing response helper, envelope or status map.

Security containment is permanent and environment-independent: raw validation details, stack traces, provider internals, SQL errors, request secrets, tokens, OTP values and unnecessary PII must not be reflected to clients.

The owner-local normative details are documented in `apps/api/src/transport/response/README.md`.

---

## 10. OTP screen gate

OTP SDUI may be created only after the required backend contracts are ready:

1. generic destination semantics frozen;
2. Login input aligned;
3. Send OTP result aligned;
4. Redis OTP adapter green;
5. API envelope/error behavior green.

Use only generic Template/Component/Section/Group/Element vocabulary and existing generic actions/references unless a real generic capability gap is proven.

---

## 11. Verify OTP contract

Keep current Identity security/session/token logic.

Input ownership:

```text
challengeId ← prior Send OTP result/flow state
phoneNumber ← flow state/binding/context
otp         ← OTP input binding
deviceId    ← runtime context
device meta ← runtime context when supported
```

Replace legacy navigation metadata with canonical Destination semantics only when the real authenticated destination exists. Do not fabricate Dashboard identifiers.

---

## 12. Security invariants

Preserve or improve:

- cryptographically secure OTP generation;
- one-way OTP hashing;
- no plaintext OTP persistence;
- provider abstraction;
- cooldown/rate limiting;
- bounded failed attempts;
- expiry;
- device binding;
- atomic one-time consumption;
- replay rejection;
- refresh-token hashing/rotation;
- PII/log redaction;
- no secrets in SDUI;
- no Redis credentials in domain/application code;
- production-safe errors.

Concurrency/replay tests are mandatory for OTP persistence/verification phases.

---

# 13. Implementation phases and current status

## Phase 0 — Repository-wide audit — COMPLETE

Read-only source-first audit; classified KEEP/MODIFY/CREATE/DEFER and found the Login payload mismatch, legacy navigation results, missing OTP/Dashboard screens, Prisma OTP persistence and response/error contract gap.

## Phase 1 — Documentation and contract freeze — COMPLETE

Completed:

- this canonical cross-phase plan;
- Identity ownership documentation;
- Cache/Redis ownership documentation;
- SDUI Partner-auth contract;
- Partner Bootstrap contract;
- Redis approval/ownership/failure/atomicity strategy;
- no production code changes in the phase.

## Phase 2 — Repository-wide response/error reconciliation — COMPLETE

Completed at the canonical owners:

- reconciled `ResponseHelper` around one `{status, code, message, data, traceId}` contract;
- added first-class 503 support for required dependency/provider failures;
- froze creation semantics at HTTP 200;
- froze HTTP 204 as no-body;
- aligned global Fastify error handling for application, domain, validation, not-found and unknown failures;
- preserved stable application/domain codes instead of replacing them with message text;
- mapped domain/business validation to 422 when no stronger status applies;
- made validation/internal client messages non-reflective and production-safe;
- guaranteed HTTP/body status equality through executable tests/gates;
- aligned route-not-found behavior to the common envelope;
- reconciled observability/PII policy so request diagnostics remain metadata-only and logging contracts do not accept request body/header payloads;
- updated the CW5 executable error/PII gates to validate the current canonical contract rather than the removed legacy `{success:false}` contract;
- aligned stale SDUI/cache/registry test fixtures with already-frozen contracts instead of weakening strict schemas or provider validation.

Closeout rule: Phase 2 is accepted only when the canonical `CarBroz Backend CI` run on the documentation-complete HEAD passes architecture/security gates, Prisma validation/migrations/drift, monorepo build, ESLint, full Vitest, repeated post-test gates and the non-mutating validation proof.

## Phase 3 — Redis platform infrastructure — IMPLEMENTED; PARITY-REVIEWED

Implemented/reused:

- existing `ICacheProvider`, consolidated as the single cache abstraction;
- existing `InMemoryCacheProvider` retained for deterministic `NODE_ENV=test` only;
- new domain-neutral `IRedisClient` minimal technical surface;
- new `RedisCacheProvider`;
- existing `ioredis ^5.11.1` reused from API dependencies;
- existing `REDIS_URL` runtime configuration reused;
- `createCacheProvider()` at executable composition boundary;
- `redis-cache.plugin.ts` for idempotent singleton Awilix registration + startup/shutdown lifecycle;
- Redis readiness integration;
- namespace-safe `SCAN` + `DEL` clear;
- JSON serialization and TTL validation;
- startup fail-closed and graceful/forced shutdown tests;
- DI regression test proving root/request scopes share the same cache singleton;
- exact owner documentation in `platform/cache/README.md`.

Validation defects found and fixed during parity/closeout:

1. lifecycle plugin originally resolved `cacheProvider` without registering it; fixed by idempotent singleton registration and regression test;
2. `RedisCacheConfig` exposed unused connection/vendor fields even though executable composition owns them; reduced to provider-owned settings only;
3. `defaultTtlSeconds` typing was aligned with `exactOptionalPropertyTypes` without changing runtime behavior;
4. the in-memory TTL test now proves expiry with a valid positive TTL and controlled time instead of violating the provider's positive-TTL contract.

Phase 3 remains infrastructure-only; OTP business persistence begins in Phase 4.

## Phase 4 — Redis OTP repository adapter — COMPLETE

Completed and repository-verified:

- kept `IOtpChallengeRepository` as the single Identity-owned persistence port;
- placed `RedisOtpChallengeRepository` under `platform/integrations`, not `domains/*`, to preserve the Constitution dependency boundary;
- extended only the generic `IRedisClient` technical surface required by the adapter;
- implemented versioned `carbroz:identity:otp:v1:` keys, opaque public IDs, numeric internal IDs and bounded TTLs;
- implemented atomic create/rate-limit, failed-attempt, exactly-once consume and idempotent invalidation semantics;
- preserved phone/device binding and OTP-hash-only persistence;
- switched development/production DI to Redis while retaining Prisma only for deterministic test/legacy compatibility;
- shared the same root `redisClient` singleton between `RedisCacheProvider` and OTP persistence;
- prohibited dual write and Redis → Prisma/memory fallback;
- added focused concurrency/corruption/failure/DI tests;
- corrected the initial illegal domain→platform adapter placement instead of weakening CW gates;
- passed canonical CI and the independent architecture closeout verifier on the same documentation-complete Phase 4 baseline before Phase 5.

## Phase 5 — Login request alignment — COMPLETE

Completed and repository-verified on the existing Partner Login generic request action:

```text
phoneNumber ← $binding(mobileNumber)
deviceId    ← $context(deviceId)
```

Preserved unchanged:

```text
POST /api/v1/partner/auth/send_otp
authentication = NONE
validate = true
responseMode = destination
```

No duplicate DTO, controller, use case, request mapper, action type, device field or navigation framework was introduced. `SendOtpSchema` remains the shared transport owner for `{ phoneNumber, deviceId }`. Focused verification is in `apps/api/src/surfaces/partner/screens/partner-login.screen.spec.ts`; the detailed frozen Phase 5 contract is `sdui/PHASE-5-PARTNER-LOGIN-REQUEST-CONTRACT.md`.

Phase 5 passed the canonical repository verification requirements without changing Phase 6 navigation/result behavior.

## Phase 6 — Send OTP canonical destination result — NOT STARTED

Replace legacy `{template, api}` result with canonical Destination semantics while preserving all security/business rules. Concrete OTP destination is finalized with the actual OTP screen.

## Phase 7 — Send OTP error/security regression — NOT STARTED

Cover cooldown, rate limit, provider failure, Redis failure, expiry, no leakage, trace/envelope consistency and concurrency.

## Phase 8 — Partner OTP SDUI screen + route — NOT STARTED

Create missing Partner OTP composition only after gates. Reuse generic SDUI vocabulary/action/references. Add destination ↔ fetched-screen identity tests.

## Phase 9 — Verify OTP request/result alignment — NOT STARTED

Wire generic OTP request references to existing `/verify_otp`; preserve Identity session/token logic; migrate navigation semantics only to a real destination.

## Phase 10 — Authenticated Partner destination migration — DEFERRED

Only after a real published Partner Dashboard/other authenticated screen exists:

- publish Screen;
- align Verify OTP destination;
- align authenticated Bootstrap;
- add identity consistency tests;
- remove obsolete registry references after usage audit.

## Phase 11 — Prisma OTP persistence retirement — DEFERRED

After Redis production parity:

- prove no runtime Prisma OTP usage;
- remove/deprecate adapter as explicitly decided;
- separately approve/drop unused database structures;
- update docs;
- no silent dual persistence.

## Phase 12 — Full backend regression and freeze — NOT STARTED

Run:

- UI SDK contract tests;
- Identity tests;
- cache/Redis + OTP adapter tests;
- Configuration/Bootstrap tests;
- API/DI/container tests;
- Prisma validation/migrations/drift checks;
- monorepo build;
- lint;
- Vitest;
- architecture/dependency/security/config/PII gates;
- re-verification proving validation is non-mutating.

Unrelated pre-existing failures are documented and fixed in their own phase; gates are never weakened.

## Phase 13 — Backend contract handoff to frontend MVI/UDF — DEFERRED

After backend freeze publish:

- request/response examples;
- Destination rules;
- `$binding/$context/$response` keys;
- error/retry semantics;
- auth/session storage requirements.

Frontend then extends its existing MVI/UDF + ActionEngine architecture.

---

## 14. Expected file change map

Existing files/packages are inspected/reused first:

```text
sdui/ui-sdk/src/contract/action.schema.ts
sdui/ui-sdk/src/contract/screen.schema.ts
apps/api/src/surfaces/partner/screens/partner-login.screen.ts
domains/identity/application/AuthUseCases.ts
apps/api/src/transport/auth/dto/auth.dto.ts
apps/api/src/transport/auth/*
domains/identity/identity.module.ts
platform/cache/*
apps/api/src/bootstrap/cache/*
apps/api/src/bootstrap/plugins/redis-cache.plugin.ts
apps/api/src/system/health/health.controller.ts
apps/api/src/transport/response/ResponseHelper.ts
domains/configuration/application/*
```

New files are allowed only when discovery proves absence of a canonical equivalent, including:

```text
platform/integrations/src/identity/RedisOtpChallengeRepository.ts
platform/integrations/src/identity/RedisOtpChallengeRepository.spec.ts
apps/api/src/surfaces/partner/screens/partner-otp.screen.ts
```

Exact names/locations follow existing package conventions discovered at the relevant phase.

---

## 15. Test strategy

### SDUI/contract

- loaded Screen rejects root duplicate template identity;
- Destination schema strictness;
- request references/response mode;
- Partner Login request mapping resolves `phoneNumber` from `$binding(mobileNumber)` and `deviceId` from `$context(deviceId)`;
- Partner Login HTTP body does not expose stale `mobileNumber` field or add a device input element;
- destination/fetched-screen identity.

### Generic Redis/cache

- JSON serialize/deserialize;
- explicit/default TTL;
- invalid TTL/key rejection;
- namespace-safe clear preserving non-cache keys;
- lazy connect;
- startup health fail-closed;
- health failure;
- graceful shutdown + forced disconnect fallback;
- singleton root/request DI identity;
- readiness failure.

### Identity/OTP

- new/existing user send;
- cooldown/rate limit;
- provider/Redis failure;
- invalid/expired OTP;
- failed/max attempts;
- valid verify;
- replay rejection;
- concurrent consume;
- session/refresh-token behavior;
- canonical destinations;
- no OTP leakage.

### Transport/envelope

- validation errors;
- auth 401/429/required 5xx;
- trace ID;
- HTTP/body status equality;
- success envelope;
- no controller-specific envelope.

### Configuration

- guest Bootstrap remains canonical Login destination;
- authenticated Bootstrap remains deferred until real screen exists.

---

## 16. Definition of done

A phase is complete only when:

1. current repository state has been inspected;
2. reuse/extension decisions are proven;
3. responsibility has one owner;
4. dependency direction is correct;
5. focused tests are green or, when blocked by an earlier mandatory global gate, the blocker is explicitly documented and the phase is not falsely called repository-green;
6. affected builds/gates run when prerequisite gates allow them;
7. canonical owning documentation matches implementation exactly;
8. no duplicate abstraction exists;
9. no unrelated cleanup is mixed in;
10. frontend remains untouched until approved handoff.

---

## 17. Explicit anti-patterns

Do not implement:

- second SDUI engine/ActionEngine/navigation framework;
- semantic Login/OTP action classes in generic SDK;
- direct Redis calls from Identity use cases;
- direct Prisma calls from use cases;
- per-request Redis client creation;
- plaintext OTP persistence/logging/API leakage;
- runtime Redis → memory fallback;
- Prisma+Redis dual writes without explicit migration approval;
- second response helper/envelope;
- root loaded-Screen template identity duplication;
- guessed Dashboard destination;
- backend MVI reducer/store classes;
- new abstraction created only to rename an existing one;
- `FLUSHDB`/`FLUSHALL` from generic cache;
- weakening CI/architecture/security gates to obtain green.
