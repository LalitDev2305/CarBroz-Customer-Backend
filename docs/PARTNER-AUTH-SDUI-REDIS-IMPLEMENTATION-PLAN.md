# Partner Authentication + SDUI + Redis Implementation Plan

> **Status:** FROZEN AUTH / SECURITY / SDUI INTEGRATION CONTRACT
>
> **Branch:** `development`
>
> **Architecture authority:** `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
>
> **Behavior authority:** `sdui/PARTNER-AUTH-SDUI-CONTRACT.md`
>
> **Runtime handoff:** `docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md`

This document defines the current Partner Auth security, Redis persistence, Destination and SDUI integration contract only.

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
  → canonical SDUI hierarchy
  → NodeDefinitions + defaults
  → scoped setter authoring DSL
  → generic actions/references
  → Partner Login/OTP/Dashboard screen composition
  → screen registry/service/validation

sdui/registry
  → persisted publication/version lifecycle only where required

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
- API/domain-owned screen composition;
- second cache/Redis abstraction;
- Redis→Prisma or Redis→memory production OTP fallback;
- Redis+Prisma OTP dual write;
- plaintext OTP persistence/logging/API exposure;
- backend reducer/store/ViewModel ownership;
- weakening security, architecture or test gates.

---

## 2. Canonical SDUI hierarchy

Partner Auth screens use exactly:

```text
Screen
  → Template
      → Component
          → Element
```

or:

```text
Screen
  → Template
      → Component
          → Section
              → Element
```

or:

```text
Screen
  → Template
      → Component
          → Section
              → Group
                  → Element
```

Rules:

```text
Screen owns exactly one Template.
Template owns one or more Components.
Component owns Elements XOR Sections.
Section owns Elements XOR Groups.
Group owns Elements only.
Element is terminal.
```

---

## 3. Current SDUI authoring rule

Partner Login and OTP use the engine-wide scoped setter DSL.

Type-specific creation examples:

```ts
$.stackTemplate('tpl_7K2M9Q', $ => { ... });
$.formTemplate('tpl_P6X8N3', $ => { ... });
$.stackComponent('otp_content', $ => { ... });
$.stackSection('otp_action_section', $ => { ... });
$.rowGroup('otp_fields_group', $ => { ... });
$.inputElement('otp_code_input', $ => { ... });
$.buttonElement('otp_verify_button', $ => { ... });
```

`$` always means the current node.

Properties are authored directly:

```ts
$.setText(...)
 .setSpacing(...)
 .setPadding(...)
 .setLeading(...)
 .setTrailing(...)
 .setBinding(...)
 .setEnabled(...)
 .setOnClick(...);
```

NodeDefinitions remain the authority for exact property schemas, defaults and legal capabilities.

The authoring DSL does not change the canonical wire JSON.

---

## 4. Canonical SDUI reference vocabulary

Wire forms:

```text
$binding
$context
$response
$literal
```

Authoring:

```text
ref.binding(...)
ref.context(...)
ref.response(...)
ref.literal(...)
```

No additional reference namespace is part of this contract.

---

## 5. Canonical Destination and identity semantics

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

Concrete Template/Component/Section/Group/Element IDs are unique instance identities. Reuse belongs to generic node `type`, properties/actions and composition patterns.

---

## 6. Canonical Partner Auth flow

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

---

## 7. Login request — frozen

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

Authoring:

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

## 8. Send OTP destination — frozen

```text
screenId       = partner_otp
templateId     = tpl_P6X8N3
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

This opaque template ID is the only current Partner OTP template identity in the active contract.

Navigation is Destination-based.

---

## 9. OTP screen + Verify request — frozen

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

The screen uses the generic engine action/reference model only.

---

## 10. Resend OTP + cooldown boundary — frozen

Redis/backend policy remains authoritative for whether another OTP request is allowed. Frontend UX state never bypasses server rate/cooldown enforcement.

The screen does not render a visible countdown.

```text
COOLDOWN
  Resend OTP visible
  disabled / grey
  hidden timer runs in frontend/runtime

READY
  Resend OTP visible
  enabled / clickable
```

The initial successful Send OTP starts the hidden cooldown.

