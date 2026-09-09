# Partner Authentication + SDUI + Redis Implementation Plan

> **Status:** APPROVED IMPLEMENTATION CONTRACT — documentation-first gate.
>
> **Branch baseline:** `development`.
>
> **Authority:** This plan is subordinate to `MASTER-BACKEND-CONSTITUTION.md`, `PRODUCTION_FREEZE_CONSTITUTION.md`, `ENGINEERING-DOCUMENTATION-STANDARD.md`, and `FORENSIC-CHANGE-GATE.md`. If a conflict is found, implementation stops and the higher-authority document wins.
>
> **Scope:** Partner Login → Send OTP → OTP Screen → Verify OTP → authenticated destination, including SDUI request/destination contracts, API envelope/error handling, Redis-backed OTP challenge persistence, tests, documentation and verification. Frontend implementation is explicitly out of scope until the backend contract is frozen and green.

---

## 1. Non-negotiable engineering rules

Every implementation phase MUST follow these rules.

1. **Reuse before create.** Search the repository and extend the canonical owner before introducing a file, abstraction, schema, provider, DTO, route, action or utility.
2. **Single ownership.** Every responsibility has exactly one canonical owner. Compatibility re-exports are allowed only when intentionally temporary and documented.
3. **Clean Architecture + DDD.** Domain/application code depends on ports/contracts, never Fastify, Redis clients, Prisma clients, environment variables or transport DTOs.
4. **Dependency inversion.** Infrastructure implements domain/application-owned ports. Use cases do not know which persistence technology is behind a port.
5. **Single responsibility.** Route = registration; controller = HTTP adaptation; schema/DTO = transport validation; use case = application orchestration/business rules; repository port = persistence contract; infrastructure adapter = technology-specific persistence; SDUI SDK = generic UI language.
6. **Open/closed design.** Extend existing generic SDUI actions, references, destinations and cache abstractions. Do not create Login-specific or OTP-specific action engines.
7. **No duplicate frameworks.** No second SDUI engine, response envelope, cache abstraction, Redis wrapper, authentication stack, navigation contract or validation system.
8. **One-way data flow.** Backend request handling follows `HTTP input → validated transport input → application use case → ports → infrastructure → application result → HTTP envelope`. No transport/domain feedback loops.
9. **MVI/UDF compatibility.** Backend contracts MUST be deterministic and reducer-friendly for the frontend MVI/UDF runtime: immutable response semantics, explicit destinations, explicit state/action results, no hidden screen-specific behavior. MVI/UDF itself remains frontend architecture and MUST NOT be incorrectly implemented as backend domain classes.
10. **Documentation before implementation.** A phase may modify code only after its target contract and ownership are documented here or in its canonical owning document.
11. **Tests before promotion.** New/changed contracts require focused tests and regression tests before the phase is considered complete.
12. **Frontend untouched.** No frontend repository/code changes are part of this backend execution plan.

---

## 2. Current canonical state that must be reused

The following already exists on `development` and MUST be extended rather than reimplemented:

- `sdui/ui-sdk/src/contract/screen.schema.ts`
  - loaded Screen has `screenId`, `schemaVersion`, `targetApp`, `template`, optional `theme`, optional `metadata`;
  - root `templateId/templateType` are already removed;
  - strict validation rejects duplicate root fields;
  - structural IDs are unique within a screen.
- `sdui/ui-sdk/src/contract/action.schema.ts`
  - generic actions: `request`, `navigate`, `present`, `dismiss`, `state`, `external_uri`, `sequence`;
  - references: `$binding`, `$literal`, `$response`, `$context`;
  - `responseMode: none | destination`;
  - canonical dynamic destination with `screenId`, `templateId`, `templateType`, `endpoint`, `method`, `authentication`.
- `apps/api/src/surfaces/partner/screens/partner-login.screen.ts`
  - canonical Partner Login SDUI screen;
  - template `tpl_7K2M9Q` / `stack_template`;
  - generic Continue `request` action already exists.
- `domains/configuration/.../partner-bootstrap.ts` and `GetPartnerBootstrapUseCase.ts`
  - guest bootstrap already points to the current Partner Login destination.
