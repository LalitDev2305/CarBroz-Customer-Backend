# CarBroz Backend V3 Master Constitution

**Status:** Normative architecture source of truth  
**Applies to:** Customer, Partner, Admin, API, domains, platform, SDUI, data, security, tests, tooling  
**Branch introduced on:** `architecture/backend-v3-clean`

---

## 1. Purpose and authority

This document is the single normative architecture constitution for the CarBroz backend. Production code, tests, package structure, dependency direction, API behavior, persistence, SDUI contracts, security, observability, and build tooling MUST conform to it.

A class, package, folder, interface, provider, repository, factory, builder, transaction abstraction, or design-pattern name is never accepted as evidence that the promised guarantee exists. Guarantees MUST be established by implementation and tests.

No competing architecture document may define different rules. Historical design documents are migration input only and MUST be deleted after V3 migration completes. The root README may contain setup/run instructions and a link to this constitution, but it MUST NOT redefine architecture.

---

## 2. Architectural style

CarBroz Backend V3 is a **modular monolith** using:

- Domain-Driven Design bounded contexts.
- Clean/Hexagonal Architecture.
- Dependency Inversion.
- Ports and Adapters.
- Explicit application use cases.
- Event-driven readiness through domain events and a transactional outbox.
- PostgreSQL as the primary transactional database.
- Prisma as infrastructure only.
- Fastify as HTTP transport only.
- Zod for runtime validation at system boundaries.
- pnpm workspace monorepo.

Microservices are NOT the current deployment model. Boundaries MUST nevertheless remain independently testable and extractable.

---

## 3. Canonical repository topology

```text
carbroz-backend/
├── apps/
│   └── api/
│       ├── src/
│       │   ├── bootstrap/
│       │   ├── composition/
│       │   ├── http/
│       │   │   ├── plugins/
│       │   │   ├── middleware/
│       │   │   ├── guards/
│       │   │   ├── errors/
│       │   │   └── routes/
│       │   └── server.ts
│       └── tests/
├── foundation/
│   └── kernel/
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
│   ├── sdui/
│   └── audit/
├── packages/
│   └── sdui-engine/
├── platform/
│   ├── database/
│   ├── cache/
│   ├── messaging/
│   ├── storage/
│   ├── observability/
│   └── integrations/
├── tests/
│   ├── architecture/
│   ├── contracts/
│   ├── integration/
│   └── e2e/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
└── docs/
    └── MASTER-BACKEND-CONSTITUTION.md
```

Top-level `shared/`, generic business `common/`, duplicate SDK folders, duplicate kernels, and duplicate business module trees are forbidden in the final V3 repository.

---

## 4. Foundation kernel

Exactly one kernel exists: `foundation/kernel` published as `@carbroz/foundation-kernel`.

It MAY contain truly universal primitives such as:

- Entity/AggregateRoot/ValueObject abstractions.
- DomainEvent.
- Result/error primitives.
- UseCase contract.
- Clock and ID generator ports.
- Actor identity abstraction.
- Pagination primitives.
- Transaction context contract when universally required.

It MUST NOT contain CarBroz business entities such as User, Customer, Partner, Booking, Payment, Coupon, Review, Address, KYC, or SDUI screen models.

`shared/kernel` and business-heavy `packages/common` MUST be deleted after migration.

---

## 5. Bounded contexts and ownership

### 5.1 Identity
Owns User, Session, authentication, OTP challenge lifecycle, access-token policy, refresh-token lifecycle, roles, permissions, authorization policy, and device sessions.

### 5.2 Customer
Owns CustomerProfile, preferences, addresses, customer-owned vehicles/garage, and customer profile state.

### 5.3 Partner
Owns Partner, PartnerProfile, individual/organization partner concepts, PartnerMember, partner roles, KYC, verification, capabilities, declared availability, and leave rules.

### 5.4 Catalog
Owns ServiceCategory, Service, ServiceAddon, catalog pricing configuration, vehicle/service multipliers, tax classification metadata, and service configuration.

