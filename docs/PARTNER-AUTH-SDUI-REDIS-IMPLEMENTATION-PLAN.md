# Partner Authentication + SDUI + Redis Implementation Plan

> **Status:** AUTH/SECURITY BEHAVIOR FROZEN; SDUI composition ownership and final OTP identity/UX synchronized with the current single-engine architecture.
>
> **Branch:** `development`
>
> **Architecture authority:** `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
>
> **Behavior authority:** `sdui/PARTNER-AUTH-SDUI-CONTRACT.md`
>
> **Runtime handoff:** `docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md`
>
> The original Partner Auth phases established and proved the production auth/Redis/Destination behavior. Those security and transport guarantees remain frozen. The previous statement that `apps/api` owns Partner screen composition is superseded: final screen composition now belongs exclusively to `sdui/engine`.

---

## 1. Current non-negotiable ownership

```text
Identity domain
  → OTP/session/token business policy
  → IOtpChallengeRepository

platform/integrations
  → Redis OTP repository adapter
  → shared Redis client infrastructure

sdui/engine
  → generic SDUI vocabulary
  → node definitions + defaults
  → fluent hierarchy/property authoring
  → generic actions/references
  → Partner Login/OTP/Dashboard screen composition
  → screen registry/service/validation

sdui/registry
  → persisted publication/version lifecycle only where still required

apps/api
  → Fastify transport/adaptation only

frontend MVI/UDF runtime
  → bindings/context/response resolution
  → generic action execution
  → transient auth-flow state
  → hidden resend cooldown state/timing
  → destination verification/rendering
```

Forbidden:

- second auth stack;
- second SDUI/action/navigation framework;
- Partner-specific generic action types;
- API/domain-owned permanent screen composition;
- second cache/Redis abstraction;
- Redis→Prisma or Redis→memory production OTP fallback;
- Redis+Prisma OTP dual write;
- plaintext OTP persistence/logging/API exposure;
- backend reducer/store/ViewModel ownership;
- weakening security/architecture/test/migration gates.

---

## 2. Canonical SDUI reference vocabulary

Wire forms remain exactly:

```text
$binding
$context
$response
$literal
```

New engine authoring uses:

```text
ref.binding(...)
ref.context(...)
ref.response(...)
ref.literal(...)
```

No `$form`, `$payload` or `$state` namespace is authorized.

---

## 3. Canonical Destination and identity semantics

```text
screenId
templateId
templateType
endpoint
method
authentication = NONE | SESSION
```

Loaded screen identity:

```text
screen.screenId
screen.template.id
screen.template.type
```

After fetch:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

Concrete Template/Component/Section/Group/Element IDs are unique instance identities. Reuse belongs to generic node `type`, properties/actions and composition patterns, never reuse of concrete IDs across screens.

---

## 4. Canonical Partner Auth flow

```text
GET /api/v1/partner/config/bootstrap
  guest → partner_login

GET /api/v1/partner/screen/auth_login
  Login screen from SDUI engine

Continue
  → POST /api/v1/partner/auth/send_otp

Send OTP success
  → partner_otp Destination

GET /api/v1/partner/screen/auth_otp
  OTP screen from SDUI engine

Verify
  → POST /api/v1/partner/auth/verify_otp

Verify OTP success
  → partner_dashboard SESSION Destination

GET /api/v1/partner/sdui/registry/partner_dashboard
  Authorization: Bearer <access token>

Authenticated Bootstrap
  → same partner_dashboard Destination
```

The transport routes remain frozen while screen composition ownership remains engine-owned.

---

## 5. Login request — frozen

```text
POST /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Body:

```json
{
  "phoneNumber": { "$binding": "mobileNumber" },
  "deviceId": { "$context": "deviceId" }
}
```

Authoring target:

```ts
action.request({
  method: 'POST',
  endpoint: '/api/v1/partner/auth/send_otp',
  authentication: 'NONE',
  validate: true,
  responseMode: 'destination',
  body: {
    phoneNumber: ref.binding('mobileNumber'),
    deviceId: ref.context('deviceId'),
  },
});
```