- `apps/api/src/transport/auth/*`
  - shared Identity auth routes are reused by Partner surface;
  - canonical routes remain `POST /send_otp` and `POST /verify_otp`.
- `domains/identity/application/AuthUseCases.ts`
  - OTP generation, hashing, cooldown, rate-limit policy, attempts, expiry, invalidation, one-time consumption, session creation, refresh-token family and provider abstraction already exist.
- `domains/identity/domain/repositories/IOtpChallengeRepository.ts`
  - canonical OTP challenge persistence port.
- `platform/cache/src/ports/ICacheProvider.ts`
  - canonical generic cache abstraction.
- `apps/api/src/transport/response/ResponseHelper.ts`
  - canonical common API envelope owner.

No phase may replace the above without an explicit architecture amendment.

---

## 3. Frozen ownership matrix

| Concern | Canonical owner | Rule |
| --- | --- | --- |
| Loaded SDUI Screen contract | `sdui/ui-sdk` | No root `templateId/templateType` |
| Destination metadata | `sdui/ui-sdk` | Generic navigation/request result contract |
| Partner Login screen JSON | Partner API surface | Product-specific composition only |
| OTP screen JSON | Partner API surface | Created only after backend result contract is frozen |
| Auth business rules | `domains/identity` | No Fastify/Redis/Prisma dependencies |
| OTP persistence port | `domains/identity` | Existing `IOtpChallengeRepository` remains canonical |
| Redis connection/provider mechanics | `platform/cache` | Technical infrastructure only |
| Redis OTP repository adapter | Identity infrastructure | Implements Identity port using canonical cache/Redis infrastructure |
| HTTP validation | `apps/api/src/transport/auth/dto` | Maps transport shape to application input |
| HTTP auth controller | `apps/api/src/transport/auth` | Adapter only |
| API response envelope | `ResponseHelper` + global error handling | One envelope everywhere |
| Partner startup routing | `domains/configuration` | Does not own SDUI structure/auth business state |
| Frontend navigation state | frontend MVI/UDF | Not implemented in backend |

---

## 4. Frozen loaded Screen vs Destination contract

### 4.1 Loaded Screen

A fetched/renderable SDUI document has one canonical template identity location:

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

The loaded Screen MUST NOT duplicate `templateId` or `templateType` at root.

### 4.2 Destination

A destination is metadata used before a screen is fetched:

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

Destination metadata is intentionally different from a loaded Screen.

### 4.3 Destination verification

When a destination is followed and its Screen is fetched, the consuming runtime MUST be able to verify:

- destination `screenId` equals fetched `screen.screenId`;
- destination `templateId` equals fetched `screen.template.id`;
- destination `templateType` equals fetched `screen.template.type`;
- authentication requirement is respected before the fetch.

The backend MUST return internally consistent destination metadata. Tests will protect this invariant.

---

## 5. Frozen generic request-action semantics

The existing generic `request` action remains the only request mechanism for this flow.

For `responseMode: "destination"`:

1. validate bound form state when `validate: true`;
2. resolve request values from generic references (`$binding`, `$context`, `$literal`, `$response`);
3. issue the HTTP request;
4. on non-success, expose the error state and **do not navigate**;
5. on success, read one canonical destination from the response payload;
6. navigate/fetch only after destination validation succeeds.

No Login-specific `onSuccess`, OTP-specific navigation command, or second action engine will be added.

---

## 6. Frozen Login → Send OTP request mapping

Current mismatch must be corrected using existing reference mechanisms.

Application/transport input remains conceptually:

```json
{
  "phoneNumber": "9876543210",
  "deviceId": "runtime-device-id"
}
```

Ownership:

- `phoneNumber` comes from the Login form binding;
- `deviceId` comes from runtime/application context, not from a visible form field.

Target generic SDUI request body:

```json
{
  "phoneNumber": { "$binding": "mobileNumber" },
  "deviceId": { "$context": "deviceId" }
}
```

The exact context-key registry is owned by the frontend/runtime contract; the backend SDUI schema only validates the generic `$context` reference. Backend code MUST NOT create a `DeviceIdElement` or Login-specific request mapper.

---

## 7. Frozen Send OTP success contract

