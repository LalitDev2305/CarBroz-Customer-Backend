# Partner Authentication + SDUI + Redis Implementation Plan

> **Status:** APPROVED IMPLEMENTATION CONTRACT — Phases 0–6 COMPLETE + FROZEN. Phases 7–13 are now planned as one continuous backend implementation campaign, but production implementation has NOT started. Each phase remains an explicit verification checkpoint and the campaign is not complete until the exact final `development` HEAD passes the complete closeout gates.
>
> **Branch:** `development`
>
> **Authority:** Subordinate to `MASTER-BACKEND-CONSTITUTION.md`, `PRODUCTION_FREEZE_CONSTITUTION.md`, `ENGINEERING-DOCUMENTATION-STANDARD.md`, and `FORENSIC-CHANGE-GATE.md`. If this document conflicts with a higher-authority contract or current source evidence, implementation stops, the conflict is resolved intentionally, and only then may code change.
>
> **Scope:** Finish the Partner Login → Send OTP → OTP Screen → Verify OTP → authenticated Partner destination backend flow, retire obsolete OTP persistence where proven safe, run repository-wide backend freeze verification, and publish the backend-to-frontend MVI/UDF handoff. Frontend implementation itself remains out of scope.

---

# 1. Single-campaign execution model

Phases 7–13 will be implemented in one continuous campaign so contract drift does not occur between chats or agents. “Single implementation” does **not** mean one unchecked change set. The mandatory sequence is:

```text
source audit
  ↓
Phase 7 implementation + focused verification
  ↓
Phase 8 implementation + focused verification
  ↓
Phase 9 implementation + focused verification
  ↓
Phase 10 implementation + focused verification
  ↓
Phase 11 implementation + focused verification
  ↓
Phase 12 repository-wide closeout
  ↓
Phase 13 contract handoff
  ↓
final documentation synchronization
  ↓
full canonical Backend CI + independent Architecture Closeout
  ↓
FINAL BACKEND FREEZE
```

Rules:

1. A later phase may not compensate for a known defect in an earlier phase.
2. A phase may have its own commit(s) for auditability; the work is still one continuous implementation campaign.
3. Every failure is fixed at the canonical owner. Tests/gates are never weakened to obtain green.
4. No phase is called COMPLETE merely because focused tests pass. The final campaign closes only on one exact documentation-complete HEAD.
5. If source evidence discovered during implementation invalidates this plan, production code stops until this document is deliberately amended first.

---

# 2. Non-negotiable engineering constitution for Phases 7–13

## 2.1 Reuse-first law

Every change follows this exact decision order:

```text
KEEP → EXTEND → MODIFY → CREATE
```

Before CREATE, implementation must prove all of the following:

- no canonical implementation already exists;
- extending an existing owner would violate SRP or another frozen boundary;
- the new responsibility has one clear owner;
- its package/location is allowed by `MASTER-BACKEND-CONSTITUTION.md`;
- it is reusable at the correct scope and is not a renamed duplicate.

Forbidden examples:

- second auth service/use case stack;
- second SDUI engine or navigation framework;
- second cache/Redis abstraction;
- second API response envelope/helper;
- Partner-specific action classes inside the generic UI SDK;
- duplicate Destination contracts created only for convenience;
- `common`, `shared`, `utils`, `helpers`, or catch-all packages as architectural owners.

## 2.2 Clean Architecture + DDD dependency law

Canonical dependency direction remains:

```text
transport/composition
       ↓
application use case
       ↓
domain-owned ports/contracts
       ↑
infrastructure adapters
```

Mandatory boundaries:

- `domains/*` never import Fastify, `ioredis`, Prisma client APIs, environment variables, or API DTOs.
- `apps/api` remains transport/composition/product-surface code, not a business-rules owner.
- technical Redis OTP mechanics remain in `platform/integrations` behind the Identity-owned `IOtpChallengeRepository`.
- generic SDUI vocabulary/contracts remain in `sdui/ui-sdk`.
- Partner screen composition remains under the Partner API surface, not inside generic SDK definitions.
- Partner startup policy remains owned by `domains/configuration`.
- session/token/OTP security rules remain owned by `domains/identity`.

