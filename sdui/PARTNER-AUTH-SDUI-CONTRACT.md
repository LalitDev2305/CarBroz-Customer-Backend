# Partner Authentication SDUI Contract Addendum

> **Status:** Phases 5–13 are COMPLETE + FROZEN. Phases 0–6 retain their prior freeze. This contract is bound to the exact documentation-complete `development` HEAD only after canonical `CarBroz Backend CI`, independent `Backend Architecture Closeout Verifier`, and the final forensic source/document audit all succeed on that same HEAD.
>
> **Authority:** `docs/MASTER-BACKEND-CONSTITUTION.md`, `docs/PRODUCTION_FREEZE_CONSTITUTION.md`, and `docs/PARTNER-AUTH-SDUI-REDIS-IMPLEMENTATION-PLAN.md`.
>
> **Purpose:** Freeze the implemented Partner Bootstrap → Login → OTP → authenticated Dashboard SDUI/auth contract without duplicating the generic SDUI framework.

## 1. Loaded Screen identity

A loaded Screen owns:

```text
screen.screenId
screen.schemaVersion
screen.targetApp
screen.template.id
screen.template.type
```

Root-level `templateId` and `templateType` do not belong to a loaded Screen.

A pre-fetch Destination separately owns:

```text
screenId
templateId
templateType
endpoint
method
authentication
```

After destination fetch:

```text
destination.screenId     == loaded.screenId
destination.templateId   == loaded.template.id
destination.templateType == loaded.template.type
```

## 2. Generic action/reference contract

Partner auth reuses the existing generic SDUI `request` action and `responseMode: destination` behavior. The implemented value-reference vocabulary is exactly:

```text
$binding
$context
$response
$literal
```

No Partner-specific action class and no `$form`, `$payload`, or `$state` reference namespace has been added.

For `responseMode: destination`:

```text
validate
→ resolve generic references
→ request
→ failure: expose/reduce error, no navigation
→ success: retain required transient flow context/response
→ validate destination
→ satisfy authentication requirement
→ fetch destination
→ verify loaded-screen identity
→ navigate/render
```

## 3. Partner Login — COMPLETE + FROZEN

Canonical Login Screen:

```text
screenId      = partner_login
template.id   = tpl_7K2M9Q
template.type = stack_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_login
```

Continue action:

```text
POST /api/v1/partner/auth/send_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Request mapping:

```json
{
  "phoneNumber": { "$binding": "mobileNumber" },
  "deviceId": { "$context": "deviceId" }
}
```

## 4. Send OTP destination — COMPLETE + FROZEN

Successful Send OTP returns:

```text
screenId       = partner_otp
templateId     = tpl_partner_otp_v1
templateType   = form_template
endpoint       = /api/v1/partner/screen/auth_otp
method         = GET
authentication = NONE
```

Legacy success navigation such as `{ template, api }` is forbidden.

OTP plaintext/hash is never part of the API result.

## 5. Partner OTP Screen — COMPLETE + FROZEN

Canonical loaded OTP Screen:

```text
screenId      = partner_otp
template.id   = tpl_partner_otp_v1
template.type = form_template
targetApp     = PARTNER
route         = GET /api/v1/partner/screen/auth_otp
```

The screen uses existing generic primitives only.

Verify action:

```text
POST /api/v1/partner/auth/verify_otp
authentication = NONE
validate       = true
responseMode   = destination
```

Canonical body references:

```text
challengeId ← { $response: "data.challengeId" }
phoneNumber ← { $context: "authFlow.phoneNumber" }
otp         ← { $binding: "otp" }
deviceId    ← { $context: "deviceId" }
```

The frontend/runtime handoff explicitly owns the producer for this transient flow state: after successful Send OTP and before OTP navigation, it retains the resolved submitted phone number as `authFlow.phoneNumber` and retains the successful Send OTP response for `$response`. No hidden server-side state transfer is introduced.

## 6. Verify OTP — COMPLETE + FROZEN

Verify OTP reuses the existing transport DTO, controller and Identity use case. Its success result uses the same readonly `AuthFlowDestination` contract as Send OTP.

Security order remains:

```text
load bound challenge
→ validate lifecycle/phone/device/attempt state
→ verify secret hash
→ atomic one-time consume
→ only then user/session creation
→ only then refresh/access credential issuance
→ authenticated destination
```

Concurrent/replay verification is fail-closed: at most one consume can succeed.

## 7. Authenticated Partner Dashboard — COMPLETE + FROZEN

Canonical authenticated destination:

```text
screenId       = partner_dashboard
templateId     = partner_dashboard_template
templateType   = default_template
endpoint       = /api/v1/partner/sdui/registry/partner_dashboard
method         = GET
authentication = SESSION
```

Canonical Dashboard composition:

```text
apps/api/src/surfaces/partner/screens/partner-dashboard.screen.ts
```

Runtime retrieval:

```http
GET /api/v1/partner/sdui/registry/partner_dashboard
Authorization: Bearer <access token>
```

The registry route verifies JWT and hard-scopes lookup to `targetApp: PARTNER`.

The Dashboard registry document is guaranteed by the forward migration:

```text
prisma/migrations/20260909142000_publish_partner_dashboard/migration.sql
```

Therefore deployment does not depend on manually running `prisma db seed`.

Verify OTP and authenticated Bootstrap return exactly this destination. Guest Bootstrap remains `partner_login`.

## 8. SDUI registry DI contract — COMPLETE + FROZEN

The registry application use cases are composed through the existing classic Awilix container key:

```text
sduiRegistryRepository
```

Their constructor dependency is named consistently with that canonical key. This avoids generic `repository` resolution and keeps all SDUI registry use cases on the one existing repository abstraction; no alias or second DI path exists.

## 9. SESSION error semantics — COMPLETE + FROZEN

SESSION-protected destination fetches must not convert missing/invalid bearer credentials into 500 responses.

Fastify/JWT transport-owned 401/403 failures are normalized by the canonical global error handler into safe:

```text
401 UNAUTHORIZED
403 FORBIDDEN
```

with no plugin/internal credential detail leakage.

## 10. Redis OTP persistence contract — COMPLETE + FROZEN

Production OTP persistence remains:

```text
Identity IOtpChallengeRepository
        ↑
RedisOtpChallengeRepository
        ↑
shared singleton redisClient
```

The same Redis client is used by cache and OTP composition. There is no production memory/Prisma fallback and no dual write.

Prisma OTP persistence was retired through a forward migration. Test-only deterministic OTP persistence lives only at the executable test composition boundary.

## 11. Full-flow proof — COMPLETE + FROZEN

Phase 12 E2E proves the actual Fastify/deployment flow:

```text
guest Bootstrap
→ Login Screen
→ Send OTP
→ OTP Destination
→ OTP Screen
→ Verify OTP
→ credentials
→ unauthenticated Dashboard request rejected with 401
→ authenticated migration-published Dashboard loaded
→ authenticated Bootstrap destination parity
```

The E2E does not create the Dashboard registry row; the migration must provide it.

## 12. MVI/UDF handoff — COMPLETE + FROZEN

The exact frontend integration contract is:

```text
docs/PARTNER-AUTH-SDUI-MVI-UDF-HANDOFF.md
```

Backend remains deterministic/action-driven and does not implement frontend reducer/store/ViewModel/state classes.

Required transient runtime behavior:

```text
Send OTP succeeds
→ retain resolved phone as authFlow.phoneNumber
→ retain successful response for $response
→ navigate to OTP
→ Verify OTP
→ clear transient auth-flow state on success/reset/cancel
```

OTP plaintext must not become reusable persistent application state after verification.

## 13. Final freeze gate — SATISFIED

The Phase 7–13 contract is COMPLETE + FROZEN only because all of the following are required to be green on the exact documentation-complete freeze HEAD:

1. immutable install succeeds;
2. CW1–CW5 architecture/security/ownership gates succeed;
3. Prisma validate/generate succeeds;
4. all forward migrations apply on fresh PostgreSQL;
5. fresh-schema convergence/drift proof succeeds;
6. monorepo build succeeds;
7. ESLint succeeds;
8. full Vitest succeeds, including the Partner auth→SDUI E2E;
9. post-test CW1–CW5 gates succeed;
10. non-mutating/read-only proof succeeds;
11. `CarBroz Backend CI` succeeds;
12. `Backend Architecture Closeout Verifier` succeeds on the same SHA;
13. final forensic source/document audit finds no contract drift, legacy navigation, duplicate production OTP persistence, unsupported SDUI references, seed-only Dashboard dependency, or DI mismatch.

If any future change invalidates one of these guarantees, the owning phase is reopened and the complete closeout sequence is mandatory again.