---

## 6. Send OTP destination — frozen

```text
screenId       = partner_otp
templateId     = tpl_P6X8N3
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

`tpl_P6X8N3` is the opaque stable Partner OTP template identity. Legacy semantic template ID `tpl_partner_otp_v1` is superseded and must not be emitted by current implementation.

Legacy `{ template, api }` navigation is forbidden.

---

## 7. OTP screen + Verify request — frozen

Loaded OTP identity:

```text
screenId      = partner_otp
template.id   = tpl_P6X8N3
template.type = form_template
targetApp     = PARTNER
```

Six visual OTP cells represent one logical six-digit binding:

```text
otp ← { $binding: "otp" }
```

Verify request:

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

References:

```text
challengeId ← latest successful Send OTP challenge
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

The screen implementation must express these through the generic engine action/reference model without creating Partner/OTP-specific action types.

---

## 8. Resend OTP + cooldown boundary — frozen

Redis/backend business policy remains authoritative for whether another OTP request is allowed. Frontend UX state must never bypass server rate/cooldown enforcement.

The final screen UX does **not** render a visible countdown. Instead:

```text
COOLDOWN
  Resend OTP visible
  disabled / grey
  hidden timer runs in frontend/runtime

READY
  Resend OTP visible
  enabled / clickable
```

The initial successful Send OTP starts the local hidden cooldown. A READY tap calls the same:

```text
POST /api/v1/partner/auth/send_otp
```

using the active phone number and device ID. Resend is immediately disabled to prevent duplicate taps. On success the frontend retains the newest successful challenge and restarts the hidden cooldown. On failure it exposes the request error and restores an appropriate retryable state subject to backend policy.

`expiresInSeconds` represents OTP/challenge validity and must not be interpreted as resend eligibility. If cooldown duration is backend-configurable it must be represented separately, for example as `resendAfterSeconds`.

---

## 9. Verify OTP security order — permanent

```text
load phone/device-bound challenge
→ reject invalid/consumed/expired/max-attempt challenge
→ verify OTP hash
→ record/invalidate failed attempt when needed
→ atomic one-time consume
→ only then create/update user/session
→ only then issue credential family
→ return authenticated destination
```

Required invariants:

- exactly-once consume;
- concurrent verification fail-closed;
- replay rejection;
- no user/session/token issuance before successful consume;
- phone/device binding preserved;
- bounded attempts;
- TTL/expiry preserved.

No SDUI architecture work may modify this ordering.

---

## 10. Redis OTP persistence — permanent

Production persistence is exactly:

```text
Identity IOtpChallengeRepository
        ↑
RedisOtpChallengeRepository
        ↑
shared singleton redisClient
```

Permanent requirements:

- one root Redis client;
- cache and OTP adapter use shared infrastructure;
- OTP hash only;
- resend cooldown;
- bounded rate limit;
- atomic create/rate-limit;
- atomic failed-attempt update;
- atomic exactly-once consume;
- provider failure invalidates challenge;
- no non-test memory fallback;
- no Prisma OTP fallback;
- no OTP dual write.

Test-only deterministic in-memory composition is allowed only at executable test boundaries.

---

## 11. Dashboard destination — frozen

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

The published Dashboard registry document remains a deployment/runtime requirement until persisted-registry lifecycle convergence is complete.

Forward migration:

```text
prisma/migrations/20260909142000_publish_partner_dashboard/migration.sql
```

Production must not depend on manually running `prisma db seed`.

Final code-authored presentation ownership converges to:

```text
sdui/engine/src/screens/partner/PartnerDashboardScreen.ts
```

The registry route may remain the retrieval mechanism while publication lifecycle remains required; it must consume canonical engine contracts rather than define a second SDUI language.

---

## 12. SESSION error semantics — frozen

Missing/invalid credentials for SESSION routes must produce safe canonical auth responses:

```text
401 UNAUTHORIZED
403 FORBIDDEN
```

Never convert transport-owned JWT/auth failures into 500 responses and never expose plugin/internal credential detail.