## 2.3 SOLID / SRP rules

Each responsibility has one reason to change:

```text
route          = HTTP registration only
controller     = HTTP adaptation only
DTO/Zod schema = transport validation only
use case       = application orchestration/business policy
repository port= persistence capability contract
adapter        = technology-specific persistence/integration
screen builder = Partner SDUI product composition
UI SDK         = generic SDUI vocabulary/validation
configuration  = startup/config policy
```

Large “god” services, cross-context managers, generic service locators, and mixed transport/business classes are forbidden.

## 2.4 Design-pattern selection rule

Patterns are used only where they match an existing responsibility:

- **Ports & Adapters / Dependency Inversion** — mandatory for domain ↔ infrastructure boundaries.
- **Repository** — keep the existing Identity persistence ports; do not create repository aliases.
- **Provider/Strategy** — extend existing provider abstractions only where interchangeable external behavior already exists.
- **Factory/Builder** — reuse existing SDUI factories/builders for screen composition; do not hand-create a second builder framework.
- **Composition Root / DI** — Awilix registration remains in the executable composition boundary.
- **Value Contract** — small readonly cross-boundary result values only when no legal lower-level contract exists.

A design pattern is not introduced merely because it is fashionable. Simpler code inside the correct owner is preferred over unnecessary abstraction.

## 2.5 MVI + UDF compatibility rule

MVI/UDF is the frontend state architecture and is **not implemented in backend code**. The backend must support it through deterministic contracts:

```text
explicit input references
      ↓
deterministic request
      ↓
canonical response/error envelope
      ↓
explicit destination or explicit failure
      ↓
frontend ActionEngine → reducer/store
```

Backend requirements for MVI/UDF compatibility:

- responses are deterministic and immutable in semantics;
- no hidden navigation side effects;
- no screen-specific imperative callback protocol;
- success destinations are explicit data;
- failure never navigates;
- `$binding/$context/$response/$literal` remain the generic input-reference vocabulary;
- no backend reducers, stores, intents, effects, or view models are created.

## 2.6 Security rules

The following remain permanent:

- cryptographically secure OTP generation;
- OTP hash only in persistence;
- plaintext OTP never in API result/logs/storage;
- device binding;
- resend cooldown and rate limiting;
- bounded failed attempts;
- expiry;
- atomic one-time consume;
- replay rejection;
- provider/infrastructure failure fails closed where required;
- refresh-token hashing/rotation preserved;
- no Redis → memory/Prisma runtime fallback;
- no Redis + Prisma dual write;
- no secrets, tokens, OTP values, provider internals, SQL details, or unnecessary PII reflected to clients.

---

# 3. Frozen canonical assets — reuse these owners

The following are canonical and are not replaced during Phases 7–13:

- `sdui/ui-sdk/src/contract/action.schema.ts`
  - generic `request`, `navigate`, `present`, `dismiss`, `state`, `external_uri`, `sequence`;
  - generic `$binding`, `$context`, `$response`, `$literal` references;
  - canonical `dynamicDestinationSchema`.
- `sdui/ui-sdk/src/contract/screen.schema.ts`
  - canonical loaded Screen contract.
- `apps/api/src/surfaces/partner/screens/partner-login.screen.ts`
  - canonical Partner Login composition.
- shared Identity auth transport
  - `POST /api/v1/partner/auth/send_otp`;
  - `POST /api/v1/partner/auth/verify_otp`.
- `apps/api/src/transport/auth/dto/auth.dto.ts`
  - existing `SendOtpSchema` and `VerifyOtpSchema`.
- `domains/identity/application/AuthUseCases.ts`
  - Send/Verify OTP, session, refresh-token orchestration.
