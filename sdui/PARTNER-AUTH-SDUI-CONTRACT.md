# Partner Authentication SDUI Contract Addendum

> **Status:** FROZEN for the Partner Login → OTP backend implementation. Phase 5 Partner Login request alignment is COMPLETE + repository-verified; Phase 6 Send OTP canonical destination contract is COMPLETE + FROZEN after same-HEAD Backend CI and Architecture Closeout verification.
>
> **Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`, `docs/PRODUCTION_FREEZE_CONSTITUTION.md`, and `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md` remain higher-level execution authorities.
>
> **Purpose:** Correct and freeze the SDUI-specific contracts required by the current Partner authentication work without duplicating the generic SDUI implementation guide.
>
> **Closeout rule:** The repository-level Phase 6 freeze is bound to the exact documentation-complete `development` HEAD on which both canonical Backend CI and the independent Architecture Closeout verifier succeed.

---

## 1. Loaded Screen identity

The canonical loaded `SduiScreen` shape is the current `screenSchema` implementation:

```json
{
  "screenId": "partner_login",
  "schemaVersion": "3.0.0",
  "targetApp": "PARTNER",
  "theme": {},
  "metadata": {},
  "template": {
    "id": "tpl_7K2M9Q",
    "type": "stack_template",
    "components": []
  }
}
```

Root-level `templateId` and `templateType` do **not** belong to a loaded Screen and are rejected by the strict schema.

Canonical identity is:

```text
screen.screenId
screen.template.id
screen.template.type
```

Any older SDUI documentation example that shows root `templateId/templateType` on a loaded Screen is stale for current V3 implementation and must not be copied into new code.

---

## 2. Destination metadata is a different contract

Before a screen is fetched, navigation/startup/request results may carry a destination:

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

This duplication is intentional because the template has not yet been loaded.

The existing `dynamicDestinationSchema` remains canonical. No Partner-specific destination type should be introduced in `sdui/ui-sdk`.

For Phase 6, the Partner OTP identity shown above is now reserved and frozen. Phase 8 must implement the loaded OTP screen and route with exactly these identities rather than inventing different values later.

---

## 3. Destination-to-Screen verification

When a destination is fetched, the runtime contract must be able to enforce:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

Authentication requirements must also be satisfied before performing an authenticated destination fetch.

Backend tests must guarantee that published destination metadata and the served screen stay consistent.

For the reserved Partner OTP destination, Phase 8 must therefore serve:

```text
loaded.screenId      = partner_otp
loaded.template.id   = tpl_partner_otp_v1
loaded.template.type = form_template
GET /api/v1/partner/screen/auth_otp
authentication       = NONE
```

---

## 4. Generic REQUEST action remains canonical

The existing request action supports the Partner Login/OTP flow and must be reused.

Supported reference sources already include:

```text
$binding
$context
$response
$literal
```

The Partner authentication implementation must not add:

```text
LoginContinueAction
OtpVerifyAction
LoginOnSuccessAction
OtpNavigationAction
second ActionEngine
```

unless a repository-wide generic capability gap is first proven and documented.

---

## 5. `responseMode: destination`

For a request action configured with:

```json
{
  "responseMode": "destination"
}
```

the frozen semantic sequence is:

```text
validate form state
      ↓
resolve generic references
      ↓
perform HTTP request
      ↓
HTTP/application failure? ── yes ──> expose error; DO NOT navigate
      │
      no
      ↓
read canonical next destination
      ↓
validate destination
      ↓
navigate/fetch destination
```

The backend response must therefore return canonical destination metadata rather than the legacy `{ template, api }` shape.

---

## 6. Partner Login request contract — PHASE 5 COMPLETE

The existing Login screen is reused unchanged except for its request-body field mapping.

Canonical screen identity remains:

```text
screenId      = partner_login
template.id   = tpl_7K2M9Q
template.type = stack_template
targetApp     = PARTNER
```

The Continue action still uses the existing generic request semantics:

```text
method         = POST
endpoint       = /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Frozen request-body mapping:

```json
{
  "phoneNumber": { "$binding": "mobileNumber" },
  "deviceId": { "$context": "deviceId" }
}
```

