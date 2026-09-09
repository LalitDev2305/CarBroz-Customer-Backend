# Phase 5 — Partner Login Request Alignment Contract

> **Status:** COMPLETE + FROZEN — implementation and repository verification completed; Phase 6 is the next phase.
>
> **Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`, `docs/PRODUCTION_FREEZE_CONSTITUTION.md`, `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`, and `sdui/PARTNER-AUTH-SDUI-CONTRACT.md` remain higher authorities.
>
> **Scope:** Align only the existing Partner Login Continue request payload with the already-existing shared auth transport contract. Phase 5 does not change Send OTP result navigation, create the OTP screen, alter Identity business logic, change Redis persistence, or introduce frontend/runtime code.

## 1. Existing contracts to reuse

The existing Partner Login screen remains:

```text
apps/api/src/surfaces/partner/screens/partner-login.screen.ts
screenId      = partner_login
template.id   = tpl_7K2M9Q
template.type = stack_template
targetApp     = PARTNER
```

The existing shared endpoint remains:

```text
POST /api/v1/partner/auth/send_otp
```

The existing transport DTO already requires:

```text
phoneNumber: string
deviceId: string
```

The existing generic SDUI request/reference system already supports:

```text
$binding
$context
responseMode: destination
```

No new DTO, controller, use case, action type, mapper, hidden field, navigation framework, or runtime context mechanism is authorized.

## 2. Exact Phase 5 source change

Pre-Phase-5 stale payload:

```json
{
  "mobileNumber": { "$binding": "mobileNumber" }
}
```

Frozen implemented payload:

```json
{
  "phoneNumber": { "$binding": "mobileNumber" },
  "deviceId": { "$context": "deviceId" }
}
```

Ownership is frozen as:

```text
phoneNumber <- visible input binding `mobileNumber`
deviceId    <- generic runtime context key `deviceId`
```

The visible input binding key remains `mobileNumber`; only the HTTP request field name is `phoneNumber`.

`deviceId` must not be introduced as a visible or hidden product-specific SDUI input element merely to satisfy the transport DTO.

## 3. Request semantics that remain unchanged

The Continue action remains the existing generic request action with:

```text
method         = POST
endpoint       = /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Phase 5 did not alter response/navigation behavior. The current Send OTP backend result remains a Phase 6 concern.

## 4. Verification completed

Focused tests prove:

- loaded Partner Login Screen still passes the strict V3 `screenSchema`;
- screen identity remains unchanged;
- Continue action remains generic `request`;
- endpoint/method/authentication/validate/responseMode remain unchanged;
- request body contains exactly `phoneNumber -> $binding(mobileNumber)` and `deviceId -> $context(deviceId)`;
- stale request field `mobileNumber` is absent from the HTTP body;
- no device input element is added to the screen;
- shared `SendOtpSchema` remains unchanged and accepts the resolved `{ phoneNumber, deviceId }` shape;
- no Partner-specific action/mapper/controller/use-case is introduced.

Repository closeout passes CW1–CW5, Prisma checks, build, ESLint, full Vitest, repeated gates and non-mutating/read-only verification.

## 5. Explicitly out of scope

Phase 5 does not:

- change `SendOtpUseCase` result shape;
- create or publish `partner_otp`;
- change `responseMode: destination` semantics;
- modify Redis OTP persistence;
- modify OTP security/rate-limit behavior;
- change Verify OTP;
- change Bootstrap/Dashboard routing;
- touch frontend MVI/UDF;
- retire Prisma OTP persistence.

## 6. Definition of done

Phase 5 is complete: the existing Partner Login screen emits the exact frozen payload, focused tests prove the mapping and absence of duplicate mechanisms, canonical owner documentation is synchronized, and the documentation-complete HEAD is subject to canonical CI plus architecture closeout verification before Phase 6 begins.