`SendOtpUseCase` currently returns legacy navigation metadata `{ template, api }`. That legacy shape will be removed from the Partner Login flow.

The successful application result will expose OTP challenge data plus a canonical destination. Transport may envelope it, but must not reinterpret business rules.

Conceptual result:

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

`nextScreen` MUST use the same semantic destination contract as SDUI navigation/bootstrap destinations. Reuse will be preferred through a shared transport-neutral contract where dependency direction allows it; Identity MUST NOT depend on `sdui/ui-sdk` merely to reuse a Zod schema. If a neutral destination contract already exists in a lower/common owner, reuse it. Otherwise create the smallest application-level value contract in the correct owner and map/validate at boundaries.

The OTP destination identifiers/route MUST NOT be invented until the OTP screen definition is created in its later phase. Until then, implementation phases that require concrete values remain gated.

---

## 8. Redis approval and architecture

Redis is **approved** for OTP challenge state.

This is an infrastructure migration, not a rewrite of Identity business rules.

### 8.1 Dependency direction

```text
SendOtpUseCase / VerifyOtpUseCase
             ↓
IOtpChallengeRepository       (Identity-owned port)
             ↓
RedisOtpChallengeRepository   (Identity infrastructure adapter)
             ↓
canonical Redis/cache provider (platform/cache)
             ↓
Redis client/connection
```

Identity application/domain code MUST NOT import a Redis client, Redis command API, Fastify, or environment configuration.

### 8.2 Reuse rule

Before creating Redis infrastructure:

1. inspect `platform/cache` and all platform/integration packages for an existing Redis client/provider/connection manager;
2. inspect workspace dependencies for an already-approved Redis library;
3. extend the canonical provider and configuration path;
4. create a new Redis provider only if no canonical implementation exists.

There will be **one Redis connection/provider mechanism** for the backend.

### 8.3 OTP Redis state requirements

The Redis-backed adapter must preserve current `IOtpChallengeRepository` semantics and support:

- opaque/public challenge ID;
- normalized phone number;
- device binding;
- OTP hash only (never plaintext OTP after provider dispatch);
- created/expiry timestamps;
- attempt count + maximum attempts;
- consumed/invalidated state or an equivalent atomic terminal-state representation;
- resend cooldown lookup;
- rate-limit counting/window;
- one-time verification/consumption;
- explicit TTL cleanup;
- no OTP leakage in logs/errors/API results.

### 8.4 Key design

Keys MUST be versioned/namespaced and centralized in the Redis OTP adapter, not scattered through use cases. Conceptual namespaces:

```text
carbroz:identity:otp:v1:challenge:<challengeId>
carbroz:identity:otp:v1:phone:<normalizedPhone>:latest
carbroz:identity:otp:v1:rate:<normalizedPhone>:<window>
```

Exact key format may change during implementation after validating Redis capabilities, but one helper/owner must generate keys.

### 8.5 Atomicity requirements

The following must be race-safe:

- creating challenges under rate-limit rules;
- incrementing failed attempts;
- invalidating at max attempts;
- consuming a valid challenge exactly once;
- concurrent verify requests;
- resend cooldown checks where concurrent send requests occur.

Prefer Redis-native atomic commands, transactions, or a small Lua script only where multi-key/multi-step atomicity truly requires it. Do not introduce distributed locking unless simpler Redis atomic primitives cannot satisfy the invariant.

### 8.6 Failure policy

Redis failure is an authentication dependency failure. The API must fail closed for OTP send/verify rather than silently falling back to process memory or stale database state.

No dual-write Prisma+Redis path will be introduced unless a separately documented migration requirement proves it necessary.

### 8.7 Prisma OTP migration

The current `PrismaOtpChallengeRepository` remains useful as the pre-migration implementation and test reference until Redis parity is proven.

After Redis is green and DI is switched:

- remove or deprecate the Prisma OTP adapter only after repository-wide usage verification;
- database schema/table cleanup is a separate explicit migration step;
- do not delete database structures merely because runtime DI changes.

---

## 9. API envelope and error contract gate

Before changing OTP transport behavior, repository-wide API response/error handling must be reconciled.