- `domains/identity/domain/repositories/IOtpChallengeRepository.ts`
  - single OTP persistence port.
- `platform/integrations/src/identity/RedisOtpChallengeRepository.ts`
  - production Redis OTP adapter.
- `platform/cache/src/ports/ICacheProvider.ts` and `IRedisClient`
  - canonical technical cache/Redis contracts.
- `apps/api/src/bootstrap/plugins/redis-cache.plugin.ts`
  - production Redis/cache/OTP composition owner.
- `apps/api/src/transport/response/ResponseHelper.ts` + global error handler
  - canonical API envelope/error owner.
- `domains/configuration/application/contracts/partner-bootstrap.ts`
  - canonical Partner startup destination contract.
- `domains/configuration/application/use-cases/GetPartnerBootstrapUseCase.ts`
  - canonical Partner startup selection owner.

---

# 4. Existing frozen contracts from Phases 0–6

## Phase 0 — Repository-wide audit — COMPLETE

Source-first ownership and dependency audit completed.

## Phase 1 — Documentation/contract freeze — COMPLETE

Canonical Partner auth/SDUI/Redis ownership documented before production implementation.

## Phase 2 — Response/error reconciliation — COMPLETE

One API envelope owner remains:

```text
{ status, code, message, data, traceId }
```

## Phase 3 — Redis platform infrastructure — COMPLETE

One canonical Redis/cache infrastructure composition retained; in-memory cache is test-only.

## Phase 4 — Redis OTP repository — COMPLETE

Production OTP state uses `RedisOtpChallengeRepository` through the Identity-owned port and the single root Redis client.

## Phase 5 — Partner Login request — COMPLETE

```text
phoneNumber ← $binding(mobileNumber)
deviceId    ← $context(deviceId)
POST /api/v1/partner/auth/send_otp
responseMode = destination
```

## Phase 6 — Send OTP canonical destination — COMPLETE + FROZEN

Canonical Send OTP success destination:

```json
{
  "screenId": "partner_otp",
  "templateId": "tpl_partner_otp_v1",
  "templateType": "form_template",
  "endpoint": "/api/v1/partner/screen/auth_otp",
  "method": "GET",
  "authentication": "NONE"
}
```

Phase 6 remains frozen and must not be rewritten while implementing later phases.

---

# 5. Detailed remaining-phase implementation contract

## Phase 7 — Send OTP error/security regression

**Status before implementation:** PLANNED / NOT STARTED

### Goal

Prove that the Phase 6 Send OTP success migration did not weaken any failure/security semantics.

### KEEP

- existing `SendOtpUseCase` business/security behavior;
- `AUTH_SECURITY_POLICY`;
- `IOtpChallengeRepository`;
- `RedisOtpChallengeRepository` atomic creation/rate mechanics;
- provider abstraction;
- `ResponseHelper` + global error mapping;
- existing Identity, Redis adapter, route and envelope tests.

### EXTEND / MODIFY

Extend the **existing** focused tests at their current owners. Production behavior changes only if a test exposes a real root-cause defect.

Required regression coverage:

1. resend cooldown → `429 / OTP_RESEND_COOLDOWN`;
2. application pre-check rate limit → `429 / OTP_RATE_LIMITED`;
3. persistence-time atomic concurrent rate limit → only allowed challenge count succeeds;
4. provider returns unsuccessful delivery → challenge invalidated + `503 / OTP_DELIVERY_FAILED`;
5. provider throws → challenge invalidated + same typed 503;
6. Redis/persistence failure fails closed; no alternate store is used;
7. response contains no OTP or OTP hash on success or failure;
8. error envelope has HTTP/body status parity and safe `traceId` behavior;
9. no destination is returned on failure;
10. repeated/concurrent Send OTP does not bypass cooldown/rate rules;
11. Phase 6 destination remains unchanged on successful issuance.

### CREATE