`phoneNumber` is user-entered form state resolved from the existing `mobileNumber` binding.
`deviceId` is runtime context and is not modeled as a visible or hidden product-specific SDUI field merely to satisfy the HTTP DTO.

The shared transport `SendOtpSchema` continues to own the resolved HTTP shape `{ phoneNumber, deviceId }`; Phase 5 does not create or modify a Partner-specific DTO, mapper, controller, use case, action type, or navigation mechanism.

Focused source proof lives in:

```text
apps/api/src/surfaces/partner/screens/partner-login.screen.spec.ts
apps/api/src/transport/auth/tests/partner-auth.route.spec.ts
```

The detailed Phase 5 frozen implementation contract is:

```text
sdui/PHASE-5-PARTNER-LOGIN-REQUEST-CONTRACT.md
```

The exact client runtime context-key registry belongs to the frontend/runtime contract. The backend schema only owns generic `$context` validation.

---

## 7. Send OTP destination result — PHASE 6 COMPLETE + FROZEN

Phase 6 replaces only the legacy Send OTP success navigation metadata. It does not alter OTP generation, hashing, persistence, delivery, cooldown, rate limiting, attempt policy, expiry, device binding, error behavior, or response envelope.

Legacy result, now forbidden:

```json
{
  "nextScreen": {
    "template": "form_template",
    "api": "auth/auth_otp"
  }
}
```

Frozen Phase 6 result destination:

```json
{
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

Identity must not import `sdui/ui-sdk` merely to reuse `dynamicDestinationSchema`. No neutral lower-level destination type currently exists that Identity may legally import, so Identity may own only the smallest transport-neutral auth-flow destination value interface. Runtime/schema validation remains owned by `sdui/ui-sdk` and is proven from boundary tests.

Detailed Phase 6 ownership, invariants, regression requirements, and Definition of Done are frozen in:

```text
domains/identity/PHASE-6-SEND-OTP-DESTINATION-CONTRACT.md
```

---

## 8. OTP screen creation rule

No OTP-specific generic SDK type is authorized.

When the OTP Partner screen is implemented, it must first attempt to express the design using existing generic:

```text
Template
Component
Section
Group
Element
request action
binding/context/response references
```

A new generic Element/behavior type is allowed only if existing primitives objectively cannot express the required reusable behavior and the new type is product-neutral.

The product composition belongs under:

```text
apps/api/src/surfaces/partner/screens/
```

not inside `sdui/ui-sdk` definitions as a Partner-specific class.

Phase 8 must consume the Phase 6 reserved identity exactly:

```text
screenId      = partner_otp
template.id   = tpl_partner_otp_v1
template.type = form_template
route         = GET /api/v1/partner/screen/auth_otp
```

---

## 9. OTP runtime-state inputs

The OTP verification request is expected to resolve generic state/context approximately as:

```text
challengeId ← previous Send OTP response/navigation state
phoneNumber ← retained flow state/context
otp         ← OTP input binding
deviceId    ← runtime context
optional device metadata ← runtime context
```

No hidden server-side assumption should be required for values that the client/runtime must explicitly preserve across the flow.

---

## 10. MVI/UDF compatibility

Frontend MVI/UDF is not implemented in this backend package.

The SDUI/backend contract supports MVI/UDF by remaining:

- deterministic;
- action-driven;
- explicit about input references;
- explicit about success destinations;
- explicit about failure/no-navigation semantics;
- immutable at the contract boundary;
- free of screen-specific hidden side effects.

The frontend will consume these contracts through its existing ActionEngine/store/reducer architecture after backend freeze.

---

## 11. Implementation sequencing

The authoritative phase ordering is maintained in:

```text
docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md
```

For SDUI specifically:

1. keep current loaded Screen schema;
2. keep current generic action/destination schema unless a proven gap exists;
3. align Login request references — Phase 5 COMPLETE;
4. reserve and implement canonical Send OTP destination result — Phase 6 COMPLETE + FROZEN;
5. only then create the OTP Partner screen/route using the exact reserved Phase 6 identity;
6. validate destination ↔ fetched Screen identity;
7. align Verify OTP request/result;
8. defer authenticated Dashboard routing until a real Dashboard Screen exists.