Canonical success/error body owner remains `ResponseHelper` and the global Fastify error path.

Required invariants:

- body `status` equals HTTP status;
- `code` is stable and machine-readable;
- `message` is safe for clients;
- `data` contains result or `null` according to the frozen envelope;
- `traceId` is propagated consistently;
- validation errors use the same global envelope;
- `ApplicationError` status/code are mapped consistently;
- OTP provider/Redis dependency failures have an explicitly supported 5xx status;
- success status policy (200 vs 201) is uniform and documented before changing `created()`;
- 204 responses must not accidentally carry an envelope body.

A phase must not patch only OTP controller responses while leaving the global mapper inconsistent.

---

## 10. OTP screen contract gate

The OTP SDUI screen is intentionally **not** created during documentation Phase 1.

It may be implemented only after:

1. generic `responseMode: destination` response semantics are frozen;
2. Login request input is aligned;
3. Send OTP success destination contract is aligned;
4. Redis OTP adapter behavior is green;
5. API envelope/error behavior is green.

The screen MUST reuse the existing generic hierarchy and elements. No `OtpComponent`, `OtpTemplate`, `OtpActionEngine`, `LoginOtpFlow`, or other semantic SDK type may be introduced unless generic primitives objectively cannot express the UI.

OTP screen runtime data must receive what it needs through generic navigation/context/result state, not hidden server assumptions.

---

## 11. Verify OTP contract

Verify OTP keeps the existing Identity security/session logic and moves only stale navigation metadata to the canonical destination model.

Input ownership remains:

- `challengeId`: prior Send OTP result/navigation state;
- `phoneNumber`: flow state/binding/context;
- `otp`: OTP input binding;
- `deviceId`: runtime context;
- optional device metadata: runtime context where supported.

Successful verification continues to return authenticated user/session/token material through the current transport boundary, plus a canonical next destination.

The authenticated destination MUST NOT be fabricated. Partner Dashboard destination migration is gated until a real published Partner Dashboard SDUI screen exists.

---

## 12. Security requirements

All phases touching authentication must preserve or improve:

- cryptographically secure OTP generation;
- one-way OTP hashing;
- no plaintext OTP persistence;
- provider abstraction;
- resend cooldown;
- per-phone rate limiting;
- bounded failed attempts;
- challenge expiration;
- device binding;
- one-time atomic consumption;
- replay rejection;
- refresh-token hashing and rotation;
- log redaction/PII safety;
- no secret material in SDUI JSON;
- no Redis credentials in domain/application code;
- production-safe errors.

Tests must include concurrent/replay scenarios, not only happy paths.

---

# 13. Implementation phases

No code implementation starts until this Phase 1 documentation contract is complete.

## Phase 0 — Repository-wide audit — COMPLETE

Purpose: inspect current state and classify KEEP/MODIFY/CREATE/DEFER without code changes.

Key conclusions:

- loaded Screen root duplication already fixed;
- guest Bootstrap already aligned;
- generic request/destination architecture already exists;
- Login request payload mismatches auth DTO;
- Send/Verify OTP still return legacy navigation shape;
- OTP and Dashboard Partner SDUI screens are absent;
- OTP persistence is currently Prisma-backed;
- Redis is now explicitly approved;
- global response/error contract requires reconciliation.

## Phase 1 — Documentation and contract freeze — CURRENT

Deliverables:

- this canonical implementation plan;
- Identity README ownership update;
- Cache README Redis ownership update;
- SDUI contract addendum correcting loaded Screen/destination/action semantics;
- Configuration/Bootstrap addendum documenting current Login destination and deferred Dashboard migration;
- zero production code changes.

Exit gate: all later phases have explicit owner, contract, dependency direction, test strategy and rollback/defer condition.

## Phase 2 — Repository-wide response/error contract reconciliation

Audit and align:

- `ResponseHelper` status/code mapping;
- global Fastify error handler;
- Zod/Fastify validation errors;
- `ApplicationError` mapping;
- 503/other required 5xx support;
- trace ID propagation;
- 200/201 creation policy;
- 204 behavior;
- tests for HTTP status == body status.

Do not create an OTP-specific envelope.

