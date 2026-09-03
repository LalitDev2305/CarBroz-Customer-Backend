# CarBroz Backend V3 Master Constitution

**Status:** Normative architecture source of truth  
**Applies to:** Partner, Customer, Admin, API, domains, SDUI, platform, data, security, tests, tooling  
**Branch:** `architecture/backend-v3-clean`

---

## 1. Authority and mandatory session gate

This document is the single normative architecture source of truth for CarBroz Backend V3. Production code, tests, package layout, dependency direction, API behavior, persistence, SDUI contracts, security, observability and tooling MUST conform to it.

Implementation and tests are the evidence of compliance. Names such as factory, builder, repository, clean architecture, provider, SDK or unit of work are not evidence by themselves.

No competing architecture document may redefine these rules. Historical audit/design/phase documents, conversation memory, handovers, prompts and previous agent summaries are migration/context input only and MUST NOT override this file.

### Mandatory pre-change gate

Before ANY architecture-sensitive refactor or feature implementation, every ChatGPT session, coding agent, Antigravity session or human developer MUST:

1. Read `docs/MASTER-BACKEND-CONSTITUTION.md` from the active development branch.
2. Confirm the requested change fits the canonical ownership model in this document.
3. Identify the owning bounded context and the consuming API surface.
4. Confirm Partner, Customer and Admin isolation remains valid.
5. Confirm dependency direction and public-boundary rules remain valid.
6. Confirm SDUI scope/versioning rules remain valid if UI contracts are involved.
7. Check existing implementation evidence before creating a duplicate abstraction.
8. Only then change production code.

If a requested change conflicts with this constitution, implementation MUST STOP. The sequence is: document evidence, intentionally amend this constitution, add/update architecture enforcement, then change production code.

Architecture MUST NOT silently drift because a chat grows long or because work continues in a new conversation.

---

## 2. Architectural style

CarBroz Backend V3 is a modular monolith using DDD bounded contexts, Clean/Hexagonal Architecture, Dependency Inversion, Ports and Adapters, explicit application use cases, event-driven readiness, PostgreSQL, Prisma as infrastructure, Fastify as transport, Zod at runtime boundaries, and a pnpm workspace.

Microservices are not the current deployment model. Boundaries MUST remain independently testable and extractable.

The backend is one repository/deployable system, but Partner, Customer and Admin access surfaces MUST be independently evolvable.

---

# PART I — PRODUCT / ACCESS SURFACES

## 3. Product model

CarBroz has two dynamic client applications and one first-class operational management surface.

### 3.1 Partner

Partner is a production application targeting Android, iOS and Desktop through the frontend Compose Multiplatform codebase. Partner uses SDUI for dynamic presentation and is the FIRST implementation priority after backend architecture freeze.

### 3.2 Customer

Customer is a separate production application targeting Android, iOS and Desktop. Customer also uses SDUI. Customer architecture MUST be established and protected now, while Customer feature implementation follows completion of the Partner production phase.

### 3.3 Admin

Admin is a static web management/operations panel. Admin does NOT use SDUI for its own rendering, but Admin is architecturally first-class from day one because it must manage and inspect Partner, Customer, Booking, Catalog/Pricing, Financials, Disputes, Configuration, SDUI publication and Audit workflows.

Admin is normally NOT a standalone business bounded context. Administrative actions invoke administration capabilities owned by the relevant bounded context.

Examples:

```text
Admin Partner endpoint -> Partner application administration capability
Admin Customer endpoint -> Customer application administration capability
Admin Booking endpoint -> Booking application administration capability
Admin Dispute endpoint -> Dispute application administration capability
Admin SDUI endpoint -> SDUI Registry application capability
```

Admin MUST NOT bypass business rules by directly mutating another context's tables.

## 4. Non-negotiable isolation law

A Partner-specific change MUST NOT require a Customer-specific change.

A Customer-specific change MUST NOT require a Partner-specific change.

An Admin transport/panel change MUST NOT require Partner or Customer client contract changes unless the underlying business contract is intentionally changed.

