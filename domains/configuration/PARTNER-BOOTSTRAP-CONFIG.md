# Partner Bootstrap Configuration Guide

> **Owner:** `domains/configuration`  
> **Consumer:** Partner API surface (`/api/v1/partner/*`)  
> **Authority:** Subordinate to `docs/MASTER-BACKEND-CONSTITUTION.md`, especially Configuration ownership in §19.

## Purpose

`GET /api/v1/partner/bootstrap` gives the Partner app the small set of startup decisions it needs before loading the next SDUI screen: maintenance state, app-update policy, startup feature switches, authentication state, and the next screen instruction.

Configuration owns these runtime product decisions. Partner business data such as KYC, jobs, payouts, profile details, availability, or service execution does **not** belong in this bootstrap document.

## Response flow

```text
GET /api/v1/partner/bootstrap
        ↓
partnerBootstrapRoutes
        ↓
PartnerBootstrapController
        ↓
GetPartnerBootstrapUseCase
        ↓
PartnerBootstrapSnapshot
        ↓
ResponseHelper.success(...)
        ↓
Final HTTP JSON
```

The final response has two ownership layers:

```json
{
  "success": true,
  "message": "Partner bootstrap completed",
  "data": {
    "config": {},
    "startup": {}
  },
  "traceId": "req-x"
}
```

- `success`, `message`, `data`, `traceId` are the common API envelope owned by `apps/api`.
- Everything inside `data` is the Partner bootstrap result owned by `domains/configuration`.

## Exact files to know

| Responsibility | Symbol | File |
| --- | --- | --- |
| Route | `partnerBootstrapRoutes` | `apps/api/src/surfaces/partner/routes/partner.bootstrap.routes.ts` |
| HTTP adapter | `PartnerBootstrapController` | `apps/api/src/surfaces/partner/controllers/partner.bootstrap.controller.ts` |
| Header validation | `partnerBootstrapHeadersSchema` | `apps/api/src/surfaces/partner/dto/partner.bootstrap.dto.ts` |
| Bootstrap contract | `PartnerBootstrapSnapshot`, `PartnerBootstrapDocument` | `domains/configuration/application/contracts/partner-bootstrap.ts` |
| Bootstrap creation/evaluation | `GetPartnerBootstrapUseCase` | `domains/configuration/application/use-cases/GetPartnerBootstrapUseCase.ts` |
| Config lookup/default handling | `ConfigProvider` | `domains/configuration/application/ConfigProvider.ts` |
| Database adapter | `PrismaConfigRepository` | `domains/configuration/infrastructure/repositories/PrismaConfigRepository.ts` |
| Common HTTP envelope | `ResponseHelper` | `apps/api/src/transport/response/ResponseHelper.ts` |

## How the configuration is resolved

`GetPartnerBootstrapUseCase` reads the configuration key:

```text
partner.bootstrap
```

Resolution is:

```text
SystemConfig row exists?
  YES → parse and use its JSON value
  NO  → use DEFAULT_PARTNER_BOOTSTRAP_DOCUMENT
```

The default document currently defines Android/iOS version policy, maintenance, Partner startup feature switches, guest login destination, and authenticated dashboard destination.

### Important persistence rule

`ConfigProvider` returns the persisted JSON document as a whole; it does **not** deep-merge a stored document with newly added default fields.

Therefore, when a new required persisted field is introduced, also plan how existing `partner.bootstrap` records will become compatible. Prefer an explicit version/migration/normalization strategy instead of silently changing old stored JSON.

## How to add a new Partner bootstrap field

Example: add `support` under `config`.

1. **Define ownership and contract** in `application/contracts/partner-bootstrap.ts`.
2. **Add the default/configurable value** to `DEFAULT_PARTNER_BOOTSTRAP_DOCUMENT` when it belongs in persisted startup configuration.
3. **Map/evaluate the field** in `GetPartnerBootstrapUseCase.execute()` so it appears in `PartnerBootstrapSnapshot`.
4. Update focused tests before treating the new contract as complete.

Do not add Partner bootstrap fields directly in the controller just to shape JSON. The controller adapts the application result to HTTP; it should not own bootstrap business/runtime policy.

## Common change guide

| Desired change | Primary owner/file |
| --- | --- |
| Add/change a field inside `data.config` or `data.startup` | `partner-bootstrap.ts` + `GetPartnerBootstrapUseCase.ts` |
| Change default maintenance/update/features/startup values | `GetPartnerBootstrapUseCase.ts` default document or persisted `partner.bootstrap` config |
| Change request headers | `partner.bootstrap.dto.ts`; pass needed values through `PartnerBootstrapRequest` |
| Change only `"Partner bootstrap completed"` | `PartnerBootstrapController` |
| Change `data` to `payload`, or alter global `success/message/traceId` format | `ResponseHelper` — global API change, not Partner-only |
| Change route path or method | `partner.bootstrap.routes.ts` |
| Change persistence lookup | `ConfigProvider` / `PrismaConfigRepository` only when Configuration persistence behavior itself changes |

### Current request note

`X-CarBroz-Build-Number` is currently validated at the Partner HTTP boundary but is not yet consumed by `GetPartnerBootstrapUseCase`. If build-number-based update policy is introduced later, add `buildNumber` to `PartnerBootstrapRequest` and pass it from the controller rather than reading HTTP data inside the Configuration use case.

## Architecture guardrails

- Keep Partner, Customer, and Admin contracts independently evolvable.
- Keep HTTP concerns in `apps/api`; keep bootstrap decisions in `domains/configuration`.
- Keep SDUI structure in the SDUI subsystem; bootstrap may only point to a next SDUI screen.
- Do not put Partner lifecycle/business payloads such as KYC, bookings, earnings, jobs, or profile data into generic startup configuration.
- Do not change `ResponseHelper` for a Partner-only response change.
- Extend existing contracts/providers before creating new configuration abstractions.

## Verification

Focused Partner bootstrap test:

```powershell
pnpm exec vitest run domains/configuration/tests/GetPartnerBootstrapUseCase.spec.ts
```

Configuration build:

```powershell
pnpm --filter @carbroz/domain-configuration build
```

API/DI regression when controller or composition wiring changes:

```powershell
pnpm exec vitest run apps/api/src/bootstrap/container/index.test.ts
pnpm --filter @carbroz/api build
```

Final repository freeze verification:

```powershell
pnpm test:freeze
```
