# CarBroz Backend V3 Master Constitution

**Status:** Normative architecture source of truth  
**Applies to:** Customer, Partner, Admin, API, domains, SDUI, platform, data, security, tests, tooling  
**Branch:** `architecture/backend-v3-clean`

---

## 1. Authority

This document is the single normative architecture source of truth for CarBroz Backend V3. Production code, tests, package layout, dependency direction, API behavior, persistence, SDUI contracts, security, observability and tooling MUST conform to it.

Implementation and tests are the evidence of compliance. Names such as factory, builder, repository, clean architecture, provider, SDK or unit of work are not evidence by themselves.

No competing architecture document may redefine these rules. Historical audit/design/phase documents are migration input only and MUST NOT survive as parallel architecture authorities.

When implementation evidence proves a rule incomplete or wrong, the sequence is: document evidence, intentionally amend this constitution, add/update enforcement tests, then change production code.

---

## 2. Architectural style

CarBroz Backend V3 is a modular monolith using DDD bounded contexts, Clean/Hexagonal Architecture, Dependency Inversion, Ports and Adapters, explicit application use cases, event-driven readiness, PostgreSQL, Prisma as infrastructure, Fastify as transport, Zod at runtime boundaries, and a pnpm workspace.

Microservices are not the current deployment model. Boundaries MUST remain independently testable and extractable.

---

# PART I — FROZEN PHYSICAL REPOSITORY TAXONOMY

## 3. Final canonical top-level structure

The final physical structure is frozen as follows. A top-level source category not listed here MUST NOT be introduced without first amending this constitution.

```text
carbroz-backend/
│
├── apps/
│   └── api/
│
├── domains/
│   ├── identity/
│   ├── customer/
│   ├── partner/
│   ├── catalog/
│   ├── booking/
│   ├── operations/
│   ├── financials/
│   ├── communications/
│   ├── engagement/
│   ├── configuration/
│   ├── enterprise/
│   └── audit/
│
├── sdui/
│   ├── ui-sdk/
│   └── registry/
│
├── platform/
│   ├── database/
│   ├── cache/
│   ├── messaging/
│   ├── storage/
│   ├── observability/
│   └── integrations/
│
├── foundation/
│   └── kernel/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
├── tests/
│   ├── architecture/
│   ├── contracts/
│   ├── integration/
│   └── e2e/
│
└── docs/
    └── MASTER-BACKEND-CONSTITUTION.md
```

The final repository MUST NOT contain top-level `packages/`, `shared/`, `libs/`, `common/`, generic `sdk/`, generic `utils/`, duplicate kernels, duplicate UI SDKs, duplicate business repositories, or duplicate business module trees.

`packages/` is intentionally removed from the final taxonomy because it is an ambiguous catch-all. Reusable code has exactly one explicit owner: universal primitives in `foundation`, SDUI vocabulary/runtime composition in `sdui`, technical capabilities in `platform`, or business capability in its owning `domain`.

## 4. Category decision rule

Every source file and workspace package MUST answer one of these questions unambiguously:

- **apps** — Is this an executable/deployment entry point or transport/composition root?
- **domains** — Is this CarBroz business behavior, policy, state or persistence for a bounded context?
- **sdui** — Is this canonical server-driven UI vocabulary/composition or SDUI publish/version lifecycle?
- **platform** — Is this reusable technical infrastructure with no CarBroz business ownership?
- **foundation** — Is this truly universal domain-independent primitive code?
- **prisma** — Is this canonical database schema/migration/seed material?
- **tests** — Is this cross-boundary architecture/contract/integration/E2E verification?
- **docs** — Is this the single normative architecture document or non-competing operational documentation?

If ownership is unclear, implementation MUST stop until ownership is resolved. `common`, `shared`, `helpers`, `utils`, and generic `packages` are not acceptable answers.

## 5. Workspace rule

Final pnpm workspace roots are only:

```yaml
apps/*
domains/*
sdui/*
platform/*
foundation/*
```

Business submodules inside one bounded context are normal source folders, not separate workspace packages by default. A new workspace is permitted only when it represents a true top-level bounded context, SDUI subsystem package, technical platform capability, foundation package, or executable app.

