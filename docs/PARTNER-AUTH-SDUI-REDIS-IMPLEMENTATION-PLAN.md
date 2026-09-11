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

## 1. Ownership

```text
Identity
  -> OTP/session/token business policy
  -> IOtpChallengeRepository

platform/integrations
  -> Redis OTP adapter
  -> shared Redis client infrastructure

sdui/engine
  -> canonical hierarchy
  -> NodeDefinitions/defaults
  -> scoped setter DSL
  -> generic actions/references
  -> Partner Login/OTP/Dashboard screen composition
  -> screen registry/service/validation

sdui/registry
  -> persisted publication/version lifecycle only where required

apps/api
  -> Fastify transport/adaptation only

frontend runtime
  -> binding/context/response resolution
  -> generic action execution
  -> transient auth-flow state
  -> hidden resend cooldown
  -> destination verification/rendering
```

Forbidden:

- second auth stack;
- second SDUI/action/navigation framework;
- Partner-specific generic action types;
- API/domain-owned screen composition;
- second Redis abstraction;
- Prisma or memory production OTP fallback;
- Redis+Prisma OTP dual write;
- plaintext OTP persistence/logging/API exposure;
- weakening security/architecture/test gates.

## 2. Canonical hierarchy

```text
Screen -> Template -> Component -> Element
Screen -> Template -> Component -> Section -> Element
Screen -> Template -> Component -> Section -> Group -> Element
```

Component owns Elements XOR Sections. Section owns Elements XOR Groups. Group owns Elements only. Element is terminal.

## 3. Current SDUI authoring rule

Partner Login/OTP use the registered current vocabulary only:

```ts
$.stackTemplate(...)
$.formTemplate(...)
$.stackComponent(...)
$.stackSection(...)
$.stackGroup(...)
$.textElement(...)
$.imageElement(...)
$.inputElement(...)
$.buttonElement(...)
```

Horizontal rows use:

```ts
$.stackGroup('otp_fields_group', $ =>
  $.setOrientation('horizontal')
   .inputElement('otp_code_input', $ => ...)
)
```

There is no current `row_group` NodeDefinition.

Properties are direct setters:

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

NodeDefinitions own exact property schemas/defaults/capabilities. The authoring DSL does not change canonical wire JSON.

## 4. References

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

## 5. Destination

```text
screenId
templateId
templateType
endpoint
method
authentication = NONE | SESSION
```

Loaded screen/template identity must equal Destination identity.

Concrete node IDs are unique instances; reuse is through generic type/properties/actions/composition.

## 6. Partner Auth flow

```text
GET /api/v1/partner/config/bootstrap
  guest -> partner_login

GET /api/v1/partner/screen/auth_login
  -> Login from SDUI engine

Continue
  -> POST /api/v1/partner/auth/send_otp

Send OTP success
  -> partner_otp Destination

GET /api/v1/partner/screen/auth_otp
  -> OTP from SDUI engine

Verify
  -> POST /api/v1/partner/auth/verify_otp

Verify success
  -> partner_dashboard SESSION Destination

Authenticated Bootstrap
  -> same partner_dashboard Destination
```

## 7. Login request

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

## 8. Send OTP destination

```text
screenId       = partner_otp
templateId     = tpl_P6X8N3
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

`tpl_P6X8N3` is the only current Partner OTP template identity.

## 9. OTP verify

Loaded OTP identity:

```text
screenId      = partner_otp
template.id   = tpl_P6X8N3
template.type = form_template
targetApp     = PARTNER
```

Logical OTP binding:

```text
otp <- { $binding: "otp" }
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
challengeId <- latest successful Send OTP challenge
phoneNumber <- { $context: "authFlow.phoneNumber" }
otp         <- { $binding: "otp" }
deviceId    <- { $context: "deviceId" }
```

## 10. Resend OTP and cooldown

Backend/Redis policy remains authoritative for resend eligibility.

No visible countdown is rendered.

```text
COOLDOWN -> visible, disabled/grey, hidden timer
READY    -> visible, enabled/clickable
```

READY tap uses the same Send OTP capability. UI disables immediately; on success frontend retains the newest challenge and restarts the hidden cooldown.

```text
expiresInSeconds   = OTP/challenge validity
resendAfterSeconds = resend eligibility cooldown
```

Do not derive resend cooldown from expiry.

## 11. Verify OTP security order

```text
load phone/device-bound challenge
-> reject invalid/consumed/expired/max-attempt challenge
-> verify OTP hash
-> record/invalidate failed attempt when required
-> atomic one-time consume
-> only then create/update user/session
-> only then issue credentials
-> return authenticated destination
```

Required invariants:

- exactly-once consume;
- concurrent verify fail-closed;
- replay rejection;
- no user/session/token before successful consume;
- phone/device binding;
- bounded attempts;
- TTL/expiry.

SDUI work must not alter this ordering.

## 12. Redis persistence

Production persistence is exactly:

```text
Identity IOtpChallengeRepository
        ↑
RedisOtpChallengeRepository
        ↑
shared singleton redisClient
```

Required:

- one root Redis client;
- OTP hash only;
- resend cooldown/rate policy;
- atomic create/rate-limit;
- atomic failed-attempt update;
- atomic exactly-once consume;
- provider failure invalidates challenge;
- no production memory fallback;
- no Prisma OTP fallback;
- no dual write.

Test-only deterministic in-memory composition is allowed only at test boundaries.

## 13. Dashboard destination

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

## 14. SESSION errors

Missing/invalid credentials for SESSION routes produce:

```text
401 UNAUTHORIZED
403 FORBIDDEN
```

They do not become 500 responses and do not expose internal auth/plugin detail.

## 15. Transient auth-flow state

After successful Send OTP retain:

```text
authFlow.phoneNumber
latestSuccessfulSendOtpResponse
activeChallengeId = newest successful challenge
resendEnabled = false
hidden resend cooldown = running
```

Clear on successful Verify OTP, abandoned flow, logout/reset or new auth flow. OTP plaintext never becomes persistent application state.

## 16. Defaults/theme boundary

Screen composers specify only values that differ from NodeDefinition defaults.

Every screen starts from `DEFAULT_SDUI_THEME`. Genuine theme differences use scoped `setTheme($ => ...)`. Raw object-style theme authoring is not part of the current frozen composer contract.

## 17. Focused verification

Must prove:

```text
guest Bootstrap -> Login
Login -> Send OTP
Send OTP -> OTP Destination tpl_P6X8N3
OTP screen identity/hierarchy
Verify OTP -> Dashboard Destination
unauthenticated Dashboard fetch -> 401
authenticated Dashboard fetch -> 200
```

Security proof includes hash-at-rest, expiry, attempt limits, phone/device binding, resend policy, atomic consume, replay/concurrency rejection and Redis-only production persistence.

SDUI proof includes legal hierarchy/XOR, unique IDs, real registered typed creation methods, `stack_group + horizontal orientation` where needed, direct setter isolation/chaining, action/reference serialization and one screen-composition owner.

## 18. Frozen final statement

> **Partner Auth security remains Identity-owned and Redis-backed. Partner Login/OTP presentation remains exclusively SDUI-engine-owned. The current authoring DSL mirrors only registered NodeDefinitions; horizontal rows use `stackGroup(...).setOrientation('horizontal')`. The DSL never changes OTP security ordering, Redis persistence, Destination identity, generic action/reference behavior or canonical wire JSON.**