---

## 13. Frontend transient auth-flow state

After successful Send OTP and before OTP destination execution:

```text
authFlow.phoneNumber = resolved Send OTP request phoneNumber
latestSuccessfulSendOtpResponse = complete successful Send OTP response envelope
activeChallengeId = latest successful Send OTP challengeId
resendEnabled = false
hidden resend cooldown = running
```

This supplies the latest challenge, phone context and generic OTP binding to Verify OTP. After every successful resend, the latest successful challenge replaces the previous active challenge.

Clear state on successful Verify OTP, abandoned flow, logout/reset or new auth flow.

OTP plaintext must not become reusable persistent application state.

---

## 14. Property/default migration boundary

Partner Auth screen source follows the engine's five property categories:

```text
base/default
style
content/instance
behavior
metadata/semantic
```

Node definitions own canonical defaults. Screen composers specify only intentional overrides and instance-specific values.

This is an authoring change only. Final canonical wire properties must preserve accepted behavior and pass strict schema validation.

Generic rich text/inline span support, if required by Login/OTP visuals, belongs to the existing reusable `text` element contract. Generic enabled/disabled presentation/state belongs to reusable behavior/state contracts. Neither may become Partner-specific primitives.

---

## 15. Screen migration status

The original auth behavior campaign is complete. Current work is a narrowly scoped Partner OTP contract/convergence update; do not restart completed Login/OTP ownership migrations.

The permanent order for this change remains:

```text
current documentation reconciliation
→ inspect existing engine capabilities
→ minimal generic capability additions only where missing
→ Partner OTP composer update using Login as structural reference
→ Destination identity convergence
→ focused golden/regression proof
→ canonical architecture/build/lint/test gates
→ exact-SHA freeze
```

---

## 16. Historical completed security phases

The earlier phases remain valid evidence for the behavior they proved:

```text
repository audit
→ envelope/error foundation
→ Identity OTP port
→ Redis adapter/shared client
→ Login request alignment
→ Send OTP destination
→ Send OTP regression/security
→ OTP route/screen
→ Verify OTP security
→ authenticated Dashboard destination
→ Prisma OTP retirement
→ full E2E/production closeout
→ frontend MVI/UDF handoff
```

Their old physical screen-owner locations or old OTP template identity do not override current authorities.

---

## 17. Required regression proof after OTP convergence

The final change must prove all prior security/transport behavior again, including:

```text
guest Bootstrap
→ Login
→ Send OTP
→ OTP Destination (tpl_P6X8N3)
→ OTP screen
→ initial Resend disabled/grey
→ hidden cooldown enables Resend
→ Resend calls Send OTP again
→ newest successful challenge retained
→ six-digit aggregate OTP binding
→ Verify OTP
→ credentials
→ unauthenticated Dashboard rejected
→ authenticated Dashboard loaded
→ authenticated Bootstrap parity
```

Plus architecture-specific proof:

- Login remains the structural golden reference;
- OTP expected canonical output equals engine output;
- every concrete OTP node ID is unique and does not reuse Login IDs;
- request body mappings are correct;
- no visible countdown is emitted;
- Destination identities match loaded screen identity;
- strict validation is unchanged or stronger;
- Redis-only OTP persistence is unchanged;
- no API/domain screen-composition owner is introduced;
- no Partner/OTP-specific action language is introduced.

---

## 18. Persistence/deployment invariants

- historical Prisma migrations remain immutable;
- OTP retirement remains forward-only;
- Dashboard publication remains forward-only;
- fresh migration chain contains no production `OtpChallenge` table;
- fresh migration chain contains the required published Dashboard document while that retrieval path is active;
- `prisma db seed` remains optional development convenience, not production dependency.

---

## 19. Final change rule

Any future change to OTP security, persistence, Destination identity, auth payloads, SESSION semantics, credential ordering, OTP binding semantics or Resend UX reopens the corresponding security/behavior contract and requires full closeout.

SDUI internal authoring may evolve only through the documentation-first process in `sdui/README.md` and `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`.
