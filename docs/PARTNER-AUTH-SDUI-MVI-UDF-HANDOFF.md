# Partner Auth + SDUI Backend → Frontend MVI/UDF Handoff

> **Status:** FROZEN INTEGRATION CONTRACT

This document defines the backend/frontend boundary only. Backend SDUI authoring syntax is not a frontend runtime API.

## 1. Ownership boundary

Backend owns:

- request validation;
- authentication/session truth;
- OTP security and Redis persistence;
- canonical response envelopes;
- canonical Destination values;
- canonical SDUI Screen documents;
- generic hierarchy/property/action/reference vocabulary.

Frontend owns:

- MVI/UDF intents and immutable UI state;
- runtime binding/context values;
- retained successful action-response context where required;
- generic SDUI action execution;
- navigation/back-stack effects;
- local semantic state overlays;
- hidden resend cooldown execution;
- destination fetch and identity verification;
- loading/error presentation;
- platform URI/security handling.

## 2. Canonical API envelope

Success:

```json
{
  "status": 200,
  "code": "SUCCESS",
  "message": "...",
  "data": {},
  "traceId": "optional"
}
```

Errors preserve HTTP/body status parity, typed `code`, safe `message`, `data: null` and optional `traceId`.

## 3. Destination

```text
screenId
templateId
templateType
endpoint
method
authentication = NONE | SESSION
```

After fetch:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

The runtime never derives a route from IDs.

## 4. Canonical hierarchy consumed by frontend

```text
Screen -> Template -> Component -> Element
Screen -> Template -> Component -> Section -> Element
Screen -> Template -> Component -> Section -> Group -> Element
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

## 5. Backend authoring vs wire contract

Current backend authoring for a horizontal OTP field uses the registered `stack_group` type plus orientation:

```ts
$.formTemplate('tpl_P6X8N3', $ =>
  $.stackComponent('otp_content', $ =>
    $.stackSection('otp_field_section', $ =>
      $.stackGroup('otp_fields_group', $ =>
        $.setOrientation('horizontal')
         .inputElement('otp_code_input', $ =>
           $.setBinding('otp')
            .setKeyboardType('number')
         )
      )
    )
  )
);
```

The frontend does not execute `$`, builder methods or `set<Property>()`. It receives canonical serialized nodes with `id`, `type`, resolved `properties`, actions/bindings and legal child collections.

## 6. Generic actions

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

No OTP-specific backend action type is permitted.

Actions may bind generic events such as:

```text
onClick
onLongClick
onValueChange
onFocus
onBlur
```

## 7. Generic value references

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

## 8. Resolved properties/defaults

Backend already resolves:

```text
NodeDefinition.defaults
+ explicit screen overrides
+ strict validation
-> canonical serialized properties
```

Frontend must not invent missing backend defaults to repair malformed documents.

## 9. Partner startup

Request:

```text
GET /api/v1/partner/config/bootstrap
x-carbroz-platform: ANDROID | IOS | DESKTOP
x-carbroz-app-version: semantic version
x-carbroz-build-number: non-negative integer
Authorization: Bearer <access token> // only when local session exists
```

Guest Destination:

```text
screenId       = partner_login
templateId     = tpl_7K2M9Q
templateType   = form_template
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

If a bearer token is supplied it must be valid; backend does not silently downgrade invalid auth to guest.

## 10. Login → Send OTP

```text
POST /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

References:

```text
phoneNumber <- { $binding: "mobileNumber" }
deviceId    <- { $context: "deviceId" }
```

Successful response includes at minimum:

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
templateId     = tpl_P6X8N3
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

OTP plaintext/hash is never returned.

## 11. Transient auth-flow state

After successful Send OTP retain:

```text
authFlow.phoneNumber
latestSuccessfulSendOtpResponse
activeChallengeId = latest successful challengeId
resendEnabled = false
hidden resend cooldown = running
```

Every successful resend replaces the active challenge with the newest successful challenge.

Clear state after successful Verify OTP, abandoned auth flow, logout/reset or a new auth flow.

## 12. OTP screen and binding

```text
screenId      = partner_otp
template.id   = tpl_P6X8N3
template.type = form_template
targetApp     = PARTNER
```

Six visual cells represent one logical binding:

```text
otp
```

Request value:

```text
{ $binding: "otp" }
```

The wire Group remains `type = stack_group` with horizontal orientation; no `row_group` runtime type is part of the current contract.

## 13. Verify OTP

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

A local session is never synthesized before backend verification succeeds.

## 14. Resend OTP

No visible countdown.

```text
COOLDOWN -> visible, disabled/grey, timer hidden
READY    -> visible, enabled/clickable
```

On READY tap:

```text
1. disable immediately
2. POST /api/v1/partner/auth/send_otp
3. resolve phoneNumber + deviceId
4. on success retain newest challenge
5. restart hidden cooldown
6. enable when cooldown completes
7. on failure expose/reduce error and restore retryable state where allowed
```

`expiresInSeconds` is OTP validity, not resend cooldown. A separate `resendAfterSeconds` may define cooldown.

## 15. responseMode=destination

```text
validate inputs/bindings
-> resolve references
-> execute request
-> failure: reduce/expose error, do not navigate
-> success: preserve required flow context/response
-> validate Destination
-> satisfy SESSION credential requirement when needed
-> fetch destination
-> verify loaded identity
-> navigate/render
```

Do not execute an independent `navigate` after a request when navigation depends on that request succeeding.

## 16. Semantic local state

Generic state operations are product-neutral and may target semantic values such as:

```text
visible
enabled
selected
expanded
checked
loading
value
```

OTP resend uses generic `enabled` state; the runtime does not structurally mutate the accepted SDUI tree.

## 17. Rich text / external URI

Login/OTP text may use generic styled/actionable spans for titles and legal links. External URI actions remain subject to platform/security allow-list policy.

## 18. Dashboard retrieval

```text
GET /api/v1/partner/sdui/registry/partner_dashboard
Authorization: Bearer <access token>
```

Loaded screen identity must equal Destination identity.

## 19. MVI/UDF mapping

Conceptual flow:

```text
User Intent
-> Store
-> generic rendered SDUI event
-> ActionEngine resolves references
-> generic action handler
-> transport response
-> reducer immutable state
-> retain transient response/context when required
-> Destination effect
-> screen fetch
-> identity verification
-> render immutable screen document
```

Frontend feature semantics such as `ResendOtpRequested` or `VerifyOtpSucceeded` are frontend semantics, not backend SDUI action types.

## 20. Security/error handling

- Access token uses `Authorization: Bearer <token>` for SESSION destinations.
- Refresh token belongs in secure storage.
- Never log OTP, OTP hash, access token or refresh token.
- Replay/concurrent losing OTP verification remains an auth failure.
- Frontend retry/timer UI never bypasses backend authority.

## 21. Contract parity

```text
SendOtp.nextScreen   == Partner OTP identity tpl_P6X8N3
VerifyOtp.nextScreen == authenticated Bootstrap destination
VerifyOtp.nextScreen == Partner Dashboard identity
```

Canonical navigation is Destination-based.

## 22. Change rule

```text
document contract first
-> schema/type compatibility decision
-> backend implementation
-> frontend generic handler support if required
-> contract/integration tests
-> production usage
```
