# Phase 6 — Send OTP Canonical Destination Contract

> **Status:** FROZEN BEFORE IMPLEMENTATION
>
> **Phase:** 6 — Send OTP canonical destination result
>
> **Authority:** Subordinate to `docs/MASTER-BACKEND-CONSTITUTION.md`, `docs/PRODUCTION_FREEZE_CONSTITUTION.md`, `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`, `sdui/PARTNER-AUTH-SDUI-CONTRACT.md`, and the current source architecture. If a conflict is discovered, the higher-authority contract wins.
>
> **Scope:** Replace the legacy Send OTP success navigation metadata with the canonical dynamic-destination semantics required by the existing generic SDUI `request` action. Preserve every OTP security, persistence, delivery, rate-limit, response-envelope, and error behavior already proven in Phases 2–5.

---

## 1. Why Phase 6 exists

The Partner Login screen already uses the generic request action with:

```text
POST /api/v1/partner/auth/send_otp
responseMode = destination
```

Phase 5 corrected the request body to:

```text
phoneNumber ← $binding(mobileNumber)
deviceId    ← $context(deviceId)
```

The remaining incompatibility is the successful `SendOtpUseCase` result. It still returns the legacy shape:

```json
{
  "nextScreen": {
    "template": "form_template",
    "api": "auth/auth_otp"
  }
}
```

That shape cannot satisfy the already-frozen `dynamicDestinationSchema`, which requires:

```text
screenId
templateId
templateType
endpoint
method
authentication
```

Phase 6 removes only this contract mismatch.

---

## 2. Source-first findings and KEEP / MODIFY / CREATE decisions

### KEEP

The following are already canonical and must not be replaced:

- `SendOtpUseCase` orchestration and all security/business behavior;
- `SendOtpInput { phoneNumber, deviceId }`;
- OTP generation and one-way hashing;
- resend cooldown and rate limiting;
- `IOtpChallengeRepository` and the Redis/Prisma implementations selected by composition;
- SMS/provider abstraction and fail-closed delivery behavior;
- challenge invalidation when delivery fails;
- public opaque `challengeId`;
- `expiresInSeconds` and `isNewUser` semantics;
- `AuthController.sendOtp()`;
- `ResponseHelper.success(...)` canonical envelope;
- Partner Login generic `request` action;
- `responseMode: destination`;
- `sdui/ui-sdk` `dynamicDestinationSchema`;
- global error mapping and all CW1–CW5 gates.

### MODIFY

Only the Send OTP success result contract is modified:

```text
legacy nextScreen { template, api }
              ↓
canonical destination-compatible nextScreen
```

Focused tests that currently assert the old result are updated to assert the new frozen destination.

### CREATE

One smallest Identity application value contract is allowed only because no neutral lower-level Destination type exists that Identity may legally import.

It is **not** a new navigation framework and **not** a replacement for `dynamicDestinationSchema`.

### DEFER

The following remain outside Phase 6:

- actual Partner OTP screen composition;
- actual Partner OTP GET route implementation;
- OTP screen destination ↔ loaded Screen parity test;
- Verify OTP request composition;
- Verify OTP authenticated destination migration;
- Dashboard screen/route creation;
- frontend ActionEngine/runtime implementation.

Those remain in their later phases.

---

## 3. Dependency and ownership rule

Identity must remain transport-neutral and SDUI-package-independent.

Forbidden dependency direction:

```text
Identity application → sdui/ui-sdk
```

Also forbidden:

```text
Identity application → domains/configuration PartnerStartupScreenConfig
```

Configuration's startup contract is owned by Configuration and must not become a cross-domain navigation dependency.

Approved shape:

```text
Identity application
  owns the smallest readonly auth-flow destination value shape
             ↓
SendOtpResult.nextScreen
             ↓
HTTP transport returns it unchanged in canonical response data
             ↓
SDUI client validates it using dynamicDestinationSchema
```

This preserves Clean Architecture and prevents a second shared navigation framework.

---

## 4. Frozen Phase 6 destination identity

Phase 6 reserves the exact Partner OTP destination identity that Phase 8 must later implement.

```json
{
  "screenId": "partner_otp",
  "templateId": "tpl_partner_otp_v1",
  "templateType": "form_template",
  "endpoint": "/api/v1/partner/screen/auth_otp",
  "method": "GET",
  "authentication": "NONE"
}
```

Meaning:

- `screenId = partner_otp` — canonical loaded Partner OTP screen identity;
- `templateId = tpl_partner_otp_v1` — reserved OTP template instance identity;
- `templateType = form_template` — OTP screen is expected to use the existing reusable form template vocabulary;
- `endpoint = /api/v1/partner/screen/auth_otp` — reserved Partner public OTP screen route;
- `method = GET` — required by the canonical dynamic destination contract;
- `authentication = NONE` — OTP screen must be fetchable before an authenticated session exists.

Phase 8 is not allowed to silently choose different values. If later source evidence proves one of these values is impossible, the contract must be amended explicitly before implementation.

---

## 5. Frozen Send OTP success result

After successful challenge persistence and successful provider delivery, `SendOtpUseCase.execute()` must return:

```json
{
  "message": "OTP sent successfully",
  "challengeId": "<opaque-public-challenge-id>",
  "expiresInSeconds": 300,
  "isNewUser": true,
  "nextScreen": {
    "screenId": "partner_otp",
    "templateId": "tpl_partner_otp_v1",
    "templateType": "form_template",
    "endpoint": "/api/v1/partner/screen/auth_otp",
    "method": "GET",
    "authentication": "NONE"
  }
}
```