No production abstraction is expected. New test files are allowed only if existing owner-local test files cannot express the regression cleanly.

### Exit gate

Focused Identity + Redis + Partner auth transport regressions green; no production behavior drift; build/lint affected packages green.

---

## Phase 8 — Partner OTP SDUI screen + route

**Status before implementation:** PLANNED / NOT STARTED

### Source finding

The Partner surface currently contains only the Login screen; therefore the OTP screen is genuinely missing and CREATE is authorized at the Partner API product-composition owner.

### Frozen identity

The Phase 6 reservation must be implemented exactly:

```text
screenId       = partner_otp
template.id    = tpl_partner_otp_v1
template.type  = form_template
targetApp      = PARTNER
route          = GET /api/v1/partner/screen/auth_otp
authentication = NONE
```

### KEEP

- current `screenSchema`;
- current `dynamicDestinationSchema`;
- current production SDUI definitions/registries;
- current generic builders/factories;
- current generic `request` action;
- current generic value-reference types;
- existing shared `/verify_otp` auth route and `VerifyOtpSchema`.

### CREATE — authorized only because absent

Expected product-owned additions:

```text
apps/api/src/surfaces/partner/screens/partner-otp.screen.ts
apps/api/src/surfaces/partner/screens/partner-otp.screen.spec.ts
```

Route/controller additions must follow the already-existing Partner screen-serving pattern. If an existing generic Partner screen controller/route can serve another screen, EXTEND it instead of creating a second screen-delivery framework.

### OTP screen composition requirements

Use only existing generic Template → Component → Section → Group → Element capabilities that are actually registered. The functional screen must include, using existing generic definitions where available:

- OTP entry binding;
- verification/continue action;
- optional explanatory text/countdown/resend presentation only if existing generic primitives already support it;
- no product-specific SDK element/action solely for OTP.

Verify request semantics must resolve existing flow/runtime state instead of inventing hidden server state:

```text
challengeId ← previous Send OTP result / retained response state
phoneNumber ← retained auth-flow state
otp         ← OTP input binding
deviceId    ← runtime context
optional device metadata ← runtime context only when already supported
```

