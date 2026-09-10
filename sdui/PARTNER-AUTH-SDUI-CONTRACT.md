# Partner Authentication SDUI Contract Addendum

> **Status:** FROZEN BEHAVIOR CONTRACT — synchronized with the final single-engine SDUI architecture.
>
> **Architecture authority:** `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
>
> **Interaction authority:** `sdui/engine/src/core/Action.ts` and the canonical engine action/reference tests.
>
> **Security authority:** `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md` plus the backend constitutions.
>
> This document freezes Partner Bootstrap → Login → OTP → authenticated Dashboard behavior and the final Login/OTP composition rules. Screen composition belongs only to `sdui/engine`.

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
  → timer/countdown execution for generic UI state
  → destination verification + rendering
```

Domains and API surfaces must not become parallel screen-composition owners.

---

## 2. Loaded screen, Destination identity, and node identity

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

### 2.1 Frozen unique-ID rule

`id` and `type` have different responsibilities.

```text
id   = unique identity of one concrete node instance
type = reusable rendering/composition definition
```

Every concrete node ID is unique. Similar UI between screens reuses the same `type` and composition pattern, never the same node `id`.

This applies to every hierarchy level:

```text
Template ID  → unique
Component ID → unique
Section ID   → unique
Group ID     → unique
Element ID   → unique
```

Opaque stable template IDs are required for Partner Auth screens. Template IDs must not encode screen/business names such as `tpl_partner_otp_v1`.

Frozen Partner template identities:

```text
Partner Login template.id = tpl_7K2M9Q
Partner OTP   template.id = tpl_P6X8N3
```

Once published/frozen, these IDs are stable unless the contract is deliberately versioned.

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

Frozen generic action vocabulary remains:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

Request-dependent navigation uses `request` with `responseMode = destination`; it must not be represented as `sequence(request, navigate)`.

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

No OTP-specific `resendOtp`, `startOtpTimer`, `verifyOtpAction`, or equivalent action type may be introduced.

---

## 4. Partner Login — frozen golden reference

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

The Login screen is the Golden Reference for Partner OTP composition. OTP should reuse Login's existing reusable node types, property model, theme default, brand/header composition pattern, action/reference vocabulary and binding model. Similarity never implies ID reuse; every OTP node receives its own unique ID.

Current Login composition pattern:

```text
Template
├── stack_component: brand/header content
│   ├── image: logo
│   ├── text: CarBroz
│   ├── text: PARTNER with leading/trailing horizontal dividers
│   ├── text: Premium Car Care At Your Doorstep
│   ├── text: screen title
│   └── text: screen subtitle
├── stack_component: login interaction content
│   ├── stack_section / stack_group: mobile input
│   └── stack_section: Continue + legal text
└── stack_component: hero image
```

The Login screen remains owned by:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
```

---

## 5. Send OTP destination — frozen

Successful Send OTP returns:

```text
screenId       = partner_otp
templateId     = tpl_P6X8N3
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

Legacy navigation shapes such as `{ template, api }` are forbidden.

OTP plaintext/hash is never returned.

The Send OTP response remains the source of the active challenge identity. A resend is another invocation of the same Send OTP business capability and may return a new challenge ID; the frontend/runtime must retain the latest successful challenge for subsequent verification.

---

## 6. Partner OTP screen — frozen final composition

```text
screenId      = partner_otp
template.id   = tpl_P6X8N3
template.type = form_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_otp
```

Final implementation owner:

```text
sdui/engine/src/screens/partner/PartnerOtpScreen.ts
```

OTP uses the same generic fluent hierarchy/property/action model as Login. No OTP-specific builder, node hierarchy, action language, theme abstraction or parallel renderer contract is allowed.

### 6.1 Frozen visual/composition reference

The approved OTP UI reference is the Partner OTP design supplied during the freeze discussion. The existing Partner Login JSON is the structural reference for common content.

OTP should use two primary components because the OTP design has no Login hero-car component:

```text
Template: form_template / tpl_P6X8N3
│
├── Component [unique ID], type = stack_component
│   ├── logo image
│   ├── CarBroz text
│   ├── PARTNER text
│   │   ├── leading horizontal divider
│   │   └── trailing horizontal divider
│   ├── Premium Car Care At Your Doorstep text
│   ├── Verify Your Number title
│   ├── We have sent a 6-digit code to subtitle
│   └── phone-number text + trailing edit icon
│
└── Component [unique ID], type = stack_component
    ├── Section [unique ID], type = stack_section
    │   └── Group [unique ID], type = stack_group, horizontal
    │       └── OTP digit input repeated/configured for 6 digits
    │
    └── Section [unique ID], type = stack_section
        ├── Resend OTP text/control
        ├── Verify & Continue button
        └── legal text
```

The first OTP component intentionally mirrors the Login brand/header component. It is not split into a separate `verification_content` component merely because its title/subtitle data differs.

### 6.2 Shared vs different Login/OTP data

Common visual structure:

```text
Login                               OTP
-----                               ---
logo                                logo
CarBroz                             CarBroz
PARTNER + leading/trailing lines    PARTNER + leading/trailing lines
tagline                             tagline
Welcome Partner!                    Verify Your Number
Login to continue your journey      We have sent a 6-digit code to
```

OTP adds one row after the subtitle:

```text
+91 <submitted phone number>   [trailing edit icon]
```

The phone number is runtime data from the active auth flow; it must not be hardcoded into the screen definition.

---

## 7. OTP binding and verification contract

OTP input follows the same binding principle already used by the Login phone input:

```text
UI input → binding → request action reference
```

The six visual OTP cells represent one logical OTP value. The canonical logical binding key is:

```text
otp
```

The implementation may render six single-character cells through the existing generic hierarchy or a generic repeat/count capability, but it must not create an OTP-specific renderer/action language. The serialized/request-facing value is one six-digit string resolved by:

```text
{ "$binding": "otp" }
```

Validation remains:

```text
required = true
pattern  = ^[0-9]{6}$
```

Verify action:

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Canonical body references:

```text
challengeId ← latest successful Send OTP challenge
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

The challenge reference may resolve from the latest successful response/runtime auth-flow context according to the generic reference implementation, but verification must always use the newest successful Send OTP challenge after a resend.

---

## 8. Resend OTP + hidden cooldown — frozen UX behavior

The approved UX does **not** display a visible countdown such as `Resend OTP in 00:25`.

There are only two user-visible states:

```text
COOLDOWN
  Resend OTP is visible but greyed/disabled and not clickable.
  Cooldown timer runs internally and is not displayed.

READY
  Resend OTP is enabled/clickable and styled as the active action.
```

### 8.1 Initial OTP arrival

A successful Login → Send OTP request starts the resend cooldown for the OTP screen.

When the OTP screen first appears:

```text
Resend OTP = disabled/grey
internal cooldown = running
```

When the cooldown completes:

```text
Resend OTP = enabled/clickable
```

### 8.2 Resend click

When READY and the user taps Resend OTP:

```text
1. disable/grey Resend immediately for duplicate-tap protection
2. POST /api/v1/partner/auth/send_otp
3. body uses the active phoneNumber + deviceId through generic references
4. on success:
   - retain the newest successful challengeId/response
   - keep Resend disabled
   - restart the hidden cooldown
5. when hidden cooldown completes:
   - enable Resend OTP again
6. on request failure:
   - expose/reduce the request error
   - restore Resend to an appropriate retryable READY state unless backend policy says otherwise
```

The cooldown must never be represented by an OTP-specific action type. Any runtime timer/state capability added to support this must be generic and reusable for other screens/features.

A visible countdown is explicitly outside this frozen UX unless the contract is reopened.

### 8.3 Cooldown source

OTP expiry and resend cooldown are different concepts:

```text
expiresInSeconds     = challenge/OTP validity
resendAfterSeconds   = resend eligibility cooldown
```

Do not derive resend cooldown from `expiresInSeconds`.

If resend cooldown is backend-configurable, the Send OTP response should expose a dedicated generic value such as `resendAfterSeconds`; otherwise the runtime uses the separately frozen product cooldown configuration. The frontend must not treat OTP validity as resend eligibility.

---

## 9. Rich text / inline span requirement

Partner Login and OTP designs require partial styling and independently clickable inline text without splitting every phrase into unrelated layout nodes.

The generic `text` element may therefore support reusable inline spans/runs. This is a generic text capability, not a Partner Auth primitive.

Required use cases include:

```text
Welcome Partner!       → `Partner!` may have accent styling
Verify Your Number     → `Your` may have accent styling
Terms & Conditions     → independently clickable
Privacy Policy         → independently clickable
```

Inline spans may carry legal text styling and generic actions such as `external_uri`. They must not introduce Partner-specific action types.

The existing Login legal sentence currently renders as one plain text value. When generic span support is implemented, Login and OTP should both use the same reusable text capability for Terms & Conditions and Privacy Policy rather than screen-specific workarounds.

---

## 10. Transient auth-flow state

After successful Send OTP and before OTP navigation the frontend runtime retains at minimum:

```text
authFlow.phoneNumber = resolved submitted phone number
latest successful Send OTP response/challenge = active challenge
resend eligibility/cooldown state = transient UI state
```

After each successful resend, the previous challenge reference is replaced by the newest successful challenge.

Clear auth-flow transient state after:

- successful Verify OTP;
- explicit cancellation/back that abandons auth;
- logout/reset;
- a new authentication flow.

OTP plaintext must not become reusable persistent application state.

---

## 11. Verify OTP security behavior — frozen

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

## 12. Redis OTP persistence — permanent

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

## 13. Authenticated Partner Dashboard — frozen destination

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

Authenticated Bootstrap and Verify OTP must continue to return the same Dashboard Destination.

---

## 14. Fluent property architecture for Partner Auth screens

Partner Login and OTP use the frozen five property categories where legal:

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
- one screen's override must never mutate another screen or global defaults;
- screen/node IDs are unique instance identities and are never reused as a reuse mechanism;
- reusable UI is expressed through node `type`, generic properties, composition patterns and generic actions.

Login and OTP must not introduce screen-specific reusable primitives merely to avoid configuration.

---

## 15. Generic event/action usage

Elements may bind generic events such as:

```text
onClick
onLongClick
onValueChange
onFocus
onBlur
```

Partner Auth uses only the generic action vocabulary:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

Resend behavior may compose generic request/state/sequence/runtime timer capabilities, but no feature-specific action type is allowed.

---

## 16. SESSION error semantics

SESSION-protected screen fetches must never convert missing/invalid bearer credentials into 500 responses.

Transport-owned auth failures remain safe:

```text
401 UNAUTHORIZED
403 FORBIDDEN
```

No internal credential/plugin detail leakage.

---

## 17. Full-flow and golden proof required

The executable flow must prove:

```text
guest Bootstrap
→ Login Screen
→ Send OTP
→ OTP Destination (tpl_P6X8N3)
→ OTP Screen
→ initial Resend disabled/grey
→ hidden cooldown enables Resend
→ Resend calls Send OTP again
→ newest challenge retained
→ hidden cooldown restarts
→ six-digit OTP binding resolves as one value
→ Verify OTP
→ credentials
→ unauthenticated Dashboard request rejected
→ authenticated Dashboard loaded
→ authenticated Bootstrap destination parity
```

SDUI regression/golden coverage must additionally prove:

```text
Login remains the structural golden reference
OTP expected canonical output == OTP engine output
all OTP concrete node IDs are unique
OTP IDs do not reuse Login IDs
opaque OTP template identity is stable
PARTNER label uses leading + trailing horizontal dividers
OTP aggregate binding key = otp
Verify request uses $binding otp
Resend uses the same Send OTP endpoint/business capability
Resend is disabled during hidden cooldown
Resend re-enables only after cooldown completion
resend success replaces active challenge with newest challenge
no visible countdown is emitted
rich text/span capability remains generic
legal inline actions remain generic
Destination identities match loaded screens
Redis-only OTP persistence/security remains unchanged
```

---

## 18. Screen registration rule

Partner screens are explicitly registered once in the engine, conceptually:

```ts
export const partnerScreens = [
  new PartnerLoginScreen(),
  new PartnerOtpScreen(),
  new PartnerDashboardScreen(),
];
```

Adding a new Partner screen means:

```text
create screen composer
+ register once
+ done
```

No API switch statement, domain registration, second builder factory or screen-name-specific runtime handler is required.

---

## 19. Final freeze rule

This contract is the current frozen Partner Auth SDUI behavior authority.

If a future implementation change modifies any of the following, this contract must be explicitly reopened before code changes:

- screen/template identity;
- unique-ID semantics;
- auth endpoint/method/authentication;
- request body mapping;
- Destination shape;
- reference meaning;
- responseMode behavior;
- OTP input/binding semantics;
- Resend visible/disabled/cooldown behavior;
- active challenge replacement after resend;
- rich text/legal inline behavior;
- OTP persistence/security ordering;
- SESSION semantics;
- Dashboard destination identity.

Architecture improvements are allowed only when these external behaviors remain compatible or are deliberately versioned.
