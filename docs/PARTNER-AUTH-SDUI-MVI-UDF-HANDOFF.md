# Partner Auth + SDUI Backend → Frontend MVI/UDF Handoff

> **Status:** FROZEN INTEGRATION CONTRACT — synchronized with the final single-engine SDUI architecture.
>
> This document defines the backend/frontend boundary only. It does not prescribe frontend class names and does not move reducer, Store, ViewModel, navigation-state or rendering ownership into the backend.

Canonical related documents:

- `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md`
- `sdui/engine/src/core/Action.ts` and canonical engine action/reference tests
- `sdui/PARTNER-AUTH-SDUI-CONTRACT.md`

---

## 1. Ownership boundary

Backend owns:

- request validation;
- authentication/session truth;
- OTP security and Redis persistence;
- canonical response envelopes;
- canonical Destination values;
- canonical SDUI Screen documents;
- generic SDUI node/property/action/reference vocabulary.

Frontend owns:

- MVI intents/actions;
- immutable UI state;
- reducer/store lifecycle;
- one-way state updates;
- runtime binding values;
- approved runtime/context values;
- previous successful action-response context where required;
- generic SDUI action execution;
- navigation/back-stack effects;
- local semantic state overlays;
- destination fetch/identity verification;
- loading/error presentation;
- platform URI/security handling.

The backend must never require a frontend-specific ViewModel, reducer, Store implementation or mutable client-state class.

---

## 2. Canonical API envelope

Successful transport response:

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

---

## 4. Generic action execution model

Backend screen documents use generic event-keyed actions. The frontend dynamic runtime should execute them through generic isolated handlers/strategies, conceptually:

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

Exact class names are not prescribed.

The required behavior is:

- action execution is generic;
- no `partner_login`, `partner_otp`, Booking or other screen-name switch exists in the Action Engine;
- unsupported action types fail according to compatibility policy;
- adding a new generic action type does not modify unrelated existing handlers/screens.

Frozen action vocabulary:

```text
request
navigate
present
dismiss
state
external_uri
sequence
```

---

## 5. Generic event model

Actions may be attached to events such as:

```text
onClick
onLongClick
onValueChange
onFocus
onBlur
```

The frontend executes an event only when the rendered element supports that event according to the compatible SDUI definition/runtime contract.

Product business meaning must not be encoded into event names.

---

## 6. Generic value-reference vocabulary

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

There is no `$form`, `$payload` or `$state` namespace in the current contract.

References are lookups, not executable expressions.

---

## 7. Property/default handling boundary

Backend SDUI documents already contain **resolved canonical properties**.

The backend engine owns:

```text
node definition defaults
+ screen-specific overrides/additions
+ strict validation
→ serialized canonical properties
```

The frontend must not invent missing backend default values in order to make a malformed document renderable.

Property categories used by the backend authoring model are:

```text
base/default
style
content/instance
behavior
metadata/semantic
```

These categories improve backend authoring/type safety; they do not require five separate property objects in the wire JSON unless the canonical wire schema explicitly defines such structure. The frontend consumes the canonical serialized `properties` contract.

---

## 8. Partner startup

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

## 9. Login → Send OTP

Login request action:

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

Successful Send OTP data includes:

```text
message
challengeId
expiresInSeconds
isNewUser
nextScreen
```

`nextScreen`:

```text
screenId       = partner_otp
templateId     = tpl_partner_otp_v1
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

OTP plaintext/hash is never returned.

---

## 10. Transient auth-flow state before OTP

After successful Send OTP and before destination execution, retain:

```text
authFlow.phoneNumber = resolved request body phoneNumber
lastSuccessfulResponse = complete successful Send OTP response envelope
```

This enables OTP references:

```text
challengeId ← { $response: "data.challengeId" }
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

Clear transient auth-flow state after successful Verify OTP, abandoned auth flow, logout/reset or start of a new authentication flow.