### 5.5 Booking
Owns Booking aggregate, booking lifecycle/state machine, immutable snapshots, cancellation rules, and booking invariants. Booking does NOT own capacity or dispatch.

### 5.6 Operations
Owns slot inventory, availability, capacity, partner assignment, dispatch, radius matching, travel feasibility, partner workload, tracking sessions, location updates, ETA policy, and service execution workflow.

### 5.7 Financials
Owns payment, invoice, refund, payout, commission, taxes, ledger, payment webhooks, and settlement. Internal submodules may separate these concerns while remaining one cohesive bounded context.

### 5.8 Communications
Owns notification domain concepts: DeviceToken, Notification, NotificationTemplate, NotificationPreference, DeliveryLog, and channel policy. Vendor SDK implementations remain platform integrations.

### 5.9 Engagement
Owns reviews, ratings, coupons, promotions, offers, and engagement policy.

### 5.10 Configuration
Owns persisted business/runtime application configuration such as maintenance mode, supported app versions, forced update policy, remote operational flags, feature rollout, bootstrap decisions, and startup routing configuration. Environment/secret configuration is NOT owned here.

### 5.11 SDUI
Owns SDUI screen metadata, drafts, publishing, immutable versions, rollback, target application, version history, and persistence lifecycle. It MUST consume the canonical `sdui-engine` contract and MUST NOT redefine it.

### 5.12 Audit
Owns immutable security/business audit records and audit actor/action semantics.

---

## 6. Standard internal domain structure

A domain uses only the directories that have real responsibilities; empty ceremonial folders are forbidden.

```text
domains/<domain>/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── events/
│   │   ├── services/
│   │   └── repositories/
│   ├── application/
│   │   ├── commands/
│   │   ├── queries/
│   │   ├── use-cases/
│   │   ├── dto/
│   │   └── ports/
│   ├── infrastructure/
│   │   ├── persistence/prisma/
│   │   ├── mappers/
│   │   └── adapters/
│   ├── presentation/http/
│   ├── composition/
│   └── public/
└── tests/
```

Domain entities and repository ports are owned by their bounded context, never by a global common package.

---

## 7. Dependency law

Canonical inward dependency direction:

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

Domain code MUST NOT import Fastify, Prisma, Redis, Awilix, MinIO, Firebase, Razorpay, MSG91, Resend, Google Maps SDKs, filesystem APIs, `process.env`, or concrete platform infrastructure.

Application code may depend on its domain and declared ports but MUST NOT depend on concrete infrastructure implementations.

Infrastructure implements domain/application ports.

The API app composes modules and transports requests. It MUST NOT own CarBroz business use cases, entities, state machines, repositories, or SDUI contract definitions.

Architecture tests MUST enforce forbidden imports and dependency cycles.

---

## 8. API application

The final application is `apps/api` published as `@carbroz/api`.

It owns only:

- Fastify creation and server lifecycle.
- Request context and correlation.
- HTTP middleware/plugins/guards.
- Error-to-HTTP mapping.
- Route composition.
- Dependency composition/bootstrap.
- Graceful shutdown/readiness.

All public versioned product APIs use `/api/v1/...`. Operational endpoints such as `/health` and `/ready` may remain unversioned.

Route definitions MUST explicitly declare access policy: PUBLIC, AUTHENTICATED, CUSTOMER, PARTNER/PARTNER_MEMBER, ADMIN, or explicit permission. Security MUST NOT rely solely on a global soft JWT decode hook.

---

## 9. Authentication and session security

Production OTP behavior MUST include:

- Cryptographically secure generation.
- Hash-at-rest storage.
- Expiry.
- Attempt limits.
- Resend cooldown.
- One-time consumption.
- Challenge + phone binding.
- Rate limiting.
- Provider abstraction.

A development OTP adapter may exist, but production bootstrap MUST reject development/mock OTP configuration.

Refresh tokens MUST be cryptographically random or use an equivalently strong design, stored hashed where opaque tokens are used, rotated, expiring, revocable, session/device bound, and protected by token-family reuse detection.