Package explosion is forbidden. One entity, feature, repository, or use case does not justify a new workspace package.

---

# PART II — BUSINESS BOUNDED CONTEXTS

## 6. Domain ownership

### 6.1 Identity
Owns User, Session, authentication, OTP challenge lifecycle, access/refresh token policy, roles, permissions, authorization policy and device sessions.

### 6.2 Customer
Owns CustomerProfile, preferences, addresses, customer-owned vehicles/garage and customer profile state.

Final consolidation examples:

```text
domains/address          → domains/customer/address
domains/customer-profile → domains/customer/profile
domains/garage           → domains/customer/garage
```

### 6.3 Partner
Owns Partner, PartnerProfile, individual/organization partner concepts, PartnerMember, partner roles, KYC, verification, capabilities, declared availability and leave policy.

Final consolidation examples:

```text
domains/partner-profile → domains/partner/profile
domains/partner-kyc     → domains/partner/kyc
```

### 6.4 Catalog
Owns ServiceCategory, Service, ServiceAddon, catalog configuration, service pricing rules/configuration, vehicle/service multipliers and tax classification metadata.

Legacy standalone pricing packages are consolidated under Catalog unless a financial ledger/settlement rule proves Financials ownership.

### 6.5 Booking
Owns Booking aggregate, booking lifecycle/state machine, immutable snapshots, cancellation rules and booking invariants. Booking does NOT own capacity, dispatch or tracking.

### 6.6 Operations
Owns slot inventory, availability, capacity, partner assignment, dispatch, radius/travel feasibility, partner workload, tracking sessions, ETA policy and service execution workflow.

Legacy standalone tracking/slot/dispatch packages consolidate here.

### 6.7 Financials
Owns payment, invoice, refund, payout, commission, tax calculation application policy, ledger, settlement and payment webhooks.

Final internal feature organization may include:

```text
financials/payment
financials/invoice
financials/refund
financials/payout
financials/commission
financials/ledger
financials/settlement
```

These are internal modules, not separate workspace packages by default.

### 6.8 Communications
Owns notification domain concepts: DeviceToken, Notification, NotificationTemplate, NotificationPreference, DeliveryLog and channel policy. Concrete Firebase/SMS/email vendor adapters belong under `platform/integrations`.

### 6.9 Engagement
Owns reviews, ratings, coupons, promotions, offers and engagement policy.

Legacy standalone review/coupon packages consolidate here.

### 6.10 Configuration
Owns persisted business/runtime configuration such as maintenance mode, supported app versions, forced-update policy, remote operational flags, feature rollout, bootstrap decisions and startup routing configuration. Environment/secrets are not owned here.

### 6.11 Enterprise
Owns B2B/corporate customer concepts whose lifecycle is distinct from an individual customer: CorporateAccount, organization members, corporate fleet enrollment and corporate booking/credit eligibility policy. Financial ledgers, invoices, settlement and payment accounting remain Financials responsibilities even when initiated by Enterprise flows.

### 6.12 Audit
Owns immutable business/security audit records and actor/action semantics.

## 7. Standard internal domain structure

A bounded context uses only folders with real responsibilities:

```text
domains/<context>/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── services/
│   └── repositories/
├── application/
│   ├── commands/
│   ├── queries/
│   ├── use-cases/
│   ├── dto/
│   └── ports/
├── infrastructure/
│   ├── persistence/
│   ├── mappers/
│   └── adapters/
├── presentation/
├── composition/
├── public/
├── tests/
├── package.json
└── tsconfig.json
```

Subfeatures such as `partner/kyc` or `financials/payment` may repeat domain/application/infrastructure layers locally only when complexity justifies it. Empty ceremonial folders are forbidden.

Domain entities and repository ports belong to their bounded context, never to a global common package.

---

# PART III — SDUI SUBSYSTEM

## 8. SDUI is a first-class subsystem

Everything fundamentally belonging to SDUI starts under top-level `sdui/`. SDUI MUST NOT be split between generic `packages/` and `domains/` roots.

Exactly two SDUI workspace packages are canonical:

```text
sdui/
├── ui-sdk/      generic structural/composition SDK
└── registry/    SDUI draft/publish/version persistence lifecycle
```

The final package identities are:

```text
@carbroz/ui-sdk
@carbroz/sdui-registry
```

No second UI SDK, `sdui-engine`, UI schema package, API-local SDUI DTO hierarchy or domain-local duplicate structural contract may exist after migration.

## 9. `sdui/ui-sdk` responsibility

`ui-sdk` is the one canonical generic SDUI language and composition toolkit. It owns runtime schemas, reusable definitions, registries, factories, builders, validation, serialization and schema versioning.

```text
sdui/ui-sdk/
├── contract/
│   ├── screen/
│   ├── template/
│   ├── component/
│   ├── section/
│   ├── group/
│   ├── element/
│   ├── action/
│   ├── theme/
│   └── properties/
├── definitions/
│   ├── templates/
│   ├── components/
│   ├── sections/
│   ├── groups/
│   └── elements/
├── registry/
├── factory/
├── builder/
├── validator/
├── serializer/
├── versioning/
├── public/
└── tests/
```

The currently valid capability in `packages/sdui-engine` MUST be moved here; it MUST NOT be independently reimplemented.

## 10. `sdui/registry` responsibility

`registry` owns SDUI business/runtime lifecycle only: screen metadata, drafts, publish, immutable versions, rollback, target application, persistence, checksums and version history. It consumes `@carbroz/ui-sdk`; it never redefines UI structure or composition mechanics.

```text
sdui/registry/
├── domain/
├── application/
├── infrastructure/
├── composition/
├── public/
└── tests/
```

The current `domains/sdui-registry` MUST migrate here.

## 11. Canonical SDUI hierarchy

Template and Component are mandatory. Element is the terminal structural leaf. Section and Group are optional.

Every Component independently selects exactly one legal branch:

```text
Template → Component → Element
Template → Component → Section → Element
Template → Component → Section → Group → Element
```

A single Template may mix these shapes across different Components.

Rules:

- Template contains a non-empty Component array.
- Every Component resolves transitively to at least one Element.
- Component chooses Elements OR Sections, never both.
- Section chooses Elements OR Groups, never both.
- Component cannot contain Group directly.
- Template cannot contain Section/Group/Element directly.
- Group contains Elements only.
- Element cannot own structural descendants.
- Skipped levels are omitted, not represented by null/empty placeholders.
- Selected structural arrays are non-empty.
- Multiple Components, Sections, Groups and Elements are supported.
- Legacy `Subcomponent`, `Child`, `ChildrenData`, `subComponents`, `children`, `childrenData`, `addSubcomponent`, `addChild` and `addChildData` are forbidden and MUST NOT return.

## 12. Reusable definition vs instance vs runtime data

Reuse is mandatory as a first-class capability at Template, Component, Section, Group and Element levels.

The SDK distinguishes:

1. **Definition/type** — immutable reusable structure/semantics, e.g. `form_template`, `profile_header`, `primary_button`.
2. **Instance/id** — one concrete usage, e.g. `login_continue_button`.
3. **Runtime data/overrides** — permitted instance values such as text, image, action, enabled state, labels and layout/property overrides.

`type` identifies reusable behavior/structure. `id` identifies the concrete usage. They are not interchangeable.

The same definition may be reused by Login, Dashboard, Booking or another screen with different IDs/data. Reuse is by configuration; a new definition is introduced only when structure or semantics genuinely differ. Arbitrary mutation that destroys definition meaning is forbidden.

## 13. Definition registration workflow

Adding a reusable SDUI type follows one workflow:

```text
create definition → register canonical type → instantiate with factory → compose with builder → validate → serialize
```

Registries exist independently for Template, Component, Section, Group and Element. Duplicate registration and unknown type resolution fail deterministically. Runtime filesystem scanning/dynamic discovery is forbidden.

## 14. Factory and builder responsibility

Factories create one validated instance from a registered definition plus instance input/runtime data. Canonical factories are TemplateFactory, ComponentFactory, SectionFactory, GroupFactory and ElementFactory.

Builders compose legal trees and enforce hierarchy invariants during construction. Canonical builders include ScreenBuilder, TemplateBuilder, ComponentBuilder, SectionBuilder and GroupBuilder.