## Phase 3 — Redis platform infrastructure

Repository-first discovery, then extend `platform/cache` with the single canonical Redis implementation if one does not already exist.

Deliverables may include, only if absent:

- Redis configuration;
- Redis client/provider lifecycle;
- connect/disconnect/health behavior;
- DI registration;
- deterministic test strategy.

No OTP business logic belongs here.

## Phase 4 — Redis OTP repository adapter

Implement Identity infrastructure adapter behind existing `IOtpChallengeRepository`.

Deliverables:

- Redis challenge storage;
- key namespace helper;
- TTLs;
- latest challenge lookup;
- rate window/count;
- failed-attempt atomic update;
- one-time atomic consume;
- invalidation;
- focused infrastructure tests;
- DI switch only after parity.

## Phase 5 — Login request-contract alignment

Modify the existing Partner Login generic request action only.

Target mapping:

```text
phoneNumber ← $binding(mobileNumber)
deviceId    ← $context(deviceId)
```

Align transport validation names if canonical terminology requires it, but do not duplicate DTOs/use cases.

Tests cover invalid input, missing context, valid resolved request and no-navigation-on-error behavior where backend-testable.

## Phase 6 — Send OTP canonical destination result

Replace legacy `{ template, api }` navigation result with the canonical destination semantic contract.

Preserve all existing OTP security/business behavior.

No OTP screen is created until concrete destination identity is frozen in Phase 8.

## Phase 7 — End-to-end Send OTP error/security regression

Validate:

- resend cooldown;
- rate limiting;
- provider failure;
- Redis failure;
- expiry;
- no OTP leakage;
- trace ID/envelope consistency;
- concurrency behavior.

## Phase 8 — Partner OTP SDUI screen + route

Create only the missing product composition in `apps/api/src/surfaces/partner/screens` and route it through the existing Partner screen surface.

Requirements:

- use generic Template/Component/Section/Group/Element vocabulary;
- use existing generic request action and references;
- no semantic SDUI SDK types;
- screen identity exactly matches Send OTP destination;
- destination/fetched-screen identity tests.

## Phase 9 — Verify OTP request/result alignment

Wire OTP screen action to the existing `/verify_otp` route using generic references/context.

Replace legacy Verify OTP navigation result with canonical destination semantics while keeping user/session/refresh-token logic intact.

Authenticated destination remains gated until a real Partner Dashboard SDUI screen exists.

## Phase 10 — Authenticated Partner destination migration

Only when a real Dashboard (or other lifecycle destination) exists:

- publish its Screen;
- align Verify OTP next destination;
- align authenticated Bootstrap destination;
- add destination/fetched-screen identity tests;
- remove obsolete registry references only after usage audit.

## Phase 11 — Prisma OTP persistence retirement

After Redis production path is proven:

- verify no runtime usages of `PrismaOtpChallengeRepository` remain;
- decide remove vs retain as explicit fallback/test adapter;
- separately migrate/drop unused DB structures if approved;
- update documentation.

No silent dual persistence.

## Phase 12 — Full backend regression and freeze

Run focused and repository-level verification appropriate to changed packages:

- ui-sdk schema/action tests;
- Identity application tests;
- Redis/cache tests;
- configuration/bootstrap tests;
- API/DI/container tests;
- API build;
- domain/package builds;
- architecture/dependency gates;
- lint/typecheck where canonical scripts exist.

Document any unrelated pre-existing failure separately; do not weaken gates to obtain green.

## Phase 13 — Backend contract handoff for frontend MVI/UDF

Only after backend freeze:

- publish final request/response examples;
- publish destination rules;
- publish `$binding/$context/$response` keys required by Login/OTP;
- publish error/retry semantics;
- publish auth/session storage requirements.

Frontend then implements the flow through its existing MVI/UDF + ActionEngine architecture. No backend phase will create frontend-specific state stores/reducers.

---

## 14. File-level expected change map

This is a planning map, not permission to blindly create every listed file.

### Existing files expected to be reused/modified