Controllers MUST NOT define token lifetimes. One token service owns issuer, audience, lifetime, signing, rotation, and verification policy.

OTP values, access tokens, refresh tokens, authorization headers, and secrets MUST NEVER be logged.

---

## 10. Authorization and resource ownership

Transport authorization and domain ownership checks are separate requirements.

Use cases that mutate/read user-owned resources MUST validate actor ownership or explicit permission. Resource APIs SHOULD make unsafe ID-only access difficult, e.g. customer-address lookup SHOULD include customer ownership in the query contract.

External APIs use public UUID-like identifiers rather than internal database autoincrement IDs wherever practical.

---

## 11. Persistence and repositories

`platform/database` owns only Prisma client lifecycle, connection health, transaction infrastructure, and database-level utilities.

Concrete repositories such as PrismaBookingRepository, PrismaCustomerRepository, PrismaPaymentRepository, etc. belong in the infrastructure layer of their owning domain.

`platform/database` MUST NOT become a registry of every business repository and MUST NOT depend on every bounded context.

Domain/application code MUST NOT expose Prisma types.

---

## 12. Transactions and Unit of Work

A transaction abstraction is considered valid only when all repository operations inside the callback participate in the SAME underlying database transaction.

Passing a transaction client that repositories ignore is forbidden.

Critical flows MUST have real PostgreSQL integration tests proving rollback. At minimum:

1. operation A succeeds;
2. operation B fails;
3. transaction fails;
4. operation A is verified absent afterward.

Payment + Booking + Invoice + Webhook status and aggregate change + Outbox record must be atomic where the use case requires it.

---

## 13. Events and transactional outbox

Cross-domain side effects SHOULD use domain events and an outbox rather than deep synchronous repository coupling.

Critical domain change and outbox insertion MUST commit atomically. Message publication occurs after commit and must be retryable/idempotent.

Event contracts are versioned. Consumers MUST tolerate retry and duplicate delivery.

---

## 14. Money and financial invariants

Money is represented as integer minor units plus currency. For INR the minor unit is paise.

Ambiguous comments/fields using `cents`, raw `price`, or mixed rupee/paise semantics are forbidden in new code.

Floating-point arithmetic MUST NOT be used for monetary storage or ledger invariants.

Pricing produces a versioned immutable quotation/snapshot containing base amount, addons, adjustments, discount, tax, subtotal, total, currency, and calculation version.

Tax rates MUST NOT be hardcoded inside Booking use cases.

Ledger accounting, payout, refund, and settlement invariants are covered by Financials tests.

---

## 15. Booking and operations invariants

Booking owns state, not capacity.

Operations owns availability, slot capacity, partner capability/availability, leave, radius/travel feasibility, assignment, dispatch, tracking, and execution workflow.

Slot reservation MUST be concurrency-safe. A read-then-create conflict check without a database concurrency guarantee is forbidden.

Booking state transitions MUST be explicit and encapsulated. Direct public mutation of aggregate state that bypasses invariants is forbidden.

Business time decisions use a Clock abstraction rather than uncontrolled `new Date()`/`Date.now()` calls in domain policy.

---

## 16. Error architecture

Expected business failures MUST NOT become accidental HTTP 500 responses.

The system uses typed error categories such as DomainError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError, ConflictError, StateTransitionError, RateLimitError, ProviderError, and InfrastructureError.

HTTP mapping occurs at the transport boundary. Error responses expose stable machine-readable codes and safe validation details where needed by SDUI forms.

Internal stack traces and infrastructure details are not sent to clients.

---

## 17. Environment configuration vs business configuration

Environment/secret configuration includes DATABASE_URL, REDIS_URL, JWT secrets, vendor credentials, host/port, and logging level.

Business configuration includes maintenance mode, version support, forced update, feature rollout, remote policy, and bootstrap routing.