A READY tap calls:

```text
POST /api/v1/partner/auth/send_otp
```

using the active phone number and device ID.

On click:

```text
1. disable Resend immediately
2. execute Send OTP
3. on success retain newest challengeId/response
4. restart hidden cooldown
5. enable when cooldown completes
6. on failure expose request error and restore retryable state subject to backend policy
```

`expiresInSeconds` is OTP/challenge validity.

If resend cooldown is backend-configurable it is represented independently, for example:

```text
resendAfterSeconds
```

---

## 11. Verify OTP security order — permanent

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

SDUI changes must not modify this ordering.

---

## 12. Redis OTP persistence — permanent

Production persistence:

```text
Identity IOtpChallengeRepository
        ↑
RedisOtpChallengeRepository
        ↑
shared singleton redisClient
```

Required:

- one root Redis client;
- cache and OTP adapter use shared infrastructure;
- OTP hash only;
- resend cooldown;
- bounded rate limit;
- atomic create/rate-limit;
- atomic failed-attempt update;
- atomic exactly-once consume;
- provider failure invalidates challenge;
- no production memory fallback;
- no Prisma OTP fallback;
- no OTP dual write.

Test-only deterministic in-memory composition is allowed only at executable test boundaries.

---

## 13. Dashboard destination — frozen

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

The Dashboard screen document must conform to canonical engine contracts and validation.

---

## 14. SESSION error semantics — frozen

Missing/invalid credentials for SESSION routes produce safe canonical auth responses:

```text
401 UNAUTHORIZED
403 FORBIDDEN
```

Transport-owned JWT/auth failures never become 500 responses and never expose internal credential/plugin detail.

---

## 15. Frontend transient auth-flow state

After successful Send OTP and before OTP destination execution:

```text
authFlow.phoneNumber = resolved Send OTP request phoneNumber
latestSuccessfulSendOtpResponse = successful Send OTP response envelope
activeChallengeId = latest successful Send OTP challengeId
resendEnabled = false
hidden resend cooldown = running
```

After every successful resend, the newest successful challenge replaces the previous active challenge.

Clear state on successful Verify OTP, abandoned flow, logout/reset or new auth flow.

OTP plaintext never becomes reusable persistent application state.

---

## 16. Canonical property/default boundary

Partner Auth screen source follows the same direct setter model as every engine screen:

```text
NodeDefinition.defaults
        +
explicit set<Property>() overrides/additions
        ↓
deterministic merge
        ↓
strict property validation
        ↓
canonical serialized properties
```

Screen composers specify only intentional overrides and instance-specific values.

Generic rich text/inline spans belong to the reusable `text` element contract. Generic enabled/disabled presentation belongs to reusable behavior/state contracts. Neither becomes Partner-specific.

---

## 17. Required verification

Focused proof must include:

```text
guest Bootstrap → Login
Login → Send OTP
Send OTP → OTP Destination tpl_P6X8N3
OTP screen identity + hierarchy
Verify OTP → Dashboard Destination
unauthenticated Dashboard fetch → 401
successful authenticated Dashboard fetch → 200
```

Security proof must include:

- OTP hash-at-rest;
- expiry;
- attempt limits;
- phone/device binding;
- resend rate/cooldown policy;
- atomic one-time consume;
- replay rejection;
- concurrent verify fail-closed;
- no user/session/token creation before successful consume;
- Redis-only production OTP persistence.

SDUI proof must include:

- legal hierarchy/XOR rules;
- unique concrete IDs;
- correct type-specific creation serialization;
- direct setter isolation;
- canonical action/reference serialization;
- no duplicate screen-composition owner.

---

## 18. Frozen final statement

> **Partner Auth security remains Identity-owned and Redis-backed, while Partner Login/OTP presentation remains exclusively SDUI-engine-owned. Login and OTP use the canonical Screen → Template → Component → optional Section → optional Group → Element hierarchy, type-specific creation methods, `$` as the current lexical node and direct `set<Property>()` configuration. The authoring syntax never changes OTP security ordering, Redis persistence, Destination identity, generic action/reference behavior or canonical wire JSON.**
