# Partner Authentication SDUI Contract Addendum

> **Status:** FROZEN BEHAVIOR CONTRACT — synchronized with the final single-engine SDUI architecture.
>
> **Architecture authority:** `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
>
> **Interaction authority:** `sdui/engine/src/core/Action.ts` and the canonical engine action/reference tests.
>
> **Security authority:** `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md` plus the backend constitutions.
>
> This document freezes Partner Bootstrap → Login → OTP → authenticated Dashboard behavior. The implementation location of screen composition is being migrated into `sdui/engine`; wire behavior below must remain unchanged.

---

## 1. Ownership boundary

Frozen final ownership:

```text
Identity domain
  → authentication/business rules
  → OTP challenge lifecycle
  → user/session/credential creation

SDUI Engine
  → Login / OTP / Dashboard presentation composition
  → generic node/action/reference contracts
  → property defaults/overrides
  → screen resolution + validation

API surface
  → HTTP routes, request adaptation, response serialization

Frontend runtime
  → bindings/context/response resolution
  → generic action execution
  → transient auth-flow state
  → destination verification + rendering
```

Domains and API surfaces must not become parallel screen-composition owners after migration.

---

## 2. Loaded screen and Destination identity

Loaded screen owns:

```text
screen.screenId
screen.schemaVersion
screen.targetApp
screen.template.id
screen.template.type
```

Destination owns:

```text
screenId
templateId
templateType
endpoint
method
authentication
```

After fetch:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

Root-level `templateId` and `templateType` are not part of a loaded screen.

---

## 3. Generic action/reference contract

Partner Auth uses only generic actions and references.

References:

```text
$binding
$context
$response
$literal
```

Authoring direction:

```ts
ref.binding(...)
ref.context(...)
ref.response(...)
ref.literal(...)
```

Partner-specific action types are forbidden.

For request actions with `responseMode: destination`:

```text
validate
→ resolve references
→ request
→ failure: expose/reduce error, no navigation
→ success: retain required transient response/context
→ validate destination
→ satisfy authentication requirement
→ fetch destination
→ verify loaded-screen identity
→ navigate/render
```

---

## 4. Partner Login — frozen wire contract

```text
screenId      = partner_login
template.id   = tpl_7K2M9Q
template.type = stack_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_login
```

Continue action:

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

The Login screen is the Golden Reference for the new fluent SDUI DSL.

Its implementation will live at:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
```

The migration must preserve deep-equal canonical output. Any old API/domain Login screen builder becomes compatibility-only and is deleted only after zero production references are proven.

---

## 5. Send OTP destination — frozen

Successful Send OTP returns:

```text
screenId       = partner_otp
templateId     = tpl_partner_otp_v1
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

Legacy navigation shapes such as `{ template, api }` are forbidden.

OTP plaintext/hash is never returned.

---

## 6. Partner OTP screen — frozen wire contract

```text
screenId      = partner_otp
template.id   = tpl_partner_otp_v1
template.type = form_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_otp
```

Final implementation owner:

```text
sdui/engine/src/screens/partner/PartnerOtpScreen.ts
```

OTP must use the same generic fluent hierarchy/property/action model as Login. No OTP-specific builder or action language is allowed.

Verify action:

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Canonical body references:

```text
challengeId ← { $response: "data.challengeId" }
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

Authoring equivalent:

```text
challengeId ← ref.response('data.challengeId')
phoneNumber ← ref.context('authFlow.phoneNumber')
otp         ← ref.binding('otp')
deviceId    ← ref.context('deviceId')
```

---

## 7. Transient auth-flow state

After successful Send OTP and before OTP navigation the frontend runtime retains:

```text
authFlow.phoneNumber = resolved submitted phone number
lastSuccessfulResponse = complete successful Send OTP response
```

This state exists only to resolve generic references required by the next screen.

Clear it after:

- successful Verify OTP;
- explicit cancellation/back that abandons auth;
- logout/reset;
- a new authentication flow.

OTP plaintext must not become reusable persistent application state.

---

## 8. Verify OTP security behavior — frozen

Security order:

```text
load bound challenge
→ validate lifecycle / phone / device / attempt state
→ verify secret hash
→ atomically consume one-time challenge
→ only then user/session creation
→ only then refresh/access credential issuance
→ authenticated destination
```

Concurrent/replay verification is fail-closed: at most one consume succeeds.

No SDUI refactor may alter this ordering.

---

## 9. Redis OTP persistence — permanent

Production OTP persistence remains:

```text
Identity IOtpChallengeRepository
        ↑
RedisOtpChallengeRepository
        ↑
shared singleton redisClient
```

Forbidden:

```text
Prisma production OTP model/table
production in-memory fallback
dual write
OTP plaintext persistence/response
screen-owned OTP storage
```

Test-only deterministic persistence is allowed only at executable test composition boundaries.

---

## 10. Authenticated Partner Dashboard — frozen destination

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

Runtime retrieval:

```http
GET /api/v1/partner/sdui/registry/partner_dashboard
Authorization: Bearer <access token>
```

The existing published registry document remains required during lifecycle convergence.

The final dynamic composition owner for code-authored Dashboard presentation must converge under:

```text
sdui/engine/src/screens/partner/PartnerDashboardScreen.ts
```

If production retrieval continues through the persisted registry route, that registry lifecycle consumes canonical engine contracts; it does not become a second screen language.

Authenticated Bootstrap and Verify OTP must continue to return the same Dashboard Destination.

---

## 11. Fluent property architecture for Partner Auth screens

Partner Login and OTP must use the frozen five property categories where legal:

```text
base/default
style
content/instance
behavior
metadata/semantic
```

Rules:

- node-definition defaults are emitted automatically;
- screen composers do not repeat defaults;
- allowed defaults may be overridden per node instance;
- non-default properties appear only when explicitly supplied;
- unknown properties are rejected;
- one screen's override must never mutate another screen or global defaults.

Login and OTP must not introduce screen-specific reusable primitives merely to avoid configuration.

---

## 12. Generic event/action usage

Elements may bind generic events such as:

```text
onClick
onLongClick
onValueChange
onFocus
onBlur
```

Partner Auth currently requires request actions primarily through `onClick`.

Future auth UI interactions must reuse generic action vocabulary:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

No Partner Auth feature-specific action type may be added without changing the generic SDUI protocol first.

---

## 13. SESSION error semantics

SESSION-protected screen fetches must never convert missing/invalid bearer credentials into 500 responses.

Transport-owned auth failures remain safe:

```text
401 UNAUTHORIZED
403 FORBIDDEN
```

No internal credential/plugin detail leakage.

---

## 14. Full-flow proof required after migration

The executable flow must still prove:

```text
guest Bootstrap
→ Login Screen
→ Send OTP
→ OTP Destination
→ OTP Screen
→ Verify OTP
→ credentials
→ unauthenticated Dashboard request rejected
→ authenticated Dashboard loaded
→ authenticated Bootstrap destination parity
```

Additionally the SDUI migration must prove:

```text
Login old canonical output == Login new engine output
OTP expected canonical output == OTP new engine output
Destination identities unchanged
Auth endpoint payloads unchanged
Redis-only OTP persistence unchanged
```

---

## 15. Screen registration rule

Partner screens are explicitly registered once in the engine, conceptually:

```ts
export const partnerScreens = [
  new PartnerLoginScreen(),
  new PartnerOtpScreen(),
  new PartnerDashboardScreen(),
];
```

Adding a new Partner screen should mean:

```text
create screen composer
+ register once
+ done
```

No API switch statement, domain registration, second builder factory or screen-name-specific runtime handler should be required.

---

## 16. Final freeze rule

This behavior contract remains frozen while internal SDUI composition is migrated.

If a future implementation change modifies any of the following, the corresponding contract must be explicitly reopened before code changes:

- screen/template identity;
- auth endpoint/method/authentication;
- request body mapping;
- Destination shape;
- reference meaning;
- responseMode behavior;
- OTP persistence/security ordering;
- SESSION semantics;
- Dashboard destination identity.

Architecture improvements are allowed only when these external behaviors remain exactly compatible or are deliberately versioned.