Reusable configuration packages MUST NOT call `process.exit()` during import. Configuration parsing returns/throws a typed validation error; application bootstrap decides whether startup terminates.

Only `.env.example` is the general committed developer template. Real local/production secret files are ignored. Production startup MUST reject known sample secrets, default provider credentials, unsafe development OTP modes, and other explicitly forbidden insecure defaults.

---

## 18. Observability and PII

Logs default to metadata, not payload dumps.

Safe structured fields include trace/request IDs, route, status, latency, actor type, safe public resource identifiers, stable error code, and provider metrics.

Sensitive values MUST be redacted or omitted, including OTP, access/refresh tokens, authorization headers, phone/email where not explicitly safe, addresses, precise coordinates, KYC data, payment secrets, and vendor credentials.

Provider fallback may be resilient but failures MUST remain observable. Silent `catch {}` for meaningful operational failures is forbidden.

---

## 19. Canonical SDUI engine

Exactly one structural SDUI contract package exists: `packages/sdui-engine` published as `@carbroz/sdui-engine`.

No API DTO, domain package, shared package, or second SDK may independently redefine the SDUI hierarchy.

The engine owns:

```text
src/
├── contract/
│   ├── screen.schema.ts
│   ├── template.schema.ts
│   ├── component.schema.ts
│   ├── section.schema.ts
│   ├── group.schema.ts
│   ├── element.schema.ts
│   ├── action.schema.ts
│   ├── theme.schema.ts
│   └── properties.schema.ts
├── builder/
├── factory/
├── validator/
├── serializer/
├── versioning/
└── public/
```

Zod runtime schemas are the canonical runtime contract. TypeScript types SHOULD be inferred from canonical schemas where practical. `any`, `.passthrough()` everywhere, and duplicate handwritten structural models are forbidden in the core hierarchy.

---

## 20. Canonical SDUI hierarchy

The SDUI structure is intentionally optional only at Section and Group levels.

```text
Template
└── Component[]        REQUIRED, non-empty
```

Every individual Component independently selects exactly ONE content form:

```text
Component → Element[]
```

or:

```text
Component → Section[] → Element[]
```

or:

```text
Component → Section[] → Group[] → Element[]
```

Therefore a single Template may legally contain mixed component shapes:

```text
Template
├── Component A
│   └── Element[]
├── Component B
│   └── Section[]
│       └── Element[]
└── Component C
    └── Section[]
        └── Group[]
            └── Element[]
```

Rules:

- Template is required.
- At least one Component is required.
- Every Component MUST resolve transitively to at least one Element.
- Section is optional.
- Group is optional.
- Element is the structural leaf.
- A Component MUST NOT contain both `elements` and `sections`.
- A Section MUST NOT contain both `elements` and `groups`.
- A Component MUST NOT contain Group directly.
- Template MUST NOT contain Section or Element directly.
- Group MUST NOT contain Section or Component.
- Element MUST NOT contain Component, Section, Group, or nested Element hierarchy.
- Skipped levels are omitted; empty arrays/null placeholders are not used to express skipping.
- Non-empty arrays are enforced for structural branches.
- Multiple Components, Sections, Groups, and Elements are supported.

Legacy terms `Subcomponent`, `Child`, `ChildrenData`, `subComponents`, `children`, and `childrenData` are removed in V3 and are not canonical aliases.

---

## 21. SDUI element responsibility

Element is the atomic leaf and may contain id, type, typed properties, actions, analytics, accessibility, validation, binding, visibility, and metadata according to versioned contracts.

Elements may not recursively own structural hierarchy.

Unknown element/property expansion must be version-aware and validator-controlled rather than accepted through unrestricted `any`.

---

## 22. SDUI persistence/versioning

Published SDUI is an immutable versioned document stored in PostgreSQL JSONB after canonical validation.

A published version records at least screenId, targetApp, schemaVersion, version, templateId, templateType, documentJson, checksum, status, creation metadata, and publish metadata.

Production flow:

```text
Builder/Admin Editor
→ canonical validator
→ Draft
→ Publish
→ Immutable Screen Version
→ PostgreSQL JSONB
→ validated read
→ Client
```

A corrupted published document MUST NOT silently degrade into a static builder result. Corruption is a distinct observable contract failure. Explicit fallback policy, if any, must be configured and tested.

Runtime filesystem scanning/dynamic discovery of screen builders is forbidden. Builder registration is deterministic and explicit.

`targetApp` uses a canonical finite type/value object (initially CUSTOMER, PARTNER, ADMIN), not arbitrary strings.

---

## 23. Platform integrations

External vendors are adapters behind ports, grouped by capability under `platform/integrations` as appropriate: maps, payment, SMS, email, push, storage, etc.

Domains depend on ports; they never instantiate or import Google Maps, Razorpay, MSG91, Firebase, Resend, MinIO, or similar concrete adapters.

Provider selection is configuration-driven and testable. Provider failures use typed provider errors and observability.

---

## 24. API response and validation contracts

Public response contracts are typed and MUST NOT default generics to `any`.

Boundary payloads are validated. After validation, code works with typed values rather than propagating untrusted `any`.

Validation errors may expose safe machine-readable field codes required by client/SDUI form rendering.

---

## 25. Generated artifacts and source control

Generated compilation output is not source code.

The final repository MUST NOT track:

- `**/dist/**`
- `**/*.tsbuildinfo`
- generated JavaScript emitted from TypeScript source
- generated declarations/source maps produced by normal builds

Git ignore rules are recursive. A clean build may generate artifacts locally/CI but `git status` must remain clean except for intentionally generated versioned assets explicitly documented here.

---

## 26. Package naming and uniqueness

Every architectural responsibility has exactly one package/source of truth. Duplicate package responsibilities and duplicate package names are forbidden.

Canonical naming uses examples such as:

- `@carbroz/foundation-kernel`
- `@carbroz/sdui-engine`
- `@carbroz/platform-database`
- `@carbroz/platform-cache`
- `@carbroz/platform-messaging`
- `@carbroz/platform-observability`
- `@carbroz/domain-identity`
- `@carbroz/domain-customer`
- `@carbroz/domain-partner`
- `@carbroz/domain-catalog`
- `@carbroz/domain-booking`
- `@carbroz/domain-operations`
- `@carbroz/domain-financials`

Historical phase numbers belong to Git history, not production package organization or source comments.

---

## 27. Testing policy

All executable production TypeScript owned by CarBroz must reach final merge thresholds of:

```text
Statements: 100%
Branches:   100%
Functions:  100%
Lines:      100%
```

Type-only declarations, generated Prisma/client code, generated artifacts, and pure barrel exports are not executable coverage goals; they are validated by compilation and architecture checks.

Coverage exclusions MUST NOT be added merely to achieve a number. Any legitimate exclusion requires an explicit constitution amendment/rationale.

Required test layers include:

- Unit tests.
- Domain invariant/value-object tests.
- State-machine tests.
- Use-case tests.
- Repository contract tests.
- Real Prisma/PostgreSQL integration tests.
- Transaction rollback tests.
- Concurrency tests.
- HTTP route tests.
- Authentication and authorization tests.
- Provider adapter tests.
- SDUI schema/builder/serialization/versioning tests.
- Configuration tests.
- Error contract tests.
- Architecture dependency tests.
- Security regression tests.
- End-to-end critical-flow tests.

---

## 28. Mandatory SDUI test matrix

Valid structural cases MUST include:

- Template → Component → Element.
- Template → Component → Section → Element.
- Template → Component → Section → Group → Element.
- One template containing all three component shapes simultaneously.
- Multiple Components.
- Multiple Sections.
- Multiple Groups.
- Multiple Elements.

Invalid tests MUST include zero Components, no terminal Element path, empty selected structural arrays, Component with both elements+sections, Section with both elements+groups, Component→Group, Template→Element, Template→Section, Group→Section, structural children under Element, invalid targetApp, unsupported schema version, malformed actions/properties, and duplicate IDs where the contract requires uniqueness.

