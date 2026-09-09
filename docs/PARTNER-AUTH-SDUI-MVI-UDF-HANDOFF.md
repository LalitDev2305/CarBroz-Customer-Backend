# Partner Auth + SDUI Backend → Frontend MVI/UDF Handoff

**Status:** Phase 13 implementation contract

This document is the stable handoff for the Partner frontend. It describes the backend contracts that frontend MVI/UDF consumes; it does not move reducer, Store, ViewModel, navigation-state, or rendering ownership into the backend.

## 1. Ownership boundary

Backend owns:
- request validation;
- authentication/session truth;
- OTP security and persistence;
- canonical response envelopes;
- canonical `Destination` values;
- canonical SDUI Screen documents;
- generic SDUI action/reference vocabulary.

Frontend owns:
- MVI intents/actions;
- immutable UI state;
- reducer/store lifecycle;
- one-way state updates;
- navigation execution after a successful backend destination;
- resolution/retention of runtime values referenced by SDUI actions;
- loading/error presentation.

The backend must never require a frontend-specific ViewModel, reducer, Store implementation, or mutable client state model.

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

Error responses use the same top-level shape with HTTP/body status parity, typed `code`, safe `message`, `data: null`, and optional `traceId`.

Frontend should model the envelope as transport state and map `data` into feature/domain state only after successful validation.

## 3. Canonical Destination contract

All auth/startup navigation uses one six-field destination shape:

```text
screenId
templateId
templateType
endpoint
method = GET
authentication = NONE | SESSION
```

The client must not infer a route from `screenId`, `templateId`, or `templateType`. It follows `endpoint` and validates that the loaded screen identity matches the destination.

## 4. Partner startup

### Request

```text
GET /api/v1/partner/config/bootstrap
x-carbroz-platform: ANDROID | IOS | DESKTOP
x-carbroz-app-version: semantic application version
x-carbroz-build-number: non-negative integer
Authorization: Bearer <access token>   // only when a local session exists
```

If a bearer token is supplied, it must be valid. The backend does not silently downgrade an invalid authenticated client to guest startup.

### Guest startup destination

```text
screenId       = partner_login
templateId     = tpl_7K2M9Q
templateType   = stack_template
endpoint       = /api/v1/partner/screen/auth_login
method         = GET
authentication = NONE
```

### Authenticated startup destination

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

## 5. Login screen → Send OTP

The Login screen is fetched from the guest startup destination. Its request action invokes the existing Send OTP endpoint.

### Send OTP request

```text
POST /api/v1/partner/auth/send_otp
```

```json
{
  "phoneNumber": "<phone>",
  "deviceId": "<stable client device id>"
}
```

### Send OTP success data

```text
message
challengeId
expiresInSeconds
isNewUser
nextScreen
```

`nextScreen` is exactly:

```text
screenId       = partner_otp
templateId     = tpl_partner_otp_v1
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

OTP plaintext and OTP hash are never part of this response.

## 6. OTP screen → Verify OTP

The OTP screen uses the existing generic SDUI `request` action. No OTP-specific action language exists.

Canonical request:

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Canonical value references:

```text
challengeId ← $response.data.challengeId
phoneNumber ← $payload.phoneNumber
otp         ← $form.otp
deviceId    ← $context.deviceId
```

The generic runtime reference namespaces remain:

```text
$state
$payload
$response
$form
$context
```

Frontend must retain/resolve the values required by this action through its own MVI/UDF state/runtime layer. Backend must not invent hidden client state or a second reference mechanism.

### Verify OTP request body

```json
{
  "challengeId": "<uuid>",
  "phoneNumber": "<phone>",
  "otp": "<six digits>",
  "deviceId": "<stable client device id>",
  "deviceModel": "optional",
  "osVersion": "optional",
  "fcmToken": "optional"
}
```

### Verify OTP success data

```text
user
token          // access token
refreshToken   // raw replacement material returned once to the client
message
nextScreen
```

The authenticated `nextScreen` is exactly the Partner Dashboard destination defined above.

Security ordering is backend-owned: a session/access token/refresh token is issued only after the OTP challenge is valid, phone/device binding is valid, the secret matches, and atomic one-time consume succeeds.

## 7. Authenticated Dashboard retrieval

```text
GET /api/v1/partner/sdui/registry/partner_dashboard
Authorization: Bearer <access token>
```

This route is SESSION-protected and Partner-scoped. The loaded document must satisfy:

```text
loaded.screenId       == destination.screenId
loaded.template.id    == destination.templateId
loaded.template.type  == destination.templateType
```

The frontend should reject/navigation-fail safely if this identity parity is violated rather than rendering an unexpected screen under a trusted destination.

## 8. MVI/UDF mapping

Recommended state transition contract:

```text
User Intent
  → Store accepts intent
  → use case/repository issues backend request
  → envelope parsed
  → reducer produces new immutable state
  → optional Destination becomes one-time navigation effect
  → destination screen fetched
  → screen identity validated
  → SDUI renderer consumes immutable screen document
```

Suggested intent/effect semantics, without prescribing class names:

```text
EnterPhone / SubmitPhone
SendOtpSucceeded(challengeId, destination)
SendOtpFailed(error)
EnterOtp / SubmitOtp
VerifyOtpSucceeded(credentials, destination)
VerifyOtpFailed(error)
DestinationReceived(destination)
ScreenLoaded(screen)
ScreenLoadFailed(error)
```

Navigation is an effect of a successful backend result, not a reducer-side network call and not a backend-maintained UI state.

## 9. Credential handling

- Access token is supplied as `Authorization: Bearer <token>` for SESSION destinations.
- Refresh token is sensitive client credential material; persist it only in the frontend platform's secure-storage abstraction.
- Never log OTP, OTP hash, access token, or refresh token.
- A Verify OTP replay or concurrent losing verification must be handled as an auth failure; the frontend must not synthesize a local session from previous optimistic state.

## 10. Error handling

Frontend should map backend error envelopes into feature errors without matching human-readable messages as business logic. Preserve the typed backend `code` and `traceId` for safe diagnostics.

Important OTP errors include cooldown/rate-limit/delivery failures and invalid-or-expired verification failures. The backend remains authoritative; the frontend may display timers or retry affordances but must not bypass server cooldown/rate state.

## 11. Contract parity rules

The following must remain true across backend and frontend integration:

```text
SendOtp.nextScreen == Partner OTP screen identity
VerifyOtp.nextScreen == authenticated Bootstrap nextScreen
VerifyOtp.nextScreen == Partner Dashboard screen identity
```

No legacy `{ template, api }` navigation shape is legal in this Partner auth flow.

## 12. Change-management rule

Future auth/SDUI changes must preserve the existing hierarchy and generic contracts first. Reuse or extend current Destination, Screen, action, reference, envelope, auth, and repository contracts. Introduce a new abstraction only when the existing owner cannot legally express the requirement and the architecture document is updated before implementation.
