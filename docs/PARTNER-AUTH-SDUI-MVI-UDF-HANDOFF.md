# Partner Auth + SDUI Backend → Frontend MVI/UDF Handoff

> **Status:** FROZEN INTEGRATION CONTRACT — synchronized with the final single-engine SDUI architecture and final Partner OTP UX.
>
> This document defines the backend/frontend boundary only. It does not prescribe frontend class names and does not move reducer, Store, ViewModel, navigation-state or rendering ownership into the backend.

Canonical related documents:

- `sdui/README.md`
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
- previous/latest successful action-response context where required;
- generic SDUI action execution;
- navigation/back-stack effects;
- local semantic state overlays;
- hidden resend cooldown execution;
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

Concrete Template/Component/Section/Group/Element IDs are unique instance identities. Reusable UI behavior comes from node `type`, generic properties, generic actions and composition patterns; IDs are not a reuse mechanism.

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

No OTP-specific action type such as `resendOtp`, `startOtpTimer` or `verifyOtpAction` is permitted.

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

Successful Send OTP data includes at minimum:

```text
message
challengeId
expiresInSeconds
isNewUser
nextScreen
```

A dedicated resend cooldown value such as `resendAfterSeconds` may be supplied by the backend/configuration; it is distinct from OTP validity and must never be inferred from `expiresInSeconds`.

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

## 10. Transient auth-flow state before and during OTP

After successful Send OTP and before destination execution, retain:

```text
authFlow.phoneNumber = resolved request body phoneNumber
latestSuccessfulSendOtpResponse = complete successful Send OTP response envelope
activeChallengeId = latest successful Send OTP challengeId
resendEnabled = false
hidden resend cooldown = running
```

This enables OTP references:

```text
challengeId ← latest successful challenge (response/runtime auth-flow context)
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

On every successful resend, replace the previous active challenge with the newest successful Send OTP challenge.

Clear transient auth-flow state after successful Verify OTP, abandoned auth flow, logout/reset or start of a new authentication flow.

OTP plaintext must not be retained as reusable persistent application state.

---

## 11. OTP screen + aggregate OTP binding

Frozen loaded OTP identity:

```text
screenId      = partner_otp
template.id   = tpl_P6X8N3
template.type = form_template
targetApp     = PARTNER
```

The OTP screen follows the Login composition pattern: the first stack component contains logo, CarBroz, PARTNER with leading/trailing dividers, tagline, screen title/subtitle and the OTP-only phone/edit row. The second stack component owns OTP input and actions. Every concrete OTP node ID is unique and does not reuse a Login node ID.

Six visual OTP cells represent one logical six-digit value with binding key:

```text
otp
```

The request-facing value resolves as:

```text
{ $binding: "otp" }
```

The backend may express six cells through an existing generic hierarchy or an approved generic repeat/count capability, but no OTP-specific renderer/action contract is allowed.

---

## 12. OTP → Verify OTP

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
  "challengeId": "<latest successful challenge uuid>",
  "phoneNumber": "<phone>",
  "otp": "<six digits>",
  "deviceId": "<stable client device id>"
}
```

Optional device metadata may be added through approved generic context references when the runtime supplies it.

Verify OTP success contains credentials/user data plus the authenticated Dashboard Destination.

A local session must never be synthesized before backend verification succeeds.

---

## 13. Resend OTP + hidden cooldown

The frozen UX has **no visible countdown**.

User-visible states:

```text
COOLDOWN
  `Resend OTP` remains visible
  disabled / grey
  not clickable
  timer runs internally only

READY
  `Resend OTP` remains visible
  enabled / active styling
  clickable
```

Initial successful Login → Send OTP starts the hidden cooldown, so the OTP screen initially renders Resend as disabled/grey.

When the hidden cooldown finishes, frontend semantic state changes `enabled` to true.

When READY and the user taps Resend:

```text
1. immediately set Resend disabled to prevent duplicate taps
2. POST /api/v1/partner/auth/send_otp
3. resolve phoneNumber + deviceId through generic context/reference behavior
4. on success, retain the newest challengeId/response
5. restart the hidden cooldown and keep Resend disabled
6. when cooldown completes, enable Resend
7. on request failure, reduce/expose the error and restore an appropriate retryable READY state unless backend policy forbids retry
```

The resend timer is a frontend/runtime transient timing concern. Any supporting state/timer mechanism must stay generic and reusable; it must not add a Partner/OTP-specific action type or screen-name branch.

`expiresInSeconds` is challenge validity, not resend cooldown.

---

## 14. `responseMode: destination`

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

## 15. Independent navigation

`navigate` is used when navigation does not depend on a preceding business mutation.

The runtime follows the supplied Destination, fetches the screen and verifies identity exactly as above.

---

## 16. Present / dismiss

Generic presentation modes:

```text
dialog
bottom_sheet
popup
```

`present` opens a target presentation. `dismiss` closes the active or target presentation.

Presentation actions must not require product-specific frontend branches.

---

## 17. Semantic local state

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

The OTP Resend control uses the generic semantic `enabled` state; grey/active styling is derived from the generic enabled/disabled presentation contract, not from an OTP-specific state property.

---

## 18. Rich text / legal inline actions

Partner Login and OTP require a generic text capability for inline styled/actionable spans/runs.

Required cases include:

```text
Welcome Partner!   → accent only the intended span
Verify Your Number → accent only `Your`
Terms & Conditions → independently actionable
Privacy Policy     → independently actionable
```

Inline actions use the generic action vocabulary such as `external_uri`. No Partner-auth-specific text primitive is introduced.

---

## 19. External URI

External URI actions must use platform/security allow-list policy before opening the destination.

The backend does not bypass platform security by sending an URI action.

---

## 20. Sequence

Execute children in declared order only where ordered generic actions are genuinely required.

Do not use Sequence to model request-success-dependent navigation.

---

## 21. Authenticated Dashboard retrieval

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

## 22. MVI/UDF mapping

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

## 23. Credential handling

- Access token is sent as `Authorization: Bearer <token>` for SESSION destinations.
- Refresh token is sensitive client credential material and belongs in secure storage.
- Never log OTP, OTP hash, access token or refresh token.
- Replay/concurrent losing OTP verification remains an auth failure.

---

## 24. Error handling

Map typed backend error `code` and preserve `traceId` for safe diagnostics.

Frontend timers/retry UI may reflect backend cooldown/rate behavior but must never bypass backend authority.

---

## 25. Contract parity rules

Must remain true:

```text
SendOtp.nextScreen == Partner OTP screen identity (tpl_P6X8N3)
VerifyOtp.nextScreen == authenticated Bootstrap destination
VerifyOtp.nextScreen == Partner Dashboard identity
```

Legacy `{ template, api }` navigation is forbidden.

---

## 26. Change-management rule

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