---

## 29. Mandatory security and business test matrices

Authentication tests cover OTP generation/hash/expiry/attempts/resend/reuse/wrong binding, production mock-provider rejection, access token signature/issuer/audience/expiry, refresh rotation/reuse/revocation/expiry/device binding, logout, and logout-all.

Booking/Operations tests cover ownership, future-time validation, inactive catalog entries, capacity, parallel reservation race, slot expiration, partner capability/availability/leave/radius/workload, assignment, service lifecycle, cancellation, and invalid state transitions.

Financial tests cover money arithmetic/rounding, quotations, tax/discount rules, payment creation/capture/failure, webhook signature/replay/idempotency, transaction rollback, invoice/refund/commission/payout, and ledger balancing.

---

## 30. Architecture tests

Automated architecture checks MUST fail if:

- domain code imports Fastify/Prisma/platform implementations;
- API owns business use cases/entities/repositories;
- platform/database imports every business domain or exports business repositories;
- multiple SDUI contract packages exist;
- generic `common`/`shared` business architecture is reintroduced;
- generated dist artifacts are tracked;
- duplicate package names/responsibilities exist;
- forbidden cross-domain imports or cycles exist;
- legacy SDUI structural terms are reintroduced after migration freeze.

---

## 31. Toolchain and CI gates

Local and CI tool versions must match the repository-declared package manager/runtime policy. CI uses a frozen lockfile.

Final merge validation includes, as applicable:

```text
pnpm install --frozen-lockfile
Prisma validate/generate
typecheck
lint
format check
build
unit tests
integration tests
architecture tests
contract tests
e2e tests
100% coverage
dependency-cycle check
unused/dead-code check
duplicate package-name check
tracked-generated-file check
```

A project that only compiles is not considered validated.

---

## 32. Migration rules

Every legacy file receives one explicit decision: KEEP AS-IS, REFACTOR, REWRITE, or DELETE.

Defective behavior is not preserved merely because it already exists.

Known V3 migration outcomes include:

- fixed/mock production OTP logic → REWRITE;
- predictable refresh-token generation → REWRITE;
- ineffective transaction propagation → REWRITE;
- business-heavy `packages/common` → DELETE after migration;
- `shared/kernel` → DELETE after migration;
- duplicate UI SDKs → DELETE/REPLACE with `sdui-engine`;
- old Subcomponent/Child/ChildrenData hierarchy → DELETE;
- app-owned business use cases → MOVE/REFACTOR into owning domains;
- central platform business repositories → MOVE into owning domain infrastructure;
- tracked dist output → DELETE;
- stale competing architecture docs → DELETE after constitution migration.

During migration, old code may temporarily coexist only when required to keep the branch buildable. Temporary duplication MUST be removed before freeze.

---

## 33. Final merge freeze criteria

Backend V3 is not merge-ready until all are true:

- exactly one architecture constitution;
- no duplicate architecture packages or SDUI authorities;
- no global business God package;
- no business repositories owned by generic database platform;
- no business use cases owned by API app;
- no tracked normal build output;
- no legacy SDUI hierarchy in canonical runtime contracts;
- no hardcoded production OTP;
- no predictable refresh-token design;
- real transaction propagation proven by rollback tests;
- no forbidden technology imports from domain;
- no unresolved dependency cycles;
- no unjustified `any` in core contracts;
- expected business failures map to stable non-500 behavior;
- security, transaction, SDUI, integration, architecture, and E2E suites pass;
- executable production coverage is 100/100/100/100;
- fresh install/build/test succeeds;
- clean Git tree after validation.

---

## 34. Amendment rule

This constitution is intentionally strict. Implementation MUST NOT silently deviate from it.

If implementation evidence proves a rule is incorrect or incomplete, the change sequence is:

1. document the evidence;
2. amend this constitution intentionally;
3. add/update enforcement tests;
4. then change production code.

Architecture drift by convenience is forbidden.