```text
sdui/ui-sdk/src/contract/action.schema.ts              # only if contract gap is proven
sdui/ui-sdk/src/contract/screen.schema.ts              # normally KEEP
apps/api/src/surfaces/partner/screens/partner-login.screen.ts
domains/identity/application/AuthUseCases.ts
apps/api/src/transport/auth/dto/auth.dto.ts
apps/api/src/transport/auth/auth.controller.ts          # only transport mapping if required
domains/identity/identity.module.ts
platform/cache/*
apps/api/src/transport/response/ResponseHelper.ts
domains/configuration/application/contracts/partner-bootstrap.ts
domains/configuration/application/use-cases/GetPartnerBootstrapUseCase.ts
```

### New files allowed only if repository discovery proves no canonical equivalent

```text
platform/cache/...Redis...                              # one canonical Redis provider
 domains/identity/infrastructure/...RedisOtpChallengeRepository.ts
apps/api/src/surfaces/partner/screens/partner-otp.screen.ts
```

Naming/location will follow existing package conventions discovered during each phase; this plan does not authorize duplicating an existing class under a preferred name.

---

## 15. Test strategy

### Contract tests

- loaded Screen rejects root `templateId/templateType`;
- dynamic destination accepts only canonical fields;
- request action validates references/response mode;
- OTP destination matches fetched OTP screen.

### Identity tests

- send OTP new/existing user;
- no OTP leakage;
- cooldown;
- rate limit;
- provider failure;
- invalid/expired OTP;
- failed attempts;
- max-attempt invalidation;
- valid verification;
- replay rejection;
- refresh-token issuance/rotation;
- canonical destinations.

### Redis adapter tests

- TTL expiry;
- challenge lookup;
- latest-by-phone;
- rate counts;
- atomic failed attempts;
- atomic consume under concurrency;
- invalidation;
- namespacing;
- connection failures fail closed.

### Transport/envelope tests

- validation errors;
- 401/429/5xx auth errors;
- trace ID;
- HTTP status equals body status;
- success envelope;
- no hidden controller-specific response format.

### Configuration tests

- guest Bootstrap Login destination remains canonical;
- authenticated destination is not migrated until its Screen exists.

---

## 16. Definition of done for every phase

A phase is complete only when:

1. repository discovery proves reuse/extension decisions;
2. changed responsibility has exactly one owner;
3. code follows dependency direction;
4. focused tests are green;
5. affected package/build tests are green;
6. documentation is updated in the owning location;
7. no duplicate abstraction was introduced;
8. no unrelated cleanup is mixed into the phase;
9. frontend remains untouched unless Phase 13 handoff has completed and frontend work is explicitly approved.

---

## 17. Explicit anti-patterns

Do not implement:

- a second SDUI engine;
- `LoginContinueAction`/`OtpVerifyAction` semantic action classes in the generic SDK;
- direct Redis calls from `SendOtpUseCase` or `VerifyOtpUseCase`;
- direct Prisma calls from use cases;
- Redis connection creation inside repositories per request;
- plaintext OTP in Redis/logs/results;
- in-memory production fallback when Redis fails;
- dual Prisma+Redis writes without a documented migration reason;
- a second common response helper;
- product-specific response envelopes;
- root loaded-Screen `templateId/templateType` duplication;
- Dashboard destination guesses before Dashboard exists;
- frontend reducer/store/state-machine classes in the backend;
- new abstractions solely to rename an existing abstraction.

---

## 18. Phase 1 freeze statement

With this document approved:

- **Redis is the approved target persistence for OTP challenge state.**
- **Identity remains the owner of OTP business/security policy and the `IOtpChallengeRepository` port.**
- **`platform/cache` owns Redis technical infrastructure.**
- **The existing generic SDUI request/reference/destination system will be reused and extended only when a proven contract gap exists.**
- **Loaded Screen identity remains `screenId + template.id + template.type`; destination metadata remains separate.**
- **The Login request will map form phone state plus runtime device context to the existing auth route.**
- **Legacy `{template, api}` auth navigation results will migrate to canonical destination semantics.**
- **OTP SDUI is created only after backend contracts and Redis behavior are green.**
- **Authenticated Dashboard routing is deferred until a real Dashboard Screen exists.**
- **No frontend implementation occurs during these backend phases.**

This is the implementation contract for subsequent phases.