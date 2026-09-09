# Partner Authentication + SDUI + Redis Implementation Plan

> **Status:** Phases 0–6 remain COMPLETE + FROZEN. Phases 7–13 are IMPLEMENTED and in final same-HEAD closeout. The Phase 7–13 freeze is valid only when the exact documentation-complete `development` HEAD passes both canonical `CarBroz Backend CI` and the independent `Backend Architecture Closeout Verifier`, followed by the mandatory second-pass forensic audit.
>
> **Branch:** `development`
>
> **Authority:** Subordinate to `MASTER-BACKEND-CONSTITUTION.md`, `PRODUCTION_FREEZE_CONSTITUTION.md`, `ENGINEERING-DOCUMENTATION-STANDARD.md`, and `FORENSIC-CHANGE-GATE.md`.
>
> **Scope:** Partner Bootstrap → Login → Send OTP → OTP Screen → Verify OTP → authenticated Partner Dashboard; Redis-only production OTP persistence; Prisma OTP retirement; full backend regression; backend-to-frontend MVI/UDF handoff.

## 1. Non-negotiable architecture

All implementation continues to obey:

```text
KEEP → EXTEND → MODIFY → CREATE

transport/composition
       ↓
application use case
       ↓
domain-owned ports/contracts
       ↑
infrastructure adapters
```

Frozen ownership:

- Identity owns OTP/session/token business policy and `IOtpChallengeRepository`.
- `platform/integrations` owns the Redis OTP adapter.
- `apps/api` owns Fastify transport/composition and Partner product-surface SDUI composition.
- `sdui/ui-sdk` owns only generic SDUI vocabulary/schema.
- Configuration owns Partner startup destination policy.
- Prisma/PostgreSQL continues to own user/session/refresh-token and SDUI registry persistence.
- Frontend MVI/UDF owns reducer/store/ViewModel/state/effect behavior; none is implemented in backend code.

Forbidden throughout this campaign:

- second auth stack;
- second SDUI/ActionEngine/navigation framework;
- second cache/Redis abstraction;
- Partner-specific generic SDK actions;
- Redis→Prisma or Redis→memory production fallback;
- Redis+Prisma OTP dual write;
- plaintext OTP persistence/logging/API exposure;
- backend reducers/stores/intents/ViewModels;
- historical migration edits;
- weakening architecture/security/test/migration gates.

## 2. Canonical contracts

### 2.1 Generic SDUI value references

The implemented SDK supports exactly:

```text
$binding
$context
$response
$literal
```

No `$form`, `$payload`, or `$state` reference namespace is part of the current contract.

### 2.2 Canonical Destination

```text
screenId
templateId
templateType
endpoint
method = GET
authentication = NONE | SESSION
```

Loaded Screen identity remains:

```text
screen.screenId
screen.template.id
screen.template.type
```

Required parity after fetch:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

### 2.3 Canonical Partner auth flow

```text
GET /api/v1/partner/config/bootstrap
  guest → partner_login

GET /api/v1/partner/screen/auth_login
  Continue → POST /api/v1/partner/auth/send_otp

Send OTP success
  → partner_otp

GET /api/v1/partner/screen/auth_otp
  Verify → POST /api/v1/partner/auth/verify_otp

Verify OTP success
  → partner_dashboard (SESSION)

GET /api/v1/partner/sdui/registry/partner_dashboard
  Authorization: Bearer <access token>

Authenticated Bootstrap
  → same partner_dashboard destination
```

## 3. Phase status

### Phase 0 — Repository audit

**Status:** COMPLETE + FROZEN.

Canonical owners, route composition, SDUI schema/action vocabulary, Identity persistence ports, Redis/cache composition, Configuration startup policy, and response/error envelope were established before implementation.

### Phase 1–4 — Foundational backend contracts

**Status:** COMPLETE + FROZEN.

The previously frozen envelope, error handling, Identity OTP port, Redis adapter, shared Redis client, and ownership/dependency rules remain intact.

### Phase 5 — Partner Login request alignment

**Status:** COMPLETE + FROZEN.

Login continues to use the existing generic request action:

```text
POST /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Request mapping:

```json
{
  "phoneNumber": { "$binding": "mobileNumber" },
  "deviceId": { "$context": "deviceId" }
}
```

No Partner-specific auth DTO/action/navigation mechanism was introduced.

### Phase 6 — Send OTP canonical destination

**Status:** COMPLETE + FROZEN.

Send OTP success destination is:

```text
screenId       = partner_otp
templateId     = tpl_partner_otp_v1
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

Legacy `{ template, api }` Send OTP navigation is forbidden.

### Phase 7 — Send OTP security/error regression

**Status:** IMPLEMENTED; included in final closeout.

Implemented regression coverage includes:

- resend cooldown;
- rate limit;
- concurrent atomic rate limit;
- provider failure/throw;
- repository/infrastructure failure behavior;
- challenge invalidation after delivery failure;
- no OTP/hash leakage;
- canonical typed error semantics.

Implementation preserves secure OTP generation, hashing, device binding and fail-closed behavior.

### Phase 8 — Partner OTP SDUI Screen + route

**Status:** IMPLEMENTED; included in final closeout.

Real loaded screen:

```text
screenId      = partner_otp
template.id   = tpl_partner_otp_v1
template.type = form_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_otp
```

The screen uses only generic Template/Component/Section/Element/request/reference vocabulary.

Verify request mapping:

```text
challengeId ← { $response: "data.challengeId" }
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

No OTP-specific SDK action/type was added.

### Phase 9 — Verify OTP contract/security alignment

**Status:** IMPLEMENTED; included in final closeout.

`VerifyOtpResult.nextScreen` now uses the same transport-neutral readonly `AuthFlowDestination` used by Send OTP.

Security ordering remains:

```text
load phone/device-bound challenge
→ reject invalid/consumed/expired/max-attempt challenge
→ verify OTP hash
→ record/invalidate failed attempt when needed
→ atomic one-time consume
→ only then create/update user/session
→ only then issue hashed refresh-token family
→ return authenticated destination
```

Regression coverage includes invalid challenge, phone mismatch, device mismatch, invalid OTP, expiry, failed/max attempts, exactly-once consume, concurrent verify, replay rejection, and no session/token issuance before successful consume.

### Phase 10 — Real authenticated Partner destination

**Status:** IMPLEMENTED; included in final closeout.

Canonical destination:

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

A real minimal Partner Dashboard composition exists under the Partner API surface. The authenticated registry route verifies JWT and hard-scopes lookup to `targetApp: PARTNER`.

Critical deployment guarantee:

```text
prisma/migrations/20260909142000_publish_partner_dashboard/migration.sql
```

publishes the canonical Dashboard registry document. Production therefore does not depend on `prisma db seed` for the destination returned after Verify OTP.

Verify OTP and authenticated Bootstrap converge on this same destination. Guest Bootstrap remains `partner_login`.

### Phase 11 — Prisma OTP persistence retirement

**Status:** IMPLEMENTED; included in final closeout.

Production OTP persistence is now exactly one implementation:

```text
Identity IOtpChallengeRepository
        ↑
RedisOtpChallengeRepository
        ↑
shared singleton redisClient
```

Completed retirement:

- removed Prisma OTP adapter registration from Identity;
- removed obsolete `PrismaOtpChallengeRepository` implementation;
- added executable-boundary `InMemoryOtpChallengeRepository` for `NODE_ENV=test` only;
- removed Prisma `OtpChallenge` model;
- retired the table via forward migration `20260909134500_retire_prisma_otp_challenge`;
- kept PostgreSQL user/session/refresh persistence intact;
- preserved no-fallback/no-dual-write production behavior.

### Phase 12 — Full backend regression + production closeout

**Status:** IMPLEMENTED; final same-HEAD workflow proof pending/required.

The Phase 12 E2E uses the real Fastify application and the migration-published Dashboard. It proves:

```text
guest Bootstrap
→ Login screen identity
→ Send OTP
→ OTP destination identity
→ OTP screen identity
→ Verify OTP
→ access + refresh credentials
→ unauthenticated SESSION destination rejected
→ authenticated Dashboard fetched
→ authenticated Bootstrap destination parity
```

The E2E does not create a Dashboard fixture; migration deployment is part of the proof.

During forensic E2E validation, a real transport bug was found: raw `@fastify/jwt` 401/403 errors were falling through the global handler as 500. The fix belongs to the canonical transport error boundary and now maps transport-owned authentication/authorization failures to safe canonical 401/403 envelopes without exposing plugin internals.

Final mandatory verification matrix:

- immutable dependency install;
- CW2 physical architecture;
- CW1/CW2 Constitution regression;
- CW3 bounded-context/dependency;
- CW4 domain/application contract;
- CW5 resource/public-ID;
- CW5 error/leakage;
- CW5 runtime config/secrets;
- CW5 observability/PII;
- Prisma validate/generate;
- complete forward migrations on fresh PostgreSQL;
- fresh schema convergence/drift proof;
- monorepo build;
- ESLint;
- full Vitest;
- repeated CW1–CW5 gates;
- non-mutating/read-only proof;
- canonical Backend CI;
- independent Architecture Closeout.

Any red gate reopens its owning phase. No gate may be weakened.

### Phase 13 — Backend → frontend MVI/UDF handoff

**Status:** IMPLEMENTED; included in final closeout.

Canonical handoff:

```text
docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md
```

It documents only existing backend behavior and the real generic reference vocabulary.

Required frontend flow-state retention is explicit:

```text
after successful Send OTP and before OTP navigation:
  authFlow.phoneNumber      = resolved Send OTP phoneNumber
  lastSuccessfulResponse    = successful Send OTP response envelope
