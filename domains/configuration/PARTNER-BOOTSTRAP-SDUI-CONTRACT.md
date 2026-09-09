# Partner Bootstrap ↔ SDUI Routing Contract

> **Status:** FROZEN for the Partner Login → OTP implementation sequence.
>
> **Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md` and `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.

---

## 1. Configuration ownership

Configuration owns Partner startup/runtime configuration decisions such as:

- maintenance mode;
- supported/minimum/latest app version policy;
- startup feature switches;
- guest vs authenticated startup selection;
- destination metadata for the next published Partner screen.

Configuration does **not** own:

- SDUI structural contracts;
- Partner screen composition;
- OTP/authentication business rules;
- Redis OTP persistence;
- Partner KYC/profile/job/booking state;
- HTTP response-envelope policy.

---

## 2. Current Partner bootstrap route

The Partner surface mounts bootstrap under the configuration prefix.

Current effective endpoint:

```http
GET /api/v1/partner/config/bootstrap
```

Any older documentation showing `/api/v1/partner/bootstrap` is stale for the current route composition and must not be used for new implementation.

---

## 3. Current guest startup destination — KEEP

The current default guest destination is already aligned with the real Partner Login SDUI screen:

```json
{
  "screenId": "partner_login",
  "templateId": "tpl_7K2M9Q",
  "templateType": "stack_template",
  "endpoint": "/api/v1/partner/screen/auth_login",
  "method": "GET",
  "authentication": "NONE"
}
```

This destination must remain internally consistent with the served Login screen:

```text
screen.screenId      = partner_login
screen.template.id   = tpl_7K2M9Q
screen.template.type = stack_template
```

No Phase in the Login → OTP work should recreate or rename the guest destination without a separate product/API requirement.

---

## 4. Authenticated startup destination — DEFER

The current authenticated bootstrap destination still references the older Partner Dashboard registry route.

That destination is deliberately **not** migrated during early Login → OTP phases because no real current Partner Dashboard screen exists under the canonical Partner screen surface.

Rules:

1. do not invent Dashboard `screenId/templateId/templateType/endpoint` values;
2. do not migrate authenticated bootstrap solely to make Verify OTP tests pass;
3. create/publish the real Dashboard (or other lifecycle destination) first;
4. then align both Verify OTP next destination and authenticated Bootstrap destination to the same published screen;
5. protect destination ↔ fetched-screen identity with tests.

---

## 5. Destination contract

Configuration carries startup destination metadata using the same semantics expected by the generic SDUI destination contract:

```text
screenId
templateId
templateType
endpoint
method
authentication
```

Configuration does not duplicate the loaded SDUI Screen structure.

The fetched Screen itself owns:

```text
screenId
schemaVersion
targetApp
template.id
template.type
```

A destination and a loaded Screen are related but are not the same object.

---

## 6. Persisted configuration compatibility

`partner.bootstrap` is persisted configuration and must be treated as a versioned runtime contract.

When changing required startup destination fields or semantics:

- inspect existing persisted JSON compatibility;
- do not assume defaults deep-merge into an existing stored document;
- prefer explicit normalization/versioning/migration;
- keep older app-version compatibility in mind;
- update focused Configuration tests.

The current guest destination already uses the new Login values; implementation must not regress persisted/default configuration back to older examples.

---

## 7. API response envelope boundary

Configuration owns the data snapshot, not the global HTTP envelope.

The Partner bootstrap controller/`ResponseHelper` own the transport envelope. The current backend-wide response/error contract will be reconciled in Phase 2 of:

```text
docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md
```

Do not change `ResponseHelper` for a Partner-Configuration-only field change.

---

## 8. Implementation sequencing

For the current Partner authentication work:

```text
Guest Bootstrap Login destination        KEEP
Loaded Login SDUI                        KEEP
Login send_otp request mapping           ALIGN
SendOtp legacy nextScreen                MIGRATE
Redis OTP persistence                    IMPLEMENT behind Identity port
OTP Partner screen                       CREATE after backend contract freeze
VerifyOtp legacy nextScreen              MIGRATE
Authenticated Dashboard Bootstrap        DEFER until real Dashboard exists
```

The canonical full phase plan is:

`docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.
