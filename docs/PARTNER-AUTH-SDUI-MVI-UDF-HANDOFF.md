# Partner Auth + SDUI Backend → Frontend MVI/UDF Handoff

**Status:** Phase 13 implementation contract — synchronized with the implemented Partner auth + SDUI backend flow.

This document is the stable handoff for the Partner frontend. It describes backend contracts the frontend MVI/UDF runtime consumes; it does not move reducer, Store, ViewModel, navigation-state, or rendering ownership into the backend.

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
- resolution and retention of runtime values referenced by SDUI actions;
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

The authenticated Dashboard registry document is provisioned through a forward Prisma migration. Production availability must not depend on manually running `prisma db seed`.

## 5. Login screen → Send OTP

The Login screen is fetched from the guest startup destination. Its existing generic request action invokes:

```text
POST /api/v1/partner/auth/send_otp
```

The loaded Login screen resolves the request body using the canonical SDUI value-reference vocabulary:

```text
phoneNumber ← { $binding: "mobileNumber" }
deviceId    ← { $context: "deviceId" }
```

Resolved request body:

```json
{
  "phoneNumber": "<phone>",
  "deviceId": "<stable client device id>"
}
```

Send OTP success data contains:

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

## 6. Transient auth-flow state required before OTP navigation

The generic SDUI SDK intentionally does not invent screen-specific state-transfer actions. Therefore the frontend runtime must preserve the values required by the next screen as part of its existing MVI/UDF flow state.

After a successful Send OTP request and before executing/fetching its destination, the frontend must retain:

```text
authFlow.phoneNumber = resolved Send OTP request body phoneNumber
lastSuccessfulResponse = complete successful Send OTP response envelope
```

This enables the OTP screen's existing references:

```text
challengeId ← { $response: "data.challengeId" }
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

`$response` on the OTP screen therefore refers to the previous successful request response that produced the destination. `$context: "authFlow.phoneNumber"` refers to transient frontend auth-flow context retained from the resolved Send OTP request.

The transient Send OTP response/auth-flow values should be cleared after successful Verify OTP, explicit cancellation/back navigation that abandons the flow, logout/reset, or a new authentication flow. OTP plaintext must not be retained as reusable application state after verification.

## 7. Canonical generic SDUI reference vocabulary

The current backend SDK supports exactly these generic value-reference forms:

```text
{ $binding: "..." }
{ $context: "..." }
{ $response: "..." }
{ $literal: <value> }
```

There is no `$form`, `$payload`, or `$state` value-reference namespace in the current backend contract. Frontend implementations must not depend on those names unless the generic SDK is deliberately extended in a future separately-reviewed change.

## 8. OTP screen → Verify OTP

The OTP screen uses the existing generic SDUI `request` action. No OTP-specific action language exists.

Canonical action configuration:

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Resolved request body:

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

The current OTP screen sends the four required fields. Optional device metadata may be added only through the same generic context/reference mechanism when the frontend runtime supplies it.

Verify OTP success data contains:

```text
user
token          // access token
refreshToken   // raw replacement material returned once to the client
message
nextScreen
```

The authenticated `nextScreen` is exactly the Partner Dashboard destination defined above.

Security ordering is backend-owned: a user/session/access token/refresh-token family is established only after the challenge is valid, phone/device binding is valid, the secret matches, and atomic one-time consume succeeds.

## 9. Generic `responseMode: destination` runtime rule

For an SDUI request configured with `responseMode: destination`, frontend runtime behavior is:

```text
validate current form/bindings
  → resolve $binding/$context/$response/$literal values
  → execute HTTP request
  → failure: reduce/expose error; do not navigate
  → success: preserve required flow state/response
  → validate returned destination
  → enforce SESSION credential requirement when applicable
  → fetch destination screen
  → verify loaded screen identity
  → navigate/render
```

No second action engine or Partner-specific navigation callback is required.

## 10. Authenticated Dashboard retrieval

```text
GET /api/v1/partner/sdui/registry/partner_dashboard
Authorization: Bearer <access token>
```

This route is SESSION-protected and hard-scoped by the backend to `targetApp: PARTNER`. The loaded document must satisfy:

```text
loaded.screenId       == destination.screenId
loaded.template.id    == destination.templateId
loaded.template.type  == destination.templateType
```

The frontend should fail navigation safely if this identity parity is violated rather than render an unexpected screen under a trusted destination.

## 11. MVI/UDF mapping

Recommended state transition contract:

```text
User Intent
  → Store accepts intent
  → ActionEngine/repository resolves SDUI request references
  → backend request
  → envelope parsed
  → reducer produces new immutable state
  → flow context/previous response retained when required
  → optional Destination emitted as one-time navigation effect
  → destination screen fetched
  → screen identity validated
  → SDUI renderer consumes immutable screen document
```

Possible intent/result/effect semantics, without prescribing class names:

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

Navigation is an effect of a successful backend result, not a reducer-side network call and not backend-maintained UI state.

## 12. Credential handling

- Access token is supplied as `Authorization: Bearer <token>` for SESSION destinations.
- Refresh token is sensitive client credential material; persist it only in the frontend platform's secure-storage abstraction.
- Never log OTP, OTP hash, access token, or refresh token.
- A Verify OTP replay or concurrent losing verification must be handled as an auth failure; the frontend must not synthesize a local session from optimistic state.

## 13. Error handling

Frontend should map backend error envelopes into feature errors without matching human-readable messages as business logic. Preserve the typed backend `code` and `traceId` for safe diagnostics.

Important OTP errors include cooldown/rate-limit/delivery failures and invalid-or-expired verification failures. The backend remains authoritative; the frontend may display timers or retry affordances but must not bypass server cooldown/rate state.

## 14. Contract parity rules

The following must remain true across backend and frontend integration:

```text
SendOtp.nextScreen == Partner OTP screen identity
VerifyOtp.nextScreen == authenticated Bootstrap nextScreen
VerifyOtp.nextScreen == Partner Dashboard screen identity
```

No legacy `{ template, api }` navigation shape is legal in this Partner auth flow.

## 15. Change-management rule

Future auth/SDUI changes must preserve the existing hierarchy and generic contracts first. Reuse or extend current Destination, Screen, action, reference, envelope, auth, and repository contracts. Introduce a new abstraction only when the existing owner cannot legally express the requirement and the architecture document is updated before implementation.