Builders use only `addComponent`, `addSection`, `addGroup`, `addElement` vocabulary. A ComponentBuilder that selected direct Elements rejects Sections and vice versa. A SectionBuilder that selected direct Elements rejects Groups and vice versa.

## 15. Screen-specific composers

Business-specific screens do not live inside the generic UI SDK. Screen composers belong to the owning business context presentation/composition layer and only select registered definitions plus runtime data.

Examples:

```text
domains/identity/composition/sdui/LoginScreenComposer
domains/customer/composition/sdui/DashboardScreenComposer
```

A screen composer MUST NOT redefine how `primary_button`, `profile_header`, `form_template`, etc. structurally work.

## 16. SDUI persistence/versioning

Published SDUI is an immutable versioned document stored in PostgreSQL JSONB after canonical validation. Published metadata includes screenId, targetApp, schemaVersion, version, templateId, templateType, document JSON, checksum, status and creation/publish metadata.

```text
Domain Screen Composer / Admin Editor
→ @carbroz/ui-sdk builder/factory
→ canonical validator
→ Draft
→ Publish
→ Immutable Version
→ PostgreSQL JSONB
→ validated read
→ Client
```

Corrupted published documents are observable contract failures, not silent static fallbacks. `targetApp` is finite: CUSTOMER, PARTNER, ADMIN.

---

# PART IV — FOUNDATION, PLATFORM AND APP

## 17. Foundation kernel

Exactly one kernel exists: `foundation/kernel` / `@carbroz/foundation-kernel`.

It may own only truly universal primitives such as Entity/AggregateRoot/ValueObject, DomainEvent, Result/error primitives, Money, Clock/ID ports, pagination, actor identity and universal transaction contracts.

It MUST NOT own User, Customer, Partner, Booking, Payment, Coupon, Review, Address, KYC, SDUI models or other CarBroz business concepts. `shared/kernel` MUST be consolidated into foundation and deleted.

## 18. Platform ownership

Platform owns technology, not business.

### database
Prisma client lifecycle, connection health, transaction infrastructure and database-level utilities only. Business repositories belong in domain infrastructure.

### cache
Technical cache client/lifecycle/adapters only.

### messaging
Technical event bus, queue, outbox delivery infrastructure and message transport. Current `platform/event-bus` and `platform/queue` consolidate here.

### storage
Technical object/blob storage adapters and lifecycle only.

### observability
Logging, tracing, metrics and technical diagnostics.

### integrations
Concrete external-vendor adapters grouped by capability, for example maps, payment gateways, SMS, email, push and remote feature-flag vendors. Domains depend on ports, never vendor implementations.

Final platform MUST NOT have business-named repositories such as PrismaBookingRepository, PrismaPaymentRepository, PrismaReviewRepository or PrismaKycDocumentRepository.

## 19. API application

Final executable application is `apps/api` / `@carbroz/api`. Current `apps/backend-api` MUST be renamed/migrated to this canonical path.

It owns only Fastify creation/server lifecycle, request context, middleware/plugins/guards, error-to-HTTP mapping, route composition, dependency composition/bootstrap, readiness and graceful shutdown.

It MUST NOT own CarBroz business use cases, entities, state machines, repositories, SDUI contracts or SDUI definition implementations.

Public product APIs use `/api/v1/...`. Every route declares explicit access policy.

---

# PART V — CROSS-CUTTING ARCHITECTURE LAWS

## 20. Dependency law

Canonical inward direction:

```text
foundation
    ↑
domain
    ↑
application
    ↑
infrastructure adapters
    ↑
presentation / composition / transport
```

Domain code MUST NOT import Fastify, Prisma, Redis, Awilix, vendor SDKs, filesystem APIs, `process.env` or concrete platform infrastructure. Application depends on domain + declared ports, not concrete infrastructure. Infrastructure implements ports.

Cross-domain dependencies use explicit public contracts/application services/events, never another context's internal files.

Architecture tests MUST enforce dependency direction and cycles.

## 21. Persistence and transactions

Business Prisma repositories belong in their owning domain infrastructure. `platform/database` MUST NOT export or register them.