OTP plaintext must not be retained as reusable persistent application state.

---

## 11. OTP → Verify OTP

Canonical action:

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Resolved required body:

```json
{
  "challengeId": "<uuid>",
  "phoneNumber": "<phone>",
  "otp": "<six digits>",
  "deviceId": "<stable client device id>"
}
```

Optional device metadata may be added through approved generic context references when the runtime supplies it.

Verify OTP success contains credentials/user data plus the authenticated Dashboard Destination.

A local session must never be synthesized before backend verification succeeds.

---

## 12. `responseMode: destination`

Required runtime sequence:

```text
validate applicable inputs/bindings
→ resolve references
→ execute request
→ failure: reduce/expose error; do not navigate
→ success: preserve required flow state/response
→ validate Destination shape
→ satisfy SESSION credential requirement if needed
→ fetch destination screen
→ verify loaded identity
→ emit navigation/render result
```

Do not execute a separate independent `navigate` action after a request when navigation depends on that request succeeding.

---

## 13. Independent navigation

`navigate` is used when navigation does not depend on a preceding business mutation.

The runtime follows the supplied Destination, fetches the screen and verifies identity exactly as above.

---

## 14. Present / dismiss

Generic presentation modes:

```text
dialog
bottom_sheet
popup
```

`present` opens a target presentation. `dismiss` closes the active or target presentation.

Presentation actions must not require product-specific frontend branches.

---

## 15. Semantic local state

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

The runtime state overlay does not mutate the accepted structural SDUI tree and must not support arbitrary visual-path mutation such as `background.color`.

---

## 16. External URI

External URI actions must use platform/security allow-list policy before opening the destination.

The backend does not bypass platform security by sending an URI action.

---

## 17. Sequence

Execute children in declared order only where ordered generic actions are genuinely required.

Do not use Sequence to model request-success-dependent navigation.

---

## 18. Authenticated Dashboard retrieval

```text
GET /api/v1/partner/sdui/registry/partner_dashboard
Authorization: Bearer <access token>
```

The route is SESSION-protected and Partner-scoped.

Loaded document parity:

```text
loaded.screenId       == destination.screenId
loaded.template.id    == destination.templateId
loaded.template.type  == destination.templateType
```

The registry route remains compatible while backend SDUI ownership converges to the single engine.

---

## 19. MVI/UDF mapping

Recommended semantic flow, without prescribing names:

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

Possible auth semantics:

```text
EnterPhone / SubmitPhone
SendOtpSucceeded
SendOtpFailed
EnterOtp / SubmitOtp
VerifyOtpSucceeded
VerifyOtpFailed
DestinationReceived
ScreenLoaded
ScreenLoadFailed
```

These are frontend feature semantics, not backend SDUI action types.

---

## 20. Credential handling

- Access token is sent as `Authorization: Bearer <token>` for SESSION destinations.
- Refresh token is sensitive client credential material and belongs in secure storage.
- Never log OTP, OTP hash, access token or refresh token.
- Replay/concurrent losing OTP verification remains an auth failure.

---

## 21. Error handling

Map typed backend error `code` and preserve `traceId` for safe diagnostics.

Frontend timers/retry UI may reflect backend cooldown/rate behavior but must never bypass backend authority.

---

## 22. Contract parity rules

Must remain true:

```text
SendOtp.nextScreen == Partner OTP screen identity
VerifyOtp.nextScreen == authenticated Bootstrap destination
VerifyOtp.nextScreen == Partner Dashboard identity
```

Legacy `{ template, api }` navigation is forbidden.

---

## 23. Change-management rule

Future SDUI/runtime changes follow:

```text
document contract first
→ schema/type compatibility decision
→ backend implementation
→ frontend generic handler support if executable
→ contract/integration tests
→ production usage
```

Reuse/extend generic Destination, Screen, action, reference, property and envelope contracts before inventing any new mechanism.