The request remains:

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate = true
responseMode = destination
```

If the current frontend/runtime contract does not yet define an executable `$response` path for one required field, do not invent a second reference mechanism in backend. Preserve the generic reference contract and document the frontend handoff requirement in Phase 13.

### Required tests

- built screen passes canonical `screenSchema`;
- exact screen/template identity matches Phase 6 destination;
- exact GET route returns canonical response envelope;
- destination → fetched screen parity:
  - `destination.screenId == loaded.screenId`;
  - `destination.templateId == loaded.template.id`;
  - `destination.templateType == loaded.template.type`;
- route is guest-accessible as `authentication = NONE`;
- Verify OTP action uses only generic request/reference vocabulary;
- no second SDUI engine/action type is introduced.

### Exit gate

OTP screen/route + destination parity green without changing Phase 6 Send OTP semantics.

---

## Phase 9 — Verify OTP request/result alignment

**Status before implementation:** PLANNED / NOT STARTED

### Goal

Align the already-existing Verify OTP transport/application flow with the OTP screen and canonical destination semantics while preserving authentication/session security.

### KEEP

- existing `VerifyOtpSchema` fields;
- existing `/api/v1/partner/auth/verify_otp` transport route/controller;
- existing `VerifyOtpUseCase` security/session/token behavior;
- `IOtpChallengeRepository` and Redis atomic consume;
- refresh-token repository/security behavior;
- global response envelope/error behavior.

### MODIFY

1. Wire the Phase 8 OTP screen request to the existing Verify OTP route.
2. Reuse the existing transport input shape:

```text
challengeId
phoneNumber
otp
deviceId
deviceModel? / osVersion? / fcmToken? only when runtime already supplies them
```

3. Remove Verify OTP's legacy `{ template, api }` `nextScreen` result **only when Phase 10 has published the real authenticated destination**.
4. Use the same transport-neutral readonly `AuthFlowDestination` shape already owned by Identity for Send OTP rather than creating a second Verify-specific destination interface.

### Security regressions required

- invalid challenge;
- phone mismatch;
- device mismatch;
- invalid OTP;
- expired OTP;
- failed-attempt increment;
- max-attempt rejection/invalidation;
- exactly-once consume;
- concurrent verifies: at most one succeeds;
- replay after successful consume fails;
- successful verify creates/updates user/session according to existing behavior;
- refresh token remains hashed/rotatable according to existing contract;
- OTP and OTP hash never appear in API response/logs;
- no session/token is issued before successful atomic consume.

### Phase ordering note

Phase 9 request wiring may be completed before Phase 10, but the legacy Verify OTP destination may not be replaced with guessed values. Final Verify OTP destination migration occurs in Phase 10 against the real published authenticated screen.

### Exit gate

Verify OTP request/security behavior green; no duplicate auth use case, DTO, controller, repository, or destination abstraction.

---

## Phase 10 — Real authenticated Partner destination + migration

**Status before implementation:** PLANNED / previously deferred

### Source finding

Configuration already reserves an authenticated startup identity:

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

Those existing values are the starting source contract. Do not invent new Dashboard identifiers merely to finish this phase.

### Goal

Make the existing authenticated startup destination real, then align Verify OTP and Bootstrap to that one published screen.

### KEEP

- `PartnerStartupScreenConfig` and `PartnerBootstrapDocument`;
- `GetPartnerBootstrapUseCase` startup-selection logic;
- existing authenticated identity above unless source validation proves it cannot be served legally;
- generic SDUI registry/screen-serving infrastructure;
- `AuthFlowDestination` in Identity.

### EXTEND / CREATE

First inspect current SDUI registry and Partner screen-serving paths.

Preferred order:

1. **EXTEND existing generic registry/publication path** so the reserved `partner_dashboard` becomes a real published Partner screen.
2. If no Partner Dashboard composition exists, **CREATE only the product screen composition at the Partner API surface** using existing generic SDUI primitives.
3. Do not create a Dashboard-specific SDK framework, registry implementation, response helper, or navigation engine.

The first authenticated Dashboard implementation may be the smallest legitimate production shell required to make the contract real; it must still pass the canonical Screen schema and must not contain fake business data merely to satisfy routing.

### MODIFY

After the screen is real and fetchable:

- migrate `VerifyOtpResult.nextScreen` from legacy `{ template, api }` to the canonical authenticated `AuthFlowDestination`;
- make Verify OTP return exactly the published authenticated destination;
- ensure `GetPartnerBootstrapUseCase` authenticated startup points to the exact same identity;
- if the current default configuration contains a stale route/template value that cannot match the canonical published screen, amend that single existing Configuration owner rather than introducing a second startup mapping.

### Required parity tests

```text
verifyOtp.nextScreen.screenId       == authenticatedBootstrap.nextScreen.screenId
verifyOtp.nextScreen.templateId     == authenticatedBootstrap.nextScreen.templateId
verifyOtp.nextScreen.templateType   == authenticatedBootstrap.nextScreen.templateType
verifyOtp.nextScreen.endpoint       == authenticatedBootstrap.nextScreen.endpoint
verifyOtp.nextScreen.authentication == SESSION
```

And after fetching:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

Also prove guest Bootstrap remains `partner_login` and is not changed by authenticated Dashboard work.

### Exit gate

One real authenticated Partner destination exists; Verify OTP and authenticated Bootstrap converge on it; no guessed or duplicate routing contract remains.

---

## Phase 11 — Prisma OTP persistence retirement

**Status before implementation:** PLANNED / previously deferred

### Goal

Remove obsolete Prisma OTP runtime infrastructure only after Redis parity and production ownership are proven, without disturbing other Identity Prisma repositories.

### Source finding

`identity.module.ts` still registers `PrismaOtpChallengeRepository`; production later overrides OTP persistence with the Redis infrastructure composition. This is compatibility debt, not a second approved production persistence path.

### Mandatory retirement sequence

1. Search all source/tests for `PrismaOtpChallengeRepository`, OTP Prisma model/table, and `otpChallengeRepository` composition.
2. Prove development/production resolve Redis only.
3. Prove there is no Redis → Prisma fallback and no dual write.
4. Replace deterministic tests that depend on the Prisma OTP adapter with the narrowest existing test repository/fake mechanism. A test-only fake is allowed; a second production adapter is not.
5. Remove Prisma OTP adapter registration from the canonical Identity module once tests no longer require it.
6. Remove/deprecate the obsolete `PrismaOtpChallengeRepository` implementation if zero legitimate consumers remain.
7. Audit Prisma schema/migrations:
   - if the OTP table/model is now unreferenced by production, tests, seeds, migrations, or operational tooling, retire it through an explicit Prisma migration;
   - do not drop unrelated Identity schema;
   - never edit historical migrations to fake convergence.
8. Run fresh-database migration/drift verification.

### CREATE

Only an explicit forward Prisma migration is authorized if a now-unused OTP table/model is actually removed. No new persistence abstraction is expected.

### Required tests/gates

- development/production DI resolves Redis OTP repository;
- tests remain deterministic without production Prisma OTP dependency;
- no source import/reference to retired Prisma OTP adapter when removal is complete;
- Prisma validate/generate/migrate fresh database green;
- schema drift gate green;
- other Identity Prisma repositories remain unaffected.

### Exit gate

Exactly one production OTP persistence implementation remains: Redis behind `IOtpChallengeRepository`.

---

## Phase 12 — Full backend regression + production freeze

**Status before implementation:** PLANNED / NOT STARTED

### Goal

Prove the complete Phases 0–11 backend is internally consistent on one exact candidate SHA.

### Mandatory verification matrix

Run the canonical repository sequence, not a reduced local subset:

- immutable dependency install;
- CW2 physical architecture gate;
- CW1/CW2 Constitution regression gate;
- CW3 bounded-context/dependency gate;
- CW4 domain/application contract gate;
- CW5 resource/public-ID gate;
- CW5 error-semantics/leakage gate;
- CW5 runtime-config/secret gate;
- CW5 observability/PII gate;
- Prisma validate;
- Prisma generate;
- fresh PostgreSQL migrations;
- schema convergence/drift proof;
- monorepo build;
- ESLint;
- full Vitest;
- repeat CW1–CW5 after tests/build;
- non-mutating/read-only proof;
- canonical `CarBroz Backend CI`;
- independent `Backend Architecture Closeout Verifier`.

### Functional E2E contract to prove

```text
Partner Bootstrap guest
  → partner_login
  → Send OTP
  → canonical partner_otp destination
  → GET partner OTP screen
  → Verify OTP
  → session/token creation
  → canonical authenticated Partner destination
  → fetch authenticated screen