A transaction is valid only when all repository operations inside the callback use the same underlying database transaction. Critical flows require real PostgreSQL rollback tests. Passing a transaction client that repositories ignore is forbidden.

## 22. Events and outbox

Cross-domain side effects SHOULD use versioned domain events and a transactional outbox rather than deep synchronous repository coupling. Domain change + outbox insertion must commit atomically when required. Delivery is retryable and idempotent.

## 23. Money and financial invariants

Money is integer minor units + currency; INR uses paise. Floating-point monetary storage/arithmetic is forbidden. Pricing produces immutable/versioned quotation snapshots. Ledger, payout, refund and settlement invariants require tests.

## 24. Booking and operations invariants

Booking owns booking state. Operations owns capacity, availability, dispatch, tracking and execution. Slot reservation must be concurrency-safe. Booking state transitions are explicit and encapsulated. Business-time policy uses a Clock abstraction.

## 25. Authentication/session security

Production OTP requires cryptographically secure generation, hash-at-rest, expiry, attempt limits, resend cooldown, one-time consumption, challenge+phone binding, rate limiting and provider abstraction. Production bootstrap rejects mock/development OTP modes.

Refresh tokens require cryptographic strength, rotation, expiry, revocation, session/device binding and reuse detection. Token policy is centralized. OTPs, access/refresh tokens, authorization headers and secrets are never logged.

## 26. Authorization/resource ownership

Transport authorization and resource ownership are separate checks. User-owned resources validate actor ownership or explicit permission. External APIs prefer public UUID-like identifiers over internal autoincrement IDs.

## 27. Error architecture

Expected business failures use typed error categories and MUST NOT accidentally become HTTP 500. HTTP mapping occurs at transport. Clients receive stable safe codes/details; internal stack/infrastructure details are never exposed.

## 28. Configuration

Secrets/environment configuration and persisted business configuration are separate. Reusable configuration code does not call `process.exit()` during import. Only `.env.example` is the general committed template. Production rejects known unsafe/default credentials and development-only provider modes.

## 29. Observability/PII

Logs default to metadata, not payload dumps. OTP/token/auth headers, sensitive contact/address/coordinates/KYC/payment/vendor secrets are omitted or redacted. Meaningful provider failures cannot disappear in silent catches.

---

# PART VI — MIGRATION CLASSIFICATION

## 30. Existing package migration map

Every current legacy workspace/package is classified before further feature development. Migration does not create compatibility duplicates.

```text
CURRENT                                      FINAL TARGET                                   ACTION
apps/backend-api                             apps/api                                       MOVE + RENAME
packages/sdui-engine                         sdui/ui-sdk                                     MOVE + RENAME
packages/common                              owning domain/foundation/platform               SPLIT + DELETE
packages/config                              app bootstrap/platform or configuration domain  SPLIT + DELETE
shared/kernel                                foundation/kernel                              MERGE + DELETE

domains/address                             domains/customer/address                        MERGE
domains/customer-profile                    domains/customer/profile                        MERGE
domains/garage                              domains/customer/garage                         MERGE

domains/partner-profile                     domains/partner/profile                         MERGE
domains/partner-kyc                         domains/partner/kyc                             MERGE

domains/pricing                             domains/catalog/pricing                         MERGE
domains/tracking                            domains/operations/tracking                     MERGE
domains/payment                             domains/financials/payment                      MERGE
domains/invoice                             domains/financials/invoice                      MERGE
domains/payout                              domains/financials/payout                       MERGE
domains/notification                        domains/communications                          MERGE
domains/review                              domains/engagement/review                       MERGE
domains/coupon                              domains/engagement/coupon                       MERGE
domains/config                              domains/configuration                           MOVE + RENAME
domains/dispute                             owning context after business-rule audit         CLASSIFY BEFORE MOVE
domains/sdui-registry                       sdui/registry                                   MOVE

platform/event-bus                          platform/messaging/event-bus                    MERGE
platform/queue                              platform/messaging/queue                        MERGE
platform/feature-flags                      configuration/integrations after responsibility  CLASSIFY BEFORE MOVE
platform/notification                       platform/integrations/notification              MERGE
platform/database business repositories     owning domains                                  MOVE + DELETE DUPLICATES
```

