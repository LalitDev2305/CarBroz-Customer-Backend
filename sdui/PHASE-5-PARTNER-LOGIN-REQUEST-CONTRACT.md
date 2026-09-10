# Phase 5 — Partner Login Request Alignment Contract

> **Status:** HISTORICAL PHASE COMPLETE + BEHAVIOR FROZEN.
>
> **Current architecture:** `sdui/SDUI-COMPOSE-CONTRACT-IMPLEMENTATION-PLAN.md` supersedes the old screen-authoring location/model. This document remains the immutable behavioral record for the Login Continue request mapping and must be preserved during the new fluent-engine migration.

---

## 1. Frozen Partner Login identity

```text
screenId      = partner_login
template.id   = tpl_7K2M9Q
template.type = stack_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_login
```

The final screen-composition owner is:

```text
sdui/engine/src/screens/partner/PartnerLoginScreen.ts
```

Older API/domain screen-builder locations are migration/compatibility sources only and must be retired after zero-reference proof.

---

## 2. Frozen request endpoint

```text
POST /api/v1/partner/auth/send_otp
```

Transport fields:

```text
phoneNumber: string
deviceId: string
```

Canonical SDUI request mapping:

```json
{
  "phoneNumber": { "$binding": "mobileNumber" },
  "deviceId": { "$context": "deviceId" }
}
```

The visible input binding remains:

```text
mobileNumber
```

The HTTP field remains:

```text
phoneNumber
```

`deviceId` is runtime context; it must not be represented as a fake hidden/visible product-specific input merely to satisfy transport.

---

## 3. Frozen request semantics

```text
type           = request
method         = POST
endpoint       = /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Authoring under the new engine should be equivalent to:

```ts
button.behavior().onClick(
  action.request({
    method: 'POST',
    endpoint: '/api/v1/partner/auth/send_otp',
    authentication: 'NONE',
    validate: true,
    responseMode: 'destination',
    body: {
      phoneNumber: ref.binding('mobileNumber'),
      deviceId: ref.context('deviceId'),
    },
  }),
);
```

The authoring syntax may change; the serialized wire contract above may not.

---

## 4. New Golden Reference requirement

Partner Login is the first screen migrated to the finalized fluent SDUI architecture.

The migration must prove:

```text
old accepted canonical Login JSON
==
new engine-generated canonical Login JSON
```

Deep equality/parity must cover:

- screen identity;
- target app;
- template id/type;
- theme;
- hierarchy;
- node ids/types;
- final resolved properties;
- bindings;
- validation rules;
- actions;
- request body references;
- endpoint/method/authentication;
- responseMode.

No migration is considered complete merely because the new screen “looks equivalent”.

---

## 5. Property-authoring migration rule

The new screen composer may omit canonical default properties from source code because the engine definition emits them automatically.

This does **not** authorize wire-output removal.

Example:

```text
stack_component definition default spacing/padding/etc.
        +
Login-specific fluent overrides
        ↓
resolved final properties
```

Where old accepted output contains a required canonical value, the new resolved output must preserve it exactly unless the architecture contract intentionally defines that value as a newly canonical default with identical serialized result.

---

## 6. Action/reference migration rule

Migrated screen source must use:

```text
action.*
ref.*
```

instead of hand-writing protocol markers.

Required mapping remains:

```text
phoneNumber ← ref.binding('mobileNumber')
deviceId    ← ref.context('deviceId')
```

No Login-specific request mapper/action class is authorized.

---

## 7. Explicitly unchanged behavior

The fluent-engine migration does not change:

- SendOtp DTO/controller/use case;
- Redis OTP persistence;
- rate limits/cooldown;
- OTP verification behavior;
- Destination semantics;
- Bootstrap behavior;
- Dashboard authentication;
- frontend MVI/UDF ownership.

---

## 8. Definition of done under the current plan

This historical Phase 5 behavior remains complete only if the current migration preserves it.

Current Golden Reference closeout requires:

1. new engine Login composer uses finalized hierarchy/property DSL;
2. final output deep-equals frozen Login contract;
3. existing Login tests stay green;
4. action/reference helpers serialize exactly;
5. no duplicate production Login composition owner remains after safe retirement;
6. build/lint/test/coverage/freeze gates remain green;
7. only then may Partner OTP migration proceed.