The outer API response remains owned by `ResponseHelper`:

```text
{
  status,
  code,
  message,
  data: <SendOtpResult>,
  traceId
}
```

Phase 6 must not introduce a second envelope or controller mapping.

---

## 6. Application value contract

The smallest allowed value contract is semantically equivalent to the SDUI destination but remains framework-neutral:

```ts
interface AuthFlowDestination {
  readonly screenId: string;
  readonly templateId: string;
  readonly templateType: string;
  readonly endpoint: string;
  readonly method: 'GET';
  readonly authentication: 'NONE' | 'SESSION';
}
```

`SendOtpResult.nextScreen` uses this contract.

Rules:

- no Zod import into Identity;
- no Fastify import into Identity;
- no `sdui/ui-sdk` import into Identity;
- no Configuration-domain import into Identity;
- no Partner-specific `Action` class;
- no mutable destination object exposed as shared global state;
- no duplicate generic destination validator.

Runtime schema validation remains at the SDUI/client boundary using the existing `dynamicDestinationSchema`.

---

## 7. Security invariants that Phase 6 MUST NOT change

The destination migration is a result-contract change only.

All of these remain exactly preserved:

1. OTP is generated cryptographically by the existing security provider.
2. Only the OTP hash is persisted.
3. Plaintext OTP never appears in response data.
4. Cooldown is checked before issuing a new challenge.
5. Sliding/window rate limit behavior remains unchanged.
6. Persistence-time atomic rate-limit guard remains unchanged.
7. Challenge is bound to the request `deviceId`.
8. Challenge expiry remains governed by `AUTH_SECURITY_POLICY`.
9. Provider failure invalidates the created challenge and returns the existing typed 503 error.
10. Redis/infrastructure failure remains fail-closed.
11. No Prisma/Redis dual-write or fallback is introduced.
12. No logging of OTP, OTP hash, token, or unnecessary PII is introduced.

---

## 8. Error behavior

Phase 6 changes **success navigation metadata only**.

Existing failures remain untouched, including:

```text
OTP_RESEND_COOLDOWN      → 429
OTP_RATE_LIMITED         → 429
OTP_DELIVERY_FAILED      → 503
```

No failure path may return a destination.

The existing global envelope/error gate remains authoritative.

---

## 9. Controller and transport behavior

`AuthController.sendOtp()` remains an adapter only:

```text
SendOtpSchema.parse(request.body)
      ↓
sendOtpUseCase.execute(input)
      ↓
ResponseHelper.success(result)
```

No Partner-specific send-OTP controller, mapper, DTO, response class, or navigation mapper may be introduced.

The Phase 5 route remains:

```text
POST /api/v1/partner/auth/send_otp
```

---

## 10. SDUI compatibility proof required in Phase 6 tests

Focused verification must prove the returned `nextScreen` is accepted by the existing canonical `dynamicDestinationSchema` without importing that schema into Identity production code.

The boundary test may live in API/SDUI test code where both contracts can legally be observed.

Required assertions:

```text
nextScreen.screenId       == partner_otp
nextScreen.templateId     == tpl_partner_otp_v1
nextScreen.templateType   == form_template
nextScreen.endpoint       == /api/v1/partner/screen/auth_otp
nextScreen.method         == GET
nextScreen.authentication == NONE
```

And:

```text
dynamicDestinationSchema.parse(nextScreen) succeeds
```

---

## 11. Regression coverage required

Phase 6 must add/update tests proving:

- Send OTP success preserves message/challengeId/TTL/isNewUser;
- legacy `nextScreen.template` is gone;
- legacy `nextScreen.api` is gone;
- new destination has exactly the six canonical fields;
- destination is strict-schema compatible;
- no OTP value is exposed;
- existing rate-limit/cooldown/delivery failure tests remain green;
- Phase 5 route-level regression remains green;
- Verify OTP behavior is unchanged in this phase.

---

## 12. Phase 8 handoff obligation

Phase 8 must implement an actual loaded screen whose identity satisfies:

```text
loaded.screenId      == partner_otp
loaded.template.id   == tpl_partner_otp_v1
loaded.template.type == form_template
```

and serve it from:

```text
GET /api/v1/partner/screen/auth_otp
```

Then a destination-to-screen parity regression must prove:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

Until Phase 8, Phase 6 reserves the destination contract but does not create the screen or route.

---

## 13. Definition of Done

Phase 6 is COMPLETE only when all are true:

- this document was frozen before production implementation;
- `SendOtpResult` no longer contains legacy `{ template, api }` metadata;
- `SendOtpUseCase` returns the exact reserved canonical destination;
- Identity has no dependency on `sdui/ui-sdk`, Configuration, Fastify, Prisma, Redis vendor APIs, or API transport;
- existing OTP security/business behavior is unchanged;
- focused Identity tests pass;
- Phase 5 Partner HTTP route regression passes;
- boundary validation proves `nextScreen` satisfies `dynamicDestinationSchema`;
- build and lint pass;
- full Vitest passes;
- CW1–CW5 gates pass before and after the test/build sequence;
- non-mutating/read-only closeout proof passes;
- both canonical CI and independent Architecture Closeout succeed on the same final `development` HEAD;
- Phase 7+ production behavior remains untouched.

Until those conditions are proven, Phase 6 status remains **IMPLEMENTATION / VERIFICATION PENDING**, not COMPLETE.
