# Partner Bootstrap ↔ SDUI Routing Contract

> **Status:** Phases 0–13 implementation synchronized. Final freeze is valid only when the exact documentation-complete `development` HEAD passes both canonical Backend CI and the independent Architecture Closeout verifier.
>
> **Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md` and `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.

## 1. Configuration ownership

Configuration owns Partner startup/runtime configuration decisions including maintenance/update policy, startup feature switches, guest/authenticated startup selection, and destination metadata.

Configuration does not own SDUI structure/composition, OTP/authentication policy, Redis OTP persistence, Partner business lifecycle, or the global HTTP response envelope.

## 2. Canonical Partner bootstrap endpoint

```http
GET /api/v1/partner/config/bootstrap
```

Older `/api/v1/partner/bootstrap` examples are stale.

## 3. Guest startup destination

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

Fetched Login identity must remain:

```text
screen.screenId      = partner_login
screen.template.id   = tpl_7K2M9Q
screen.template.type = stack_template
```

## 4. Authenticated startup destination — IMPLEMENTED

The authenticated startup contract is now a real SESSION-protected Partner SDUI registry destination:

```json
{
  "screenId": "partner_dashboard",
  "templateId": "partner_dashboard_template",
  "templateType": "default_template",
  "endpoint": "/api/v1/partner/sdui/registry/partner_dashboard",
  "method": "GET",
  "authentication": "SESSION"
}
```

The canonical Partner Dashboard composition lives at:

```text
apps/api/src/surfaces/partner/screens/partner-dashboard.screen.ts
```

The authenticated runtime route is:

```http
GET /api/v1/partner/sdui/registry/partner_dashboard
Authorization: Bearer <access token>
```

The route verifies the JWT and hard-scopes registry lookup to `targetApp: PARTNER`.

The Dashboard registry document is provisioned by the forward Prisma migration:

```text
prisma/migrations/20260909142000_publish_partner_dashboard/migration.sql
```

Production availability therefore does not depend on manually executing `prisma db seed`.

## 5. Destination ↔ loaded Screen contract

Destination metadata is a pre-fetch value:

```text
screenId
templateId
templateType
endpoint
method
authentication
```

A loaded Screen owns:

```text
screenId
schemaVersion
targetApp
template.id
template.type
```

After fetch, the following parity is mandatory:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

For the authenticated Partner destination, SESSION authentication must succeed before the screen is returned.

## 6. Verify OTP parity

Successful Verify OTP and authenticated Bootstrap converge on exactly the same Dashboard destination. No legacy `{ template, api }` result is legal in this Partner auth flow.

Required parity:

```text
verifyOtp.nextScreen == authenticatedBootstrap.nextScreen
verifyOtp.nextScreen == published Partner Dashboard identity
```

Guest Bootstrap remains unchanged and continues to select `partner_login`.

## 7. Persisted configuration compatibility

`partner.bootstrap` is persisted configuration and remains a versioned runtime contract. `ConfigProvider` returns an existing stored document as stored; defaults do not deep-merge into it.

Therefore future changes to startup destination fields/semantics must explicitly inspect stored JSON compatibility and use deliberate normalization/versioning/migration when required. The current Phase 10 implementation did not invent a new authenticated identity: the Dashboard destination was already the canonical default contract and is now backed by an actually published registry document.

## 8. API envelope boundary

Configuration owns the startup snapshot, not the HTTP envelope. The Partner bootstrap controller continues to reuse the canonical transport envelope owned by:

```text
apps/api/src/transport/response/ResponseHelper.ts
```

No Partner-specific response helper is authorized.

## 9. Current implementation sequence

```text
Guest Bootstrap → partner_login
Login request   → POST /api/v1/partner/auth/send_otp
Send OTP        → partner_otp
OTP screen      → POST /api/v1/partner/auth/verify_otp
Verify OTP      → partner_dashboard (SESSION)
Auth Bootstrap  → same partner_dashboard destination
```

The complete phase contract and freeze evidence are maintained in `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.