Partner, Customer and Admin API DTOs, controllers, validation, authorization and versioning are separate and independently evolvable.

Partner and Customer client-facing SDUI content is independently scoped and independently versioned.

---

# PART II — FROZEN PHYSICAL REPOSITORY TAXONOMY

## 5. Final canonical top-level structure

The final physical structure is frozen as follows. A top-level source category not listed here MUST NOT be introduced without first amending this constitution.

```text
carbroz-backend/
│
├── apps/
│   └── api/
│
├── domains/
│   ├── identity/
│   ├── partner/
│   ├── customer/
│   ├── catalog-pricing/
│   ├── booking/
│   ├── operations/
│   ├── financials/
│   ├── communications/
│   ├── engagement/
│   ├── configuration/
│   ├── dispute/
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

`packages/` is intentionally removed because it is an ambiguous catch-all. Reusable code has exactly one explicit owner: universal primitives in `foundation`, SDUI vocabulary/runtime composition in `sdui`, technical capabilities in `platform`, or business capability in its owning `domain`.

## 6. Category decision rule

Every source file and workspace package MUST answer one of these questions unambiguously:

- **apps** — executable/deployment entry point, API surface, transport or composition root;
- **domains** — CarBroz business behavior, policy, state or business persistence for a bounded context;
- **sdui** — canonical generic server-driven UI vocabulary/composition or SDUI draft/publish/version lifecycle;
- **platform** — reusable technical infrastructure with no CarBroz business ownership;
- **foundation** — truly universal domain-independent primitive code;
- **prisma** — canonical database schema/migration/seed material;
- **tests** — cross-boundary architecture/contract/integration/E2E verification;
- **docs** — this normative architecture file or non-competing operational documentation.

If ownership is unclear, implementation MUST stop until ownership is resolved. `common`, `shared`, `helpers`, `utils`, and generic `packages` are not acceptable architectural owners.

## 7. Workspace rule

Final pnpm workspace roots are only:

```yaml
apps/*
domains/*
sdui/*
platform/*
foundation/*
```

Business submodules inside one bounded context are normal source folders, not separate workspace packages by default. Package explosion is forbidden.

---

# PART III — API APPLICATION AND SURFACE ISOLATION

## 8. Canonical `apps/api` structure

`apps/api` is executable/composition/transport only. It MUST NOT own CarBroz business entities, business state machines, canonical business repositories, pricing rules, Partner lifecycle rules, Booking rules, KYC rules, payment rules or SDUI structural definitions.

```text
apps/
└── api/
    └── src/
        ├── bootstrap/
        │   ├── app.ts
        │   ├── server.ts
        │   ├── container/
        │   ├── plugins/
        │   └── lifecycle/
        │
        ├── surfaces/
        │   ├── partner/
        │   │   ├── routes/
        │   │   ├── controllers/
        │   │   ├── dto/
        │   │   ├── mappers/
        │   │   └── validation/
        │   │
        │   ├── customer/
        │   │   ├── routes/
        │   │   ├── controllers/
        │   │   ├── dto/
        │   │   ├── mappers/
        │   │   └── validation/
        │   │
        │   └── admin/
        │       ├── routes/
        │       ├── controllers/
        │       ├── dto/
        │       ├── mappers/
        │       └── validation/
        │
        ├── transport/
        │   ├── middleware/
        │   ├── guards/
        │   ├── request-context/
        │   ├── error-mapping/
        │   └── response/
        │
        └── system/
            └── health/
```

Surface folders may be grouped further by capability as they grow, but business use cases remain in their owning bounded contexts.

## 9. External API families

Canonical external API families are:

```text
/api/v1/partner/*
/api/v1/customer/*
/api/v1/admin/*
```

They are independently versionable. Partner may move to a later API version without requiring Customer to move simultaneously, and vice versa.

### Import isolation

```text
Partner API surface MUST NOT import Customer surface internals.
Customer API surface MUST NOT import Partner surface internals.
Admin surface MUST NOT import Partner or Customer transport internals.
```

Admin uses bounded-context public/application capabilities, never another API surface's controller/service implementation.

---

# PART IV — BUSINESS BOUNDED CONTEXTS

## 10. Identity

Identity owns User, Session, authentication, OTP challenge lifecycle, access/refresh token policy, roles, permissions, authorization policy, device sessions and Admin identity/RBAC concepts.

## 11. Partner

Partner owns Partner, PartnerProfile, individual/organization Partner concepts, PartnerMember, Partner roles, KYC, verification, training, capabilities, declared availability, leave policy and Partner account/lifecycle status.

Canonical structure may grow according to actual complexity:

```text
domains/partner/
├── profile/
├── organization/
├── members/
├── kyc/
├── training/
├── availability/
├── capabilities/
├── status/
├── application/
│   ├── self-service/
│   └── administration/
├── infrastructure/
├── public/
└── partner.module.ts
```

Examples of Partner-owned administration capabilities include KYC review/approval/rejection, training approval, activation, suspension, blocking and unblocking. Admin invokes these through Admin APIs; Admin does not own the underlying rules.

Final consolidation:

```text
domains/partner-profile -> domains/partner/profile
domains/partner-kyc     -> domains/partner/kyc
```

## 12. Customer

Customer owns CustomerProfile, preferences, addresses, customer-owned vehicles/garage and Customer account state.

```text
domains/customer/
├── profile/
├── address/
├── garage/
├── preferences/
├── application/
│   ├── self-service/
│   └── administration/
├── infrastructure/
├── public/
└── customer.module.ts
```

Customer-specific functionality MUST NOT live in Partner and Partner-specific functionality MUST NOT live in Customer.

## 13. Catalog-Pricing

Catalog and Pricing form one bounded context with internally separated capabilities because service definitions and pricing evolve together while remaining distinct concepts.

```text
domains/catalog-pricing/
├── catalog/
├── pricing/
├── application/
├── infrastructure/
├── public/
└── catalog-pricing.module.ts
```

Catalog owns ServiceCategory, Service, ServiceAddon and catalog configuration. Pricing owns service pricing rules/configuration, pricing tiers, vehicle/service multipliers and related pricing policy. Financial ledger/settlement rules remain Financials.

Final consolidation:

```text
domains/catalog -> domains/catalog-pricing/catalog
domains/pricing -> domains/catalog-pricing/pricing
```

## 14. Booking

Booking owns Booking aggregate, booking lifecycle/state machine, immutable snapshots, cancellation rules and booking invariants. Booking does NOT own capacity, dispatch or tracking.

```text
domains/booking/
├── domain/
├── application/
│   ├── customer/
│   ├── partner/
│   └── administration/
├── infrastructure/
├── public/
└── booking.module.ts
```

## 15. Operations

Operations owns slot inventory, availability, capacity, partner assignment, dispatch, radius/travel feasibility, partner workload, tracking sessions, ETA policy, location and service execution workflow.

```text
domains/operations/
├── slots/
├── availability/
├── dispatch/
├── assignment/
├── tracking/
├── location/
├── service-execution/
├── application/
├── infrastructure/
├── public/
└── operations.module.ts
```

Legacy Tracking/slot/dispatch packages consolidate here.

## 16. Financials

Financials owns payment, invoice, refund, payout, commission, tax-calculation application policy, ledger, settlement and payment webhooks.

```text
domains/financials/
├── payment/
├── invoice/
├── refund/
├── payout/
├── commission/
├── ledger/
├── settlement/
├── application/
├── infrastructure/
├── public/
└── financials.module.ts
```

Payment, Invoice and Payout are internal capabilities, not separate final workspace packages.

## 17. Communications

Communications owns communication business concepts and orchestration including DeviceToken, Notification, NotificationTemplate, NotificationPreference, DeliveryLog and channel policy.

Concrete Firebase/SMS/email/push vendor adapters belong under `platform/integrations`.

## 18. Engagement

Engagement owns reviews, ratings, coupons, promotions, offers and engagement policy.

Legacy Review and Coupon packages consolidate under Engagement.

## 19. Configuration

Configuration owns persisted business/runtime product configuration such as maintenance mode, supported app versions, forced-update policy, runtime feature rollout, bootstrap decisions and startup routing configuration.

Environment/secrets are NOT owned here. `DATABASE_URL`, `REDIS_URL`, JWT secrets, provider credentials, ports and logging configuration are technical bootstrap/platform configuration.

Legacy `packages/config` must be split accordingly and deleted.

## 20. Dispute

Dispute remains an independent bounded context because it owns meaningful business concepts and lifecycle such as Dispute, DisputeReason and DisputeStatus.

```text
domains/dispute/
├── domain/
├── application/
│   ├── customer/
│   ├── partner/
│   └── administration/
├── infrastructure/
├── public/
└── dispute.module.ts
```

## 21. Enterprise

Enterprise owns B2B/corporate customer concepts whose lifecycle is distinct from an individual customer: CorporateAccount, organization members, corporate fleet enrollment and corporate booking/credit eligibility policy. Financial ledgers, invoices, settlement and payment accounting remain Financials responsibilities.

## 22. Audit

Audit owns immutable business/security audit records and actor/action semantics. Audit is not technical application logging; technical logging remains Observability.

Administrative actions such as KYC approval, Partner blocking, configuration changes, financial intervention and SDUI publishing should generate auditable records where required.

## 23. Standard internal domain structure

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

Not every context must mechanically create every folder. Empty ceremonial folders are forbidden. Large subfeatures may repeat domain/application/infrastructure locally only when complexity justifies it.

---

# PART V — SDUI SUBSYSTEM

## 24. SDUI is a first-class generic subsystem

Everything fundamentally belonging to generic SDUI starts under top-level `sdui/`.

Exactly two SDUI workspace packages are canonical:

```text
sdui/
├── ui-sdk/      generic structural/composition SDK
└── registry/    SDUI draft/publish/version persistence lifecycle
```

Final package identities:

```text
@carbroz/ui-sdk
@carbroz/sdui-registry
```

No second UI SDK, `sdui-engine`, UI schema package, API-local duplicate SDUI DTO hierarchy or domain-local duplicate structural contract may exist after migration.

## 25. `sdui/ui-sdk` responsibility

`ui-sdk` is the one canonical generic SDUI language and composition toolkit. It owns runtime contracts, reusable definitions, registries, factories, builders, validation, serialization and schema versioning.

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

## 26. `sdui/registry` responsibility

`registry` owns SDUI runtime lifecycle only: screen metadata, drafts, publish, immutable versions, rollback, target application/scope, persistence, checksums and version history. It consumes `@carbroz/ui-sdk`; it never redefines UI structure or composition mechanics.

```text
sdui/registry/
├── domain/
├── application/
├── infrastructure/
├── composition/
├── public/
└── tests/
```

## 27. Canonical SDUI hierarchy

Template and Component are mandatory. Element is the terminal structural leaf. Section and Group are optional.

Every Component independently selects exactly one legal branch:

```text
Template -> Component -> Element
Template -> Component -> Section -> Element
Template -> Component -> Section -> Group -> Element
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

## 28. Definition, instance and runtime data

Reuse is first-class at Template, Component, Section, Group and Element levels.

The SDK distinguishes:

1. **Definition/type** — immutable reusable structure/semantics, e.g. `form_template`, `profile_header`, `primary_button`.
2. **Instance/id** — one concrete runtime usage.
3. **Runtime data/overrides** — permitted instance values such as text, image, action, enabled state, labels and allowed properties.

`type` identifies reusable behavior/structure. `id` identifies the concrete usage. They are not interchangeable.

## 29. No screen-name-driven backend architecture

Concrete screens such as Splash, Login, OTP, Dashboard, Booking Screen or Profile Screen are runtime presentation definitions, NOT permanent backend architectural modules.

The backend MUST NOT create architecture such as:

```text
domains/partner/experience/sdui/login/
domains/partner/experience/sdui/dashboard/
domains/customer/experience/sdui/login/
domains/customer/experience/sdui/dashboard/
```

and MUST NOT require source-code folder changes when a runtime screen is added, renamed, reordered, replaced or removed.

Generic SDUI code understands Screen, Template, Component, Section, Group, Element, definitions, actions, properties, versions and scopes — not hardcoded product screen topology.

Business rules invoked from a dynamic screen remain in their owning bounded context. Example:

```text
Dynamic Partner KYC UI
-> action
-> Partner KYC application capability
```

The SDUI layer does not own KYC business rules.

## 30. SDUI Partner/Customer isolation

Canonical runtime scopes are:

```text
GLOBAL
PARTNER
CUSTOMER
```

Partner and Customer may reuse genuinely generic templates/components/sections/groups/elements, but Partner-specific and Customer-specific runtime definitions remain isolated.

A definition is GLOBAL only when it is genuinely product-neutral. Similar appearance is not sufficient reason to couple Partner and Customer definitions.

Admin does not use SDUI for its own static web UI, but Admin may manage SDUI drafts/publication/rollback through the SDUI Registry.

## 31. Immutable publication/versioning

Published SDUI definitions/documents are immutable.

Changing a reusable Template, Component, Section, Group or Element creates a new version. It MUST NOT mutate already-published Partner or Customer experiences.

A published screen/document remains pinned to exact definition versions or a resolved immutable snapshot.

Therefore Customer may adopt a new reusable definition version while Partner remains on the old version with zero unintended Partner impact, and vice versa.

## 32. SDUI persistence

Published SDUI is an immutable versioned document stored in PostgreSQL JSONB after canonical validation. Metadata includes screenId, target/scope, schemaVersion, version, templateId, templateType, document JSON, checksum, status and creation/publish metadata.

```text
Admin editor / runtime configuration
-> @carbroz/ui-sdk factory/builder
-> canonical validator
-> Draft
-> Publish
-> Immutable Version
-> PostgreSQL JSONB
-> validated read
-> Partner or Customer client
```

Corrupted published documents are observable contract failures, not silent static fallbacks.

---

# PART VI — FOUNDATION, PLATFORM AND DEPENDENCIES

## 33. Foundation kernel

Exactly one kernel exists: `foundation/kernel` / `@carbroz/foundation-kernel`.

It may own only truly universal primitives such as Entity/AggregateRoot/ValueObject, DomainEvent, Result/error primitives, Money, Clock/ID ports, pagination, actor identity and universal transaction contracts.

It MUST NOT own User, Customer, Partner, Booking, Payment, Coupon, Review, Address, KYC, SDUI models or other CarBroz business concepts.

`shared/kernel` MUST merge into Foundation and disappear.

`packages/common` MUST NOT survive as a God/shared package. Each source item must move to its real owner or be deleted if unnecessary.

## 34. Platform ownership

Platform owns technology, not business.

### database
Prisma client lifecycle, connection health, transaction infrastructure and database-level utilities only. Business repositories belong in their owning domain infrastructure.

### cache
Technical cache client/lifecycle/adapters only.

### messaging
Technical event bus, queue, outbox delivery infrastructure and message transport. Current `platform/event-bus` and `platform/queue` consolidate here.

### storage
Technical object/blob storage adapters and lifecycle only.

### observability
Logging, tracing, metrics and technical diagnostics.

### integrations
Concrete external-vendor adapters grouped by capability, e.g. maps, payment gateways, SMS, email, push and remote feature-flag vendors. Domains depend on ports, never vendor implementations.

Final Platform MUST NOT own business-named repositories such as `PrismaPartnerRepository`, `PrismaBookingRepository`, `PrismaPaymentRepository`, `PrismaReviewRepository` or `PrismaKycDocumentRepository`.

## 35. Dependency law

Canonical inward direction:

```text
foundation
    ^
domain
    ^
application
    ^
infrastructure adapters
    ^
presentation / composition / transport
```

Domain code MUST NOT import Fastify, Prisma, Redis, Awilix, vendor SDKs, filesystem APIs, `process.env` or concrete platform infrastructure. Application depends on domain + declared ports, not concrete infrastructure. Infrastructure implements ports.

Cross-domain dependencies use explicit public contracts/application services/events, never another context's internal files.

Additional isolation:

```text
Partner domain MUST NOT import Customer internals.
Customer domain MUST NOT import Partner internals.
Generic SDUI MUST NOT depend on Partner or Customer.
Foundation MUST NOT depend on business domains.
```

## 36. Public boundary rule

Every bounded context exposes a deliberately small `public/` contract. External consumers MUST NOT import arbitrary internal domain/application/infrastructure files.

Architecture tests must reject forbidden deep imports where practical.

## 37. Persistence and transactions

Business repository interfaces and concrete business repository adapters belong to the owning domain. `platform/database` provides technical database capability only.

A transaction is valid only when all repository operations inside the callback use the same underlying database transaction. Critical flows require real PostgreSQL rollback tests. Passing a transaction client that repositories ignore is forbidden.

## 38. Events and outbox

Cross-domain side effects SHOULD use versioned domain events and a transactional outbox rather than deep synchronous repository coupling. Domain change + outbox insertion must commit atomically when required. Delivery is retryable and idempotent.

## 39. Money and financial invariants

Money is integer minor units + currency; INR uses paise. Floating-point monetary storage/arithmetic is forbidden. Pricing produces immutable/versioned quotation snapshots. Ledger, payout, refund and settlement invariants require tests. Ledger/accounting workflows must preserve idempotency and double-entry rules when implemented.

## 40. Booking and operations invariants

Booking owns booking state. Operations owns capacity, availability, dispatch, tracking and execution. Slot reservation must be concurrency-safe. Booking state transitions are explicit and encapsulated. Business-time policy uses a Clock abstraction.

## 41. Authentication/session security

Production OTP requires cryptographically secure generation, hash-at-rest, expiry, attempt limits, resend cooldown, one-time consumption, challenge+phone binding, rate limiting and provider abstraction. Production bootstrap rejects mock/development OTP modes.

Refresh tokens require cryptographic strength, rotation, expiry, revocation, session/device binding and reuse detection. Token policy is centralized. OTPs, access/refresh tokens, authorization headers and secrets are never logged.

## 42. Authorization/resource ownership

Transport authorization and resource ownership are separate checks. User-owned resources validate actor ownership or explicit permission. External APIs prefer public UUID-like identifiers over internal autoincrement IDs.

## 43. Error architecture

Expected business failures use typed error categories and MUST NOT accidentally become HTTP 500. HTTP mapping occurs at transport. Clients receive stable safe codes/details; internal stack/infrastructure details are never exposed.

## 44. Configuration separation

Secrets/environment configuration and persisted business configuration are separate. Reusable configuration code does not call `process.exit()` during import. Only `.env.example` is the general committed template. Production rejects known unsafe/default credentials and development-only provider modes.

## 45. Observability/PII

Logs default to metadata, not payload dumps. OTP/token/auth headers, sensitive contact/address/coordinates/KYC/payment/vendor secrets are omitted or redacted. Meaningful provider failures cannot disappear in silent catches.

---

# PART VII — MIGRATION CLASSIFICATION

## 46. Classification vocabulary

Every migration item is classified as exactly one of:

- **KEEP** — already has the correct owner and purpose;
- **MOVE** — responsibility is valid but physical owner is wrong;
- **MERGE** — responsibility belongs inside another canonical context/capability;
- **RENAME** — purpose is correct but naming violates canonical vocabulary;
- **DELETE** — duplicate, obsolete, generated, unnecessary abstraction or invalid architectural unit.

Maintain an evidence-based migration matrix:

```text
CURRENT PATH
-> CLASSIFICATION
-> FINAL CANONICAL PATH
-> REASON
```

Do not bulk-move ambiguous content without file-level ownership analysis.

## 47. Existing package migration map

```text
CURRENT                                      FINAL TARGET                                      ACTION
apps/api business modules                    owning domains + isolated API surfaces            SPLIT + MOVE
packages/common                              owning domain/foundation/platform                  SPLIT + DELETE
packages/config                              bootstrap/platform or configuration domain         SPLIT + DELETE
shared/kernel                                foundation/kernel                                 MERGE + DELETE

domains/partner-profile                     domains/partner/profile                            MERGE
domains/partner-kyc                         domains/partner/kyc                                MERGE

domains/catalog                             domains/catalog-pricing/catalog                    MERGE
domains/pricing                             domains/catalog-pricing/pricing                    MERGE

domains/tracking                            domains/operations/tracking                        MERGE
domains/payment                             domains/financials/payment                         MERGE
domains/invoice                             domains/financials/invoice                         MERGE
domains/payout                              domains/financials/payout                          MERGE
domains/notification                        domains/communications                             MERGE
domains/review                              domains/engagement/review                          MERGE
domains/coupon                              domains/engagement/coupon                          MERGE
domains/config                              domains/configuration                              MOVE + RENAME
domains/dispute                             domains/dispute                                    KEEP + STANDARDIZE

platform/event-bus                          platform/messaging/event-bus                       MERGE
platform/queue                              platform/messaging/queue                           MERGE
platform/notification                       platform/integrations/notification                 MERGE
platform/feature-flags                      configuration/platform integration by responsibility SPLIT
platform/database business repositories     owning domains                                     MOVE + DELETE DUPLICATES
```

Existing canonical packages still require internal ownership audits. No new feature development may introduce additional legacy package shapes while migration is active.

## 48. Migration order

Architecture classification and physical structure take priority over further product feature development.

Frozen migration order:

1. Read this constitution and verify active branch/repository state.
2. Complete file-level inventory/classification for the migration slice.
3. Freeze/update architecture guardrails for the slice.
4. Ensure canonical SDUI authority is `sdui/ui-sdk` + `sdui/registry`; remove duplicate authorities.
5. Evacuate business logic from `apps/api` into owning domains while establishing `surfaces/partner`, `surfaces/customer` and `surfaces/admin` transport boundaries.
6. Consolidate Partner fragments into `domains/partner`.
7. Complete/verify Customer consolidation into `domains/customer` without implementing unnecessary Customer features.
8. Consolidate Catalog + Pricing into `domains/catalog-pricing`.
9. Consolidate Operations fragments.
10. Consolidate Financials fragments.
11. Consolidate Communications and Engagement fragments.
12. Consolidate Configuration, Enterprise, Dispute and Audit ownership.
13. Collapse Platform to technical capabilities only.
14. Eliminate `packages/common`, `packages/config`, `shared/kernel`, tracked generated output and transitional compatibility structure.
15. Update pnpm workspace roots to canonical roots only.
16. Enable strict topology enforcement requiring 100% physical match.
17. Run full build/typecheck/tests and repository scans.
18. Declare architecture freeze only when Section 54 is satisfied.

Each move preserves behavior through tests and deletes superseded source once consumers are updated. Compatibility clutter is forbidden unless an explicit compatibility requirement exists.

---

# PART VIII — TESTING AND ENFORCEMENT

## 49. Testing policy

All executable CarBroz production TypeScript targets final merge coverage of 100% statements, branches, functions and lines. Generated/type-only/barrel files are validated by build/architecture checks rather than fake coverage. Exclusions cannot be added merely to reach a number.

Required layers include unit, domain invariant, state-machine, use-case, repository contract, real Prisma/PostgreSQL integration, rollback/concurrency, HTTP/auth/authz, provider adapter, SDUI contract/definition/factory/builder/serialization/versioning, configuration, error, architecture, security and critical E2E tests.

## 50. Mandatory SDUI tests

Tests MUST cover all three legal hierarchy branches, mixed Component shapes, multiples at every level, illegal mixed/empty branches, illegal skipped relationships, structural descendants under Element, duplicate IDs, invalid scope/schema version, malformed actions/properties, unknown/duplicate definitions, factory validation, builder invariants, serialization round-trip, immutable publication/versioning and reuse of one generic definition with different IDs/runtime data.

## 51. Architecture enforcement

Architecture checks MUST fail on:

- forbidden domain technology imports;
- API-owned business logic;
- business repositories owned by Platform database;
- multiple SDUI authorities;
- hardcoded screen-name-driven backend architecture;
- reintroduced generic common/shared/package architecture;
- unclassified new workspace packages;
- duplicate responsibilities;
- dependency cycles;
- legacy SDUI structural vocabulary;
- tracked generated output;
- architecture scans treating `dist`/generated files as source;
- Partner surface -> Customer surface imports;
- Customer surface -> Partner surface imports;
- Admin surface -> Partner/Customer transport-internal imports;
- Partner domain -> Customer-internal imports;
- Customer domain -> Partner-internal imports;
- Generic SDUI -> Partner/Customer dependencies;
- forbidden deep cross-domain imports instead of public boundaries.

During migration, explicitly classified legacy paths are a closed transitional allowlist, not precedent. New legacy paths are forbidden.

## 52. Generated artifacts/source control

Normal generated output is not source. Final V3 MUST NOT track `**/dist/**`, `**/*.tsbuildinfo`, emitted JS/declarations/maps from TypeScript builds or coverage output. A clean validation build must not leave unintended tracked changes.

## 53. Feature implementation gate after architecture freeze

Every feature must answer before coding:

1. Is this Partner, Customer, Admin transport or shared bounded-context behavior?
2. Which bounded context owns the business rule?
3. Does it require SDUI or ordinary JSON?
4. If SDUI, is the runtime definition GLOBAL, PARTNER or CUSTOMER scoped?
5. Can the change affect an already-published Partner or Customer SDUI version?
6. Does it introduce a cross-domain dependency?
7. Is that dependency through public contracts/ports/events?
8. Does Admin require an administration capability for this concept?
9. Which architecture regression test prevents drift?

No feature bypasses this gate.

## 54. Final architecture freeze criteria

Backend V3 is architecture-frozen only when all are true:

- physical repository matches the canonical top-level taxonomy;
- workspace roots match Section 7 exactly;
- no top-level `packages` or `shared` remains;
- exactly one Foundation kernel exists;
- exactly one SDUI UI SDK and one SDUI Registry exist;
- no global business God package exists;
- Partner, Customer and Admin API surfaces are structurally separate;
- Partner and Customer client contracts are independently evolvable;
- Partner and Customer SDUI definitions are independently scoped and immutable after publication;
- no screen-name-driven backend architecture exists;
- Admin can manage required workflows through owning bounded-context administration capabilities;
- no Platform-owned business repositories remain;
- no API-owned business use cases remain;
- no tracked normal build output remains;
- no legacy SDUI hierarchy remains;
- secure auth/session design is preserved;
- real transaction propagation is proven by rollback tests;
- no forbidden dependency cycles/imports remain;
- expected errors map safely;
- required test layers are green;
- executable production coverage reaches the required final threshold;
- fresh install/build/test succeeds;
- Git working tree is clean after validation.

Architecture drift by convenience is forbidden.

---

# PART IX — DELIVERY PRIORITY

## 55. Partner-first production sequence

After architecture freeze, implementation priority is:

```text
1. Partner Config / Bootstrap API
2. Connect Partner frontend
3. Partner flow implementation screen-by-screen through runtime SDUI
4. Complete Partner production phase
5. Implement Customer features using the already-isolated architecture
6. Build/prioritize Admin static frontend panel as product planning requires
```

Although Admin frontend implementation may happen later, Admin backend boundaries and administration capabilities are part of architecture from day one.

Partner-first does NOT mean shared contexts become Partner-coupled. Booking, Catalog-Pricing, Financials, Communications, Configuration, Platform, Foundation and generic SDUI remain product-neutral wherever the concept is genuinely shared.

---

## 56. Final non-negotiable principle

> A Partner-specific change must stay Partner-specific. A Customer-specific change must stay Customer-specific. Admin manages both through their owning business capabilities without taking ownership away from them. Shared code exists only when the concept is genuinely shared. Dynamic UI remains runtime-driven, generic, scoped, immutable after publication, and independently adoptable by Partner and Customer.

This principle overrides convenience-driven shortcuts.
