# CarBroz Backend V3

CarBroz Backend V3 is a **TypeScript + Fastify modular monolith** organized around Domain-Driven Design, Clean/Hexagonal Architecture, strict dependency inversion, replaceable infrastructure providers, and a generic Server-Driven UI runtime for the Partner and Customer applications.

> **Normative authority:** [`docs/MASTER-BACKEND-CONSTITUTION.md`](docs/MASTER-BACKEND-CONSTITUTION.md) is the repository's architecture law. This README is an operating guide; when it conflicts with the Constitution, the Constitution wins.

## Architecture at a glance

The final production source tree is intentionally small at the top level:

```text
apps/
  api/
domains/
  identity/
  partner/
  customer/
  catalog-pricing/
  booking/
  operations/
  financials/
  communications/
  engagement/
  configuration/
  dispute/
  enterprise/
  audit/
sdui/
  ui-sdk/
  registry/
platform/
  database/
  cache/
  messaging/
  storage/
  observability/
  integrations/
foundation/
  kernel/
prisma/
tests/
  architecture/
  contracts/
  integration/
  e2e/
docs/
```

There is no final `packages/`, `shared/`, generic business `common`, duplicate kernel, or duplicate SDUI engine. `apps/api` is the **transport and composition root only**: HTTP validation, authentication/authorization guards, request/response mapping, lifecycle hooks, and dependency wiring live there; business use cases and business repositories do not.

## Product surfaces

The API has three independently evolvable transport families:

```text
/api/v1/partner/*
/api/v1/customer/*
/api/v1/admin/*
```

Partner and Customer are independent client products. Admin is an operational/control-plane surface that invokes the owning bounded-context capabilities; it is not a third business bounded context and is not a third SDUI product scope.

Cross-surface transport imports are forbidden. Shared behavior belongs in the bounded context that owns the business rule, not in a transport-common application layer.

## Bounded-context ownership

| Context | Owns |
| --- | --- |
| Identity | users, sessions, OTP/auth lifecycle, token/session policy, authorization contracts |
| Partner | partner profile/organization, KYC, verification, training, availability, partner lifecycle |
| Customer | customer profile/preferences, addresses, garage and vehicle ownership |
| Catalog-Pricing | service catalog, add-ons, pricing tiers/multipliers and price policy |
| Booking | booking aggregate, immutable booking snapshots, lifecycle state machine and cancellation invariants |
| Operations | slot capacity/feasibility, dispatch/assignment, tracking, ETA and service execution operations |
| Financials | payment/refund/invoice/payout lifecycle, commission/tax/settlement policy and financial invariants |
| Communications | notification intent/orchestration, device tokens, delivery records and communication ports |
| Engagement | reviews, ratings, coupons, promotions and offers |
| Configuration | persisted product/runtime configuration, bootstrap/update/maintenance decisions and rollout policy |
| Dispute | dispute aggregate, reasons/status, resolution and settlement decision semantics |
| Enterprise | corporate accounts/members, corporate fleet and corporate credit/booking eligibility |
| Audit | immutable business/security audit semantics and persistence contract |

A context may consume another context only through its approved public contract/application boundary or an explicit port/event. Deep cross-domain imports are not a supported integration mechanism.

## Foundation and Platform

`foundation/kernel` is the **only** universal kernel. It contains domain-independent primitives such as Money, universal results/errors, execution actor/context contracts, transaction/time/id abstractions, and similarly universal building blocks. It must not become a feature helper package.

`platform/*` owns technology mechanics only: Prisma/database capability, cache, queue/event transport, object storage, observability, and concrete vendor integrations. Business repositories remain owned by their bounded contexts. Vendor SDK models must stop at adapters and must not leak into domain/application contracts.

## SDUI architecture

There are exactly two SDUI workspaces:

- `@carbroz/ui-sdk` — canonical generic structural vocabulary, definitions, builders/factories, validation, serialization and schema-version mechanics.
- `@carbroz/sdui-registry` — draft/publish/version/history/rollback/archive/scope/persistence/checksum lifecycle for validated UI SDK structures.

The only legal structural branches are:

```text
Template -> Component -> Element
Template -> Component -> Section -> Element
Template -> Component -> Section -> Group -> Element
```

