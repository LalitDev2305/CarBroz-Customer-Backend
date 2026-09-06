# CarBroz Backend V3 — Constitution-Frozen Architecture

This repository is a modular monolith built with TypeScript, Fastify, Prisma/PostgreSQL, Redis/BullMQ-ready platform adapters, and a strict Server-Driven UI boundary. **The normative architecture is `docs/MASTER-BACKEND-CONSTITUTION.md`; this README explains how that architecture executes in code.**

## Runtime flow: process start to response
1. `apps/api/src/bootstrap/server.ts` starts the process and calls `buildApp`.
2. `bootstrap/app.ts` creates Fastify, installs security, multipart, DI, request context, JWT/authorization, safe lifecycle logging, static assets and global error mapping.
3. `bootstrap/lifecycle/request-flow.plugin.ts` emits `http.request.started` and `http.request.completed` with correlation ID, route, surface, status and duration. It never receives raw bodies.
4. The request enters exactly one product surface: `/api/v1/partner/*`, `/api/v1/customer/*`, or `/api/v1/admin/*`. Surfaces do not import one another.
5. A route/controller validates transport input with Zod, resolves an application use case from DI, and maps the result to `transport/response/ResponseHelper`.
6. The use case lives in its owning bounded context, applies authorization/orchestration and calls domain repositories/ports. Domain rules remain inside entities/value objects/domain services.
7. Infrastructure adapters implement those inward ports. Prisma access stays inside the owning domain infrastructure; vendor APIs are under `platform/integrations`.
8. Errors rise to `transport/middleware/error-handler.ts`, which converts Foundation/application errors to stable API envelopes. Technical logs are emitted by `platform/observability`; business/security audit records are owned by `domains/audit`.

## Where to change or add something
- **New endpoint:** choose Partner/Customer/Admin first, add validation/route/controller under that surface, call an existing/new owning-domain use case. Never put a use case in API.
- **New business rule:** add it to the owning domain/application. Do not put it in a controller, provider, or shared bucket.
- **New repository query:** change the owning domain repository port, then its infrastructure adapter. Do not import Prisma into application/domain code.
- **New third-party provider:** define/extend the inward port in the owning domain, put the concrete vendor adapter in `platform/integrations`, and wire it only in `bootstrap/container`.
- **New SDUI component/schema primitive:** rendering/schema mechanics go to `sdui/ui-sdk`; draft/publish/version/scope lifecycle goes to `sdui/registry`. Admin manages SDUI but has no runtime SDUI scope.
- **New cross-domain interaction:** depend only on the other domain's `public/index.ts` application contract/event. Never deep-import another domain's internals.
- **New log:** emit a stable event name plus safe metadata. Never log OTPs, tokens, phones, emails, payment/KYC bodies, headers, or raw request/response payloads.

## API executable
### `apps/api/src/bootstrap`
`server.ts` owns process start; `app.ts` owns Fastify composition; `container` owns dependency wiring; `plugins` owns framework plugins; `lifecycle` owns technical request-flow hooks. No business logic belongs here. **Tests:** `pnpm vitest run apps/api/src/bootstrap tests/architecture/canonical-topology.policy.test.ts`.

### `apps/api/src/surfaces/{partner,customer,admin}`
Each surface owns only its routes/controllers/dto/validation mapping. Adding or changing a product API happens here after the business use case exists in a domain. **Tests:** `pnpm vitest run apps/api/src/surfaces tests/architecture/product-surface-isolation.policy.test.ts`.

### `apps/api/src/transport`
Framework mechanics shared by surfaces: middleware/guards/request context/error mapping/response plus shared auth and SDUI runtime adapters. This layer may translate; it may not decide business policy. **Tests:** `pnpm vitest run apps/api/src/transport tests/architecture/engineering-quality.policy.test.ts`.

### `apps/api/src/system`
Operational endpoints such as health checks only. **Tests:** `pnpm vitest run apps/api/src/system/health`.

## Bounded contexts and the tests to run while changing them
### Identity — `domains/identity`
Owns: Authentication, sessions, OTP/token/RBAC and actor authorization. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/identity tests/architecture/identity-common-boundary.policy.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Partner — `domains/partner`
Owns: Partner/profile/member/KYC lifecycle. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/partner tests/architecture/partner-common-boundary.policy.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Customer — `domains/customer`
Owns: Customer profile, address, garage and preferences. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/customer tests/architecture/customer-persistence-boundary.policy.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Catalog & Pricing — `domains/catalog-pricing`
Owns: Services, add-ons, pricing tiers and price calculation. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/catalog-pricing tests/integration/application/CatalogUseCases.spec.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Booking — `domains/booking`
Owns: Booking lifecycle/invariants; dispatch is explicitly not owned here. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/booking tests/integration/application/booking-use-cases.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Operations — `domains/operations`
Owns: Slots/capacity, dispatch, maps/location, tracking and service execution. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/operations tests/integration/application/tracking-notification-engine.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Financials — `domains/financials`
Owns: Payment, invoice/refund, payout, commission, tax, ledger and settlement. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/financials tests/integration/application/payment-engine-use-cases.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Communications — `domains/communications`
Owns: Notification templates/preferences/history and delivery orchestration. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/communications tests/integration/application/tracking-notification-engine.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Engagement — `domains/engagement`
Owns: Reviews/ratings, coupons, promotions and offers. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/engagement tests/integration/application/review-coupon-engine.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Configuration — `domains/configuration`
Owns: Persisted runtime/product configuration and feature policy. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/configuration tests/integration/application/GetInitConfigUseCase.spec.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Dispute — `domains/dispute`
Owns: Dispute lifecycle and settlement decisions. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/dispute tests/integration/application/dispute-engine.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Enterprise — `domains/enterprise`
Owns: B2B/corporate account concepts; financial records remain Financials. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/enterprise tests/integration/application/corporate-fleet-billing-engine.test.ts`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

### Audit — `domains/audit`
Owns: Immutable business/security audit evidence; not technical logs. Application classes are under `application/`; domain invariants under `domain/`; adapters under `infrastructure/`; cross-module callers use only `public/index.ts`. To add behavior, add the use case in this owner, declare any needed port inward, implement the adapter outward, export only the deliberate contract, register it in `apps/api/src/bootstrap/container`, then expose it from the correct surface.

**Tests for this owner:** `pnpm vitest run domains/audit`. For one class use `pnpm vitest run <path-to-nearest-spec> -t "<test name>"`.

## SDUI
### `sdui/ui-sdk`
Owns the six-level SDUI schema/rendering vocabulary and validation/build mechanics; it does not own persistence/lifecycle. **Tests:** `pnpm vitest run sdui/ui-sdk tests/architecture/sdui-authority.policy.test.ts tests/architecture/sdui-mapping.contract.test.ts`.

### `sdui/registry`
Owns draft/update/publish/archive/version history/compare/rollback/checksum and runtime scope resolution. Runtime scopes are exactly GLOBAL/PARTNER/CUSTOMER. **Tests:** `pnpm vitest run sdui/registry tests/architecture/sdui-registry-domain.test.ts tests/architecture/sdui-production-definitions.policy.test.ts`.

## Platform
`platform/database` owns Prisma connectivity/transaction mechanics, `cache` Redis/cache mechanics, `messaging` queue/event transport, `storage` object storage, `observability` logs/traces/metrics, and `integrations` external vendor adapters. Platform code never becomes a business-rule owner. **Tests:** run `pnpm vitest run platform tests/architecture/domain-dependency.policy.test.ts` after platform changes.

## Logging and debugging the complete flow
Search logs by `correlationId`. Normal request flow is `http.request.started` → surface/controller → application operation → `http.request.completed`; failures include the stable error code but not payloads. Add new application-flow events through `@carbroz/platform-observability` using stable names such as `booking.create.started` / `booking.create.completed`. Redaction is centralized in `platform/observability/src/index.ts` and is mandatory.

## Test commands used as the architecture gate
During development run the command printed beside the module above. Before merge, the complete forensic gate is: `pnpm install --frozen-lockfile && pnpm exec prisma validate && pnpm exec prisma generate && pnpm -r build && pnpm lint && pnpm test -- --run`. Architecture-only evidence: `pnpm vitest run tests/architecture`. Contract evidence: `pnpm vitest run tests/contracts`. Integration evidence: `pnpm vitest run tests/integration`. Never waive a failing architecture test to merge a feature.

## New-developer reading order
Read `docs/MASTER-BACKEND-CONSTITUTION.md`, then this README, then `apps/api/src/bootstrap/app.ts`, `bootstrap/container/index.ts`, the target surface route/controller, the owning domain `public/index.ts`, its application use case, domain entity/service and finally the infrastructure adapter. That sequence mirrors the runtime dependency direction and is the fastest way to understand a feature without accidentally crossing a boundary.

## Canonical SDUI composition

The minimum structural composition is **Template -> Component -> Element**. Optional Section and Group levels may be inserted only where the canonical UI SDK schema allows them.

## Final validation gate

Before merge or architecture freeze run `pnpm install --frozen-lockfile`, Prisma validation/generation, `pnpm -r build`, `pnpm lint`, `pnpm test -- --run`, and finally `pnpm test:freeze`.