Existing canonical packages such as `domains/identity`, `domains/booking`, `domains/catalog`, `domains/audit`, `platform/cache`, `platform/database`, `platform/storage`, `platform/observability` and `foundation/kernel` are retained but must still be audited for internal ownership violations.

No new feature development should introduce additional legacy package shapes while this migration is active.

## 31. Migration order

Physical classification and structure take priority over further feature work. Migration order is frozen:

1. Freeze this taxonomy and architecture guardrails.
2. Move SDUI to `sdui/ui-sdk` + `sdui/registry` without capability duplication.
3. Rename/move `apps/backend-api` to `apps/api` after its business logic is progressively evacuated.
4. Consolidate Customer fragments into `domains/customer`.
5. Consolidate Partner fragments into `domains/partner`.
6. Consolidate Operations fragments.
7. Consolidate Financials fragments.
8. Consolidate Communications and Engagement fragments.
9. Consolidate Configuration/Enterprise/Audit ownership.
10. Collapse Platform to technical capabilities only.
11. Eliminate `packages/common`, `packages/config`, `shared/kernel`, tracked generated output and all transitional compatibility structure.
12. Enable strict topology enforcement requiring 100% physical match.

Each move must preserve behavior through tests and must delete the superseded source in the same controlled migration block once all consumers are updated.

---

# PART VII — TESTING, ENFORCEMENT AND FREEZE

## 32. Testing policy

All executable CarBroz production TypeScript targets final merge coverage of 100% statements, branches, functions and lines. Generated/type-only/barrel files are validated by build/architecture checks rather than fake coverage. Exclusions cannot be added merely to reach a number.

Required layers include unit, domain invariant, state-machine, use-case, repository contract, real Prisma/PostgreSQL integration, rollback/concurrency, HTTP/auth/authz, provider adapter, SDUI contract/definition/factory/builder/serialization/versioning, configuration, error, architecture, security and critical E2E tests.

## 33. Mandatory SDUI tests

Tests MUST cover all three legal hierarchy branches, mixed component shapes, multiples at every level, illegal mixed/empty branches, illegal skipped relationships, structural descendants under Element, duplicate IDs, invalid targetApp/schema version, malformed actions/properties, unknown/duplicate definitions, factory validation, builder invariants, serialization round-trip and reuse of one definition with different IDs/runtime data.

## 34. Architecture enforcement

Architecture checks MUST fail on:

- forbidden domain technology imports;
- API-owned business logic;
- platform-owned business repositories;
- multiple SDUI authorities;
- reintroduced generic common/shared/package architecture;
- unclassified new workspace packages;
- duplicate responsibilities;
- dependency cycles;
- legacy SDUI structural vocabulary;
- tracked generated output;
- architecture scans treating `dist`/generated files as source.

During migration, explicitly listed legacy paths in Section 30 may temporarily exist. They are a closed allowlist, not precedent. New legacy paths are forbidden. After migration, strict topology mode removes the allowlist and requires exact final structure.

## 35. Generated artifacts/source control

Normal generated output is not source. Final V3 MUST NOT track `**/dist/**`, `**/*.tsbuildinfo`, emitted JS/declarations/maps from TypeScript builds or coverage output. A clean validation build must not leave unintended tracked changes.

## 36. Final freeze criteria

Backend V3 is not merge-ready until all are true:

- physical repository matches Section 3 exactly;
- workspace roots match Section 5 exactly;
- no top-level `packages` or `shared` remains;
- exactly one foundation kernel;
- exactly one SDUI UI SDK and one SDUI registry lifecycle package;
- no global business God package;
- no platform-owned business repositories;
- no API-owned business use cases;
- no tracked normal build output;
- no legacy SDUI hierarchy;
- secure auth/session design;
- real transaction propagation proven by rollback tests;
- no forbidden dependency cycles/imports;
- expected errors map safely;
- required test layers are green;
- executable production coverage is 100/100/100/100;
- fresh install/build/test succeeds;
- Git working tree is clean after validation.

Architecture drift by convenience is forbidden.