`Component` and `Element` are mandatory. `Section` and `Group` are optional. Legacy `Subcomponent`, `Child`, and `ChildrenData` hierarchy terminology is not part of Backend V3.

Runtime definitions are scoped `GLOBAL`, `PARTNER`, or `CUSTOMER`. Published definitions/versions are immutable and independently adoptable by Partner and Customer. Product screen names belong in runtime data/definitions, not source-code architecture folders.

## Core production invariants

- Money is integer **minor units + currency**; floating-point business money is forbidden.
- UTC is the canonical persistence/service time basis; time-sensitive policy should depend on a clock abstraction where determinism matters.
- Booking owns booking lifecycle; Operations owns capacity, assignment and live service execution.
- Financial effects require idempotent/transaction-safe behavior where duplication is possible.
- Transactions are valid only when all participating writes share the same underlying database transaction.
- OTP generation/storage/verification, refresh-token rotation/revocation/reuse detection, resource ownership checks and authorization are security boundaries, not controller conveniences.
- OTPs, access/refresh tokens, Authorization headers, secrets and sensitive PII must never be logged.
- Business Audit records and technical observability are separate concepts.
- Expected errors are typed/mapped safely; internal details are not leaked through HTTP responses.

## Testing and architecture enforcement

The final merge target for executable production TypeScript is **100% statements, branches, functions and lines**. Type-only/barrel/generated artifacts are validated by build/architecture checks rather than fake coverage.

Required evidence includes unit tests, domain invariant/state-machine tests, use-case tests, repository contracts, real Prisma/PostgreSQL integration, rollback/concurrency/idempotency, HTTP auth/authz, provider contracts, SDUI contract/definition/factory/builder/serialization/versioning tests, configuration/error/security/architecture tests and critical E2E flows.

Each module README generated during architecture validation inventories that module's ownership, source/classes, public API, existing executable tests, required positive/negative/regression matrix and extension/provider boundaries. Passing coverage does not permit deleting meaningful failure tests or adding exclusions merely to reach a number.

## Local validation

The repository uses the pinned pnpm version through Corepack. A production-equivalent validation flow is:

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile

pnpm exec prisma validate
pnpm exec prisma generate
pnpm exec prisma migrate deploy

pnpm -r build
pnpm lint
pnpm test
pnpm test:freeze
```

`DATABASE_URL` must point to PostgreSQL for migration/integration evidence. Do not substitute an in-memory fake when validating transaction rollback or Prisma repository behavior.

## Continuous integration

Permanent CI is expected to enforce a frozen lockfile, Prisma validation/generation/migrations against PostgreSQL, monorepo build/lint/tests, architecture/security policies and the production coverage freeze. A clean validation run must not leave tracked build artifacts (`dist`, `*.tsbuildinfo`, emitted JS/declarations/maps, coverage output) behind.

## Documentation map

Start with these documents before changing architecture:

- [`docs/MASTER-BACKEND-CONSTITUTION.md`](docs/MASTER-BACKEND-CONSTITUTION.md) — normative architecture and freeze criteria.
- [`docs/TESTING-EXTENSIBILITY-AND-PROVIDER-STANDARD.md`](docs/TESTING-EXTENSIBILITY-AND-PROVIDER-STANDARD.md) — positive/negative test evidence, provider contracts, resilience and extension rules.
- [`docs/ENGINEERING-DOCUMENTATION-STANDARD.md`](docs/ENGINEERING-DOCUMENTATION-STANDARD.md) — source/module documentation expectations.
- [`docs/FORENSIC-CHANGE-GATE.md`](docs/FORENSIC-CHANGE-GATE.md) — forensic change-review gate.

## Feature gate after freeze

Before implementing a feature, establish: which product surface owns the transport, which bounded context owns the business rule, whether the response is SDUI or ordinary JSON, the SDUI scope/version impact if applicable, any cross-domain dependency and its public port/event, the required Admin capability, and the architecture regression test that prevents drift.

**Final principle:** Partner-specific change stays Partner-specific; Customer-specific change stays Customer-specific; Admin manages both through their owning capabilities; genuinely shared concepts remain product-neutral; dynamic UI stays generic, runtime-driven, scoped and immutable after publication.