```

Also prove error branches do not navigate and do not leak sensitive state.

### Failure policy

Any red gate reopens the owning phase. Root cause is repaired at its canonical owner and the full closeout reruns. No test, lint, architecture, security, migration, or coverage rule is weakened.

### Exit gate

Both canonical workflows green on the same exact implementation-complete SHA.

---

## Phase 13 — Backend → frontend MVI/UDF contract handoff

**Status before implementation:** PLANNED / previously deferred

### Goal

Publish the exact backend contract the Compose Multiplatform frontend must consume without implementing frontend code in this repository.

### Reuse-before-create

Search existing canonical docs first. If no current handoff document owns this responsibility, one new operational handoff document under `docs/` is authorized; it must reference rather than duplicate normative architecture definitions.

### Required handoff content

1. **Bootstrap**
   - guest/authenticated examples;
   - Destination semantics;
   - session requirement.
2. **Login screen**
   - endpoint;
   - `mobileNumber` binding;
   - `$context(deviceId)`.
3. **Send OTP**
   - request example;
   - response envelope;
   - `challengeId`, TTL, `isNewUser`;
   - canonical OTP destination.
4. **OTP screen**
   - screen/template identity;
   - bindings/actions;
   - state that must survive from Send OTP to Verify OTP.
5. **Verify OTP**
   - request fields;
   - success session/token contract;
   - authenticated destination.
6. **Generic ActionEngine contract**
   - `request`;
   - `responseMode: destination`;
   - `$binding/$context/$response/$literal`;
   - failure = state/error, no navigation.
7. **Errors/retries**
   - stable codes and status semantics;
   - cooldown/rate-limit/provider/dependency behavior;
   - retry expectations without exposing internals.
8. **Security/storage expectations**
   - refresh/session token handling requirements already supported by backend contract;
   - OTP must never be persisted as reusable application state after verification;
   - authentication requirement before fetching SESSION destinations.
9. **MVI/UDF mapping guidance**
   - backend action/result → frontend Intent/ActionEngine → Result/Effect → Reducer → State;
   - backend does not prescribe frontend class names or duplicate its architecture.

### Exit gate

Handoff matches the exact frozen backend source and contains no aspirational endpoint/field/screen that does not exist.

---

# 6. Cross-phase file ownership/change map

## KEEP / inspect first

```text
sdui/ui-sdk/src/contract/action.schema.ts
sdui/ui-sdk/src/contract/screen.schema.ts
sdui/ui-sdk/src/builder/**
sdui/ui-sdk/src/factory/**
sdui/ui-sdk/src/definitions/**
apps/api/src/surfaces/partner/screens/partner-login.screen.ts
apps/api/src/transport/auth/auth.controller.ts
apps/api/src/transport/auth/partner-auth.routes.ts
apps/api/src/transport/auth/dto/auth.dto.ts
domains/identity/application/AuthUseCases.ts
domains/identity/application/AuthSecurityPolicy.ts
domains/identity/domain/repositories/IOtpChallengeRepository.ts
domains/identity/identity.module.ts
platform/integrations/src/identity/RedisOtpChallengeRepository.ts
platform/cache/src/ports/**
apps/api/src/bootstrap/plugins/di.plugin.ts
apps/api/src/bootstrap/plugins/redis-cache.plugin.ts
apps/api/src/transport/response/ResponseHelper.ts
domains/configuration/application/contracts/partner-bootstrap.ts
domains/configuration/application/use-cases/GetPartnerBootstrapUseCase.ts
prisma/schema.prisma
```

## Authorized CREATE only when source audit confirms absence

```text
apps/api/src/surfaces/partner/screens/partner-otp.screen.ts
apps/api/src/surfaces/partner/screens/partner-otp.screen.spec.ts
Partner Dashboard screen composition only if no real composition exists
forward Prisma migration only if obsolete OTP schema is actually retired
one backend→frontend handoff document only if no canonical equivalent exists
```

No other new architectural layer/package/framework is pre-authorized.

---

# 7. Repository-wide test strategy

## Identity / OTP

- Send OTP new/existing user;
- cooldown;
- rate limit including concurrent atomic limit;
- provider failure/throw;
- Redis failure;
- invalid/expired challenge;
- phone/device mismatch;
- failed/max attempts;
- valid verify;
- concurrent consume;
- replay rejection;
- session creation;
- refresh-token behavior;
- no OTP/hash leakage.

## SDUI

- Login contract unchanged;
- OTP screen strict schema;
- generic request/reference vocabulary only;
- OTP destination ↔ screen parity;
- authenticated destination ↔ screen parity;
- no loaded-Screen root template identity duplication.

## Transport

- exact Partner routes;
- validation behavior;
- success envelope;
- 401/400/422/429/503/500 mappings as applicable;
- HTTP/body status parity;
- trace ID propagation;
- safe non-reflective errors;
- no controller-specific envelope.

## Redis / DI

- one root Redis client;
- cache and OTP adapter share same client;
- no non-test fallback;
- startup health fail-closed;
- atomic OTP operations;
- graceful shutdown.

## Configuration

- guest Bootstrap → Login;
- authenticated Bootstrap → real authenticated screen;
- Verify OTP destination == authenticated Bootstrap destination.

## Persistence retirement

- no runtime Prisma OTP dependency;
- fresh Prisma migration convergence;
- no schema drift;
- unrelated Identity persistence unaffected.

## E2E

- full guest login → OTP → verify → authenticated-screen happy path;
- key failure paths stop before navigation/session issuance.

---

# 8. Definition of Done for the single implementation campaign

The Phases 7–13 campaign is complete only when **all** are true:

1. Phases 0–6 remain green and unchanged in contract.
2. Phase 7 security/error regression is complete.
3. Phase 8 real Partner OTP screen/route exists and matches Phase 6 exactly.
4. Phase 9 Verify OTP request/security flow is aligned without duplicate abstractions.
5. Phase 10 a real authenticated Partner screen exists and Verify OTP + Bootstrap converge on it.
6. Phase 11 obsolete Prisma OTP production persistence is retired safely and migrations converge.
7. Phase 12 complete repository verification is green.
8. Phase 13 frontend handoff reflects exact source behavior.
9. Clean Architecture/DDD dependency direction remains valid.
10. SRP/SOLID ownership remains valid.
11. no duplicate framework/contract/provider/repository/navigation/envelope is introduced.
12. MVI/UDF compatibility is maintained without backend frontend-state classes.
13. all canonical documentation matches implementation exactly.
14. `development` HEAD is the documentation-complete candidate.
15. canonical Backend CI and independent Architecture Closeout both succeed on that **same exact final HEAD**.
16. a mandatory final second-pass forensic audit finds no source/document/test/runtime mismatch.

Only then may the backend Partner-auth campaign be marked **COMPLETE + FROZEN**.

---

# 9. Explicit anti-patterns — forbidden during the campaign

Do not implement:

- second SDUI engine/ActionEngine/navigation framework;
- Login/OTP/Dashboard-specific action classes in generic SDK;
- direct Redis calls from Identity use cases;
- direct Prisma client calls from application use cases;
- per-request Redis clients;
- Redis → memory or Redis → Prisma runtime fallback;
- Prisma + Redis dual writes;
- plaintext OTP persistence/logging/API exposure;
- second auth use case/controller/DTO stack for Partner;
- second response helper/envelope;
- duplicate Destination schemas/interfaces when an existing owner can be reused;
- guessed replacement Dashboard identifiers while existing Configuration identities exist;
- fake Dashboard business data to make navigation appear complete;
- backend MVI reducers/stores/intents/view models;
- generic `shared/common/utils/helpers` ownership buckets;
- a new abstraction created only to rename an existing one;
- unrelated repository cleanup mixed into auth work;
- editing historical migrations instead of creating an explicit forward migration;
- `FLUSHDB`/`FLUSHALL` from generic cache;
- weakening tests, CI, architecture, migration, security, or observability gates.

---

# 10. Implementation-start gate

Before the first Phase 7 production/test change, the implementation session must:

1. read this document from the latest `development` HEAD;
2. read `MASTER-BACKEND-CONSTITUTION.md`;
3. verify Phase 6 is still frozen/green;
4. inspect the exact current owners listed in the relevant phase;
5. classify every intended change as KEEP / EXTEND / MODIFY / CREATE;
6. prove each CREATE is actually missing;
7. confirm no Customer/Admin isolation boundary is affected unintentionally;
8. then implement Phases 7–13 continuously according to this document.

Implementation must match this document. If code and this contract diverge, the divergence is a defect until one side is intentionally corrected at the proper authority level.