# Partner Auth + SDUI Backend → Frontend MVI/UDF Handoff

> **Status:** FROZEN INTEGRATION CONTRACT
>
> This document defines the backend/frontend boundary only. It does not prescribe frontend class names and does not move reducer, Store, ViewModel, navigation-state or rendering ownership into the backend.

Canonical related documents:

- `sdui/README.md`
- `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
- `sdui/PARTNER-AUTH-SDUI-CONTRACT.md`
- `sdui/engine/src/core/Action.ts` and canonical engine action/reference tests

---

## 1. Ownership boundary

Backend owns:

- request validation;
- authentication/session truth;
- OTP security and Redis persistence;
- canonical response envelopes;
- canonical Destination values;
- canonical SDUI Screen documents;
- generic SDUI hierarchy/property/action/reference vocabulary.

Frontend owns:

- MVI intents/actions;
- immutable UI state;
- reducer/store lifecycle;
- one-way state updates;
- runtime binding values;
- approved runtime/context values;
- latest successful action-response context where required;
- generic SDUI action execution;
- navigation/back-stack effects;
- local semantic state overlays;
- hidden resend cooldown execution;
- destination fetch/identity verification;
- loading/error presentation;
- platform URI/security handling.

The backend never requires a frontend-specific ViewModel, reducer, Store implementation or mutable client-state class.

---

## 2. Canonical API envelope

Successful response:

```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "...",
  "data": {},
  "traceId": "optional"
}
```

Errors use the same top-level shape with HTTP/body status parity, typed `code`, safe `message`, `data: null` and optional `traceId`.

Frontend logic must not depend on parsing human-readable error messages.

---

## 3. Canonical Destination

```text
screenId
templateId
templateType
endpoint
method
authentication = NONE | SESSION
```

The runtime must not derive a route from `screenId`, `templateId` or `templateType`.

After fetch:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

Mismatch is a safe navigation/render failure.

Concrete Template/Component/Section/Group/Element IDs are unique instance identities. Reusable UI behavior comes from node `type`, canonical properties, generic actions and composition patterns.

---

## 4. Canonical screen hierarchy

Frontend consumes one of the legal canonical branches:

```text
Screen
  → Template
      → Component
          → Element
```

```text
Screen
  → Template
      → Component
          → Section
              → Element
```

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

The backend authoring DSL does not change this wire hierarchy.

---

## 5. Backend authoring vs frontend wire contract

Backend screen composers use the frozen scoped DSL:

```ts
$.formTemplate('tpl_P6X8N3', $ =>
  $.stackComponent('otp_content', $ =>
    $.stackSection('otp_field_section', $ =>
      $.rowGroup('otp_fields_group', $ =>
        $.inputElement('otp_code_input', $ =>
          $.setBinding('otp')
           .setKeyboardType('number')
        )
      )
    )
  )
);
```

This authoring syntax is backend-only.

The frontend receives the canonical serialized JSON with node `id`, `type`, resolved `properties` and legal child collections. It does not execute backend builder methods and does not need to understand `$` or `set<Property>()` syntax.

---

## 6. Generic action execution model

Backend documents use generic event-keyed actions. The frontend executes them through generic isolated handlers/strategies, conceptually:

```text
ActionExecutor
  ├── RequestActionHandler
  ├── NavigateActionHandler
  ├── PresentActionHandler
  ├── DismissActionHandler
  ├── StateActionHandler
  ├── ExternalUriActionHandler
  └── SequenceActionHandler
```

Required behavior:

- action execution is generic;
- no screen-name switch exists in the Action Engine;
- unsupported action types fail according to compatibility policy;
- adding a new generic action type does not modify unrelated handlers/screens.

Frozen vocabulary:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

No OTP-specific backend action type is permitted.

---

## 7. Generic event model

Actions may be attached to events such as:

```text
onClick
onLongClick
onValueChange
onFocus
onBlur
```

Backend authoring uses direct setters such as:

```ts
$.setOnClick(...)
$.setOnLongClick(...)
```

Frontend executes an event only when the rendered element supports it according to the compatible SDUI definition/runtime contract.

Product business meaning must not be encoded into event names.

---

## 8. Generic value-reference vocabulary

Exactly:

```text
{ $binding: "..." }
{ $context: "..." }
{ $response: "..." }
{ $literal: <value> }
```

Semantics:

```text
$binding   current UI binding value
$context   approved runtime/platform/flow context
$response  retained successful action-response context
$literal   explicit literal
```

References are lookups, not executable expressions.

---

## 9. Property/default handling boundary

Backend SDUI documents contain **resolved canonical properties**.

Backend engine owns:

```text
NodeDefinition.defaults
+ explicit set<Property>() overrides/additions
+ strict validation
→ canonical serialized properties
```

Frontend must not invent missing backend defaults to make a malformed document renderable.

Backend internal property organization is not a required frontend wire shape. The frontend consumes only the canonical serialized `properties` contract.

Unknown or invalid properties are rejected by backend validation rather than silently repaired.

---

## 10. Partner startup

Request:

```text
GET /api/v1/partner/config/bootstrap
x-carbroz-platform: ANDROID | IOS | DESKTOP
x-carbroz-app-version: semantic application version
x-carbroz-build-number: non-negative integer
Authorization: Bearer <access token> // only when a local session exists
```

If a bearer token is supplied it must be valid. Backend must not silently downgrade an invalid authenticated client into guest startup.

Guest Destination:

```text
screenId       = partner_login
templateId     = tpl_7K2M9Q
templateType   = stack_template
endpoint       = /api/v1/partner/screen/auth_login
method         = GET
authentication = NONE
```

Authenticated Destination:

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

---

## 11. Login → Send OTP

```text
POST /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Canonical references:

```text
phoneNumber ← { $binding: "mobileNumber" }
deviceId    ← { $context: "deviceId" }
```

Resolved body:

```json
{
  "phoneNumber": "<phone>",
  "deviceId": "<stable client device id>"
}
```

Successful Send OTP data includes at minimum:

```text
message
challengeId
expiresInSeconds
isNewUser
nextScreen
```

A dedicated resend cooldown value such as `resendAfterSeconds` may be supplied by backend/configuration. It is distinct from OTP validity.

`nextScreen`:

```text
screenId       = partner_otp
templateId     = tpl_P6X8N3
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

OTP plaintext/hash is never returned.

---

## 12. Transient auth-flow state before and during OTP

After successful Send OTP retain:

```text
authFlow.phoneNumber = resolved request body phoneNumber
latestSuccessfulSendOtpResponse = successful response envelope
activeChallengeId = latest successful challengeId
resendEnabled = false
hidden resend cooldown = running
```

OTP references:

```text
challengeId ← latest successful challenge
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

Every successful resend replaces the previous active challenge with the newest successful challenge.

Clear transient auth-flow state after successful Verify OTP, abandoned auth flow, logout/reset or a new authentication flow.

OTP plaintext must not be retained as reusable persistent application state.

---

## 13. OTP screen + aggregate OTP binding

Frozen OTP identity:

```text
screenId      = partner_otp
template.id   = tpl_P6X8N3
template.type = form_template
targetApp     = PARTNER
```

The OTP screen uses two primary stack components: brand/header content and OTP interaction content. Every concrete OTP node ID is unique.

Six visual OTP cells represent one logical six-digit value with binding key:

```text
otp
```

Request-facing value:

```text
{ $binding: "otp" }
```

No OTP-specific renderer/action contract is allowed.

---

## 14. OTP → Verify OTP

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Resolved body:

```json
{
  "challengeId": "<latest successful challenge uuid>",
  "phoneNumber": "<phone>",
  "otp": "<six digits>",
  "deviceId": "<stable client device id>"
}
```

Verify OTP success contains credentials/user data plus the authenticated Dashboard Destination.

A local session must never be synthesized before backend verification succeeds.

---

## 15. Resend OTP + hidden cooldown

Frozen UX has no visible countdown.

```text
COOLDOWN
  Resend OTP visible
  disabled / grey
  not clickable
  timer hidden

READY
  Resend OTP visible
  enabled
  clickable
```

Initial successful Login → Send OTP starts the hidden cooldown.

When READY and tapped:

```text
1. disable immediately
2. POST /api/v1/partner/auth/send_otp
3. resolve phoneNumber + deviceId
4. on success retain newest challengeId/response
5. restart hidden cooldown
6. enable when cooldown completes
7. on failure expose/reduce error and restore retryable state where allowed
```