```

This supplies the OTP screen's `$context: "authFlow.phoneNumber"` and `$response: "data.challengeId"` references without adding hidden backend state or a second SDUI state-transfer mechanism.

Transient auth-flow state is cleared after successful Verify OTP or flow reset/cancellation. OTP plaintext must not become reusable persistent application state.

## 4. Redis/OTP invariants

Permanent production requirements:

- one root Redis client;
- cache and OTP adapter use the same client;
- OTP hash only;
- phone/device binding;
- resend cooldown;
- bounded rate limit;
- bounded attempts;
- TTL/expiry;
- atomic create/rate-limit;
- atomic failed-attempt update;
- atomic exactly-once consume;
- replay rejection;
- provider failure invalidates the created challenge;
- no non-test memory fallback;
- no Prisma OTP fallback;
- no OTP dual write.

## 5. Persistence/deployment invariants

- historical migrations are immutable;
- Prisma OTP retirement is forward-only;
- Dashboard publication is forward-only;
- a fresh database produced by the complete migration chain contains no `OtpChallenge` table and does contain the canonical published Partner Dashboard registry document;
- `prisma db seed` may remain an idempotent development convenience but is not a production dependency for authenticated Partner startup.

## 6. API/security invariants

- canonical response envelope remains owned by `ResponseHelper` + global error handler;
- HTTP/body status parity is preserved;
- validation details and unhandled exception internals do not leak;
- raw Fastify/JWT 401/403 errors are normalized into safe `UNAUTHORIZED`/`FORBIDDEN` envelopes;
- OTP/hash/token/provider/SQL internals are not exposed;
- SESSION screen retrieval requires a valid bearer token.

## 7. Final forensic audit checklist

Before final freeze, re-read source at the exact candidate SHA and verify:

1. no Identity→Fastify/Redis/Prisma/SDUI dependency inversion violation;
2. no duplicate OTP repository or production fallback;
3. no Prisma OTP model/adapter runtime reference;
4. no legacy `{ template, api }` Partner auth success navigation;
5. Login and OTP screens parse through canonical strict SDUI schemas;
6. SDK reference namespaces remain exactly `$binding/$context/$response/$literal`;
7. handoff contains no imaginary namespace/endpoint/field;
8. OTP flow-state producer/retention rule is documented;
9. Verify OTP creates no session/token before atomic consume;
10. Verify OTP destination == authenticated Bootstrap destination;
11. Dashboard destination == migration-published loaded Screen identity;
12. Dashboard route is SESSION-protected and PARTNER-scoped;
13. Dashboard availability does not depend on seed execution;
14. fresh migrations converge without drift;
15. Customer/Admin isolation remains unaffected;
16. all canonical docs match current implementation;
17. Backend CI and Architecture Closeout succeed on the exact same final HEAD.

## 8. Definition of Done

The Partner auth Phases 7–13 campaign is COMPLETE + FROZEN only when all of the following are simultaneously true on one exact `development` HEAD:

- Phase 7 security regressions complete;
- Phase 8 OTP Screen/route complete;
- Phase 9 Verify OTP security/destination complete;
- Phase 10 authenticated Dashboard real, published, protected and parity-tested;
- Phase 11 Prisma OTP retirement complete;
- Phase 12 repository-wide verification fully green;
- Phase 13 frontend handoff source-accurate;
- no architecture/security/SDUI/persistence/configuration mismatch remains;
- mandatory second-pass forensic audit is clean;
- `CarBroz Backend CI` succeeds;
- `Backend Architecture Closeout Verifier` succeeds on the same exact documentation-complete SHA.

Only that SHA is the Phase 7–13 backend freeze point.