`expiresInSeconds` is challenge validity, not resend cooldown.

---

## 16. `responseMode: destination`

Runtime sequence:

```text
validate applicable inputs/bindings
→ resolve references
→ execute request
→ failure: reduce/expose error; do not navigate
→ success: preserve required flow state/response
→ validate Destination
→ satisfy SESSION credential requirement if needed
→ fetch destination screen
→ verify loaded identity
→ emit navigation/render result
```

Do not execute a separate independent `navigate` action after a request when navigation depends on request success.

---

## 17. Independent navigation

`navigate` is used when navigation does not depend on a preceding business mutation.

Runtime follows the supplied Destination, fetches the screen and verifies identity.

---

## 18. Present / dismiss

Generic presentation modes may include:

```text
dialog
bottom_sheet
popup
```

`present` opens a target presentation. `dismiss` closes the active or target presentation.

---

## 19. Semantic local state

Generic state operations:

```text
set
toggle
```

Allowed semantic properties begin with:

```text
visible
enabled
selected
expanded
checked
loading
value
```

Runtime state overlay does not mutate accepted structural SDUI hierarchy.

OTP Resend uses generic `enabled` state.

---

## 20. Rich text / legal inline actions

Login and OTP require generic styled/actionable spans.

Required cases include:

```text
Welcome Partner!
Verify Your Number
Terms & Conditions
Privacy Policy
```

Inline actions use generic actions such as `external_uri`.

---

## 21. External URI

External URI actions use platform/security allow-list policy before opening a destination.

Backend does not bypass platform security by sending an URI action.

---

## 22. Sequence

Sequence executes children in declared order only where ordered independent generic actions are genuinely required.

Do not use Sequence for request-success-dependent navigation.

---

## 23. Authenticated Dashboard retrieval

```text
GET /api/v1/partner/sdui/registry/partner_dashboard
Authorization: Bearer <access token>
```

Route is SESSION-protected and Partner-scoped.

Loaded parity:

```text
loaded.screenId      == destination.screenId
loaded.template.id   == destination.templateId
loaded.template.type == destination.templateType
```

---

## 24. MVI/UDF mapping

Recommended semantic flow:

```text
User Intent
→ Store accepts intent
→ renderer/runtime emits generic SDUI event
→ ActionEngine resolves references
→ generic handler executes action
→ transport envelope parsed
→ reducer produces immutable state
→ transient context/response retained when required
→ Destination emitted as one-time effect where applicable
→ screen fetched
→ identity validated
→ renderer consumes immutable screen document
```

Possible frontend auth semantics:

```text
EnterPhone / SubmitPhone
SendOtpSucceeded
SendOtpFailed
EnterOtp / SubmitOtp
ResendOtpRequested / ResendOtpSucceeded / ResendOtpFailed
ResendCooldownCompleted
VerifyOtpSucceeded
VerifyOtpFailed
DestinationReceived
ScreenLoaded
ScreenLoadFailed
```

These are frontend feature semantics, not backend SDUI action types.

---

## 25. Credential and error handling

- Access token is sent as `Authorization: Bearer <token>` for SESSION destinations.
- Refresh token belongs in secure storage.
- Never log OTP, OTP hash, access token or refresh token.
- Replay/concurrent losing OTP verification remains an auth failure.
- Map typed backend error `code` and preserve `traceId` for safe diagnostics.
- Frontend timers/retry UI must never bypass backend authority.

---

## 26. Contract parity rules

Must remain true:

```text
SendOtp.nextScreen   == Partner OTP identity tpl_P6X8N3
VerifyOtp.nextScreen == authenticated Bootstrap destination
VerifyOtp.nextScreen == Partner Dashboard identity
```

Canonical navigation is Destination-based and no alternate `{ template, api }` shape is part of this contract.

---

## 27. Change-management rule

Future SDUI/runtime changes follow:

```text
document contract first
→ schema/type compatibility decision
→ backend implementation
→ frontend generic handler support if executable
→ contract/integration tests
→ production usage
```

Reuse/extend generic Destination, Screen, hierarchy, action, reference, property and envelope contracts before introducing any new mechanism.
