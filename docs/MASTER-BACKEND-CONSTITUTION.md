# CarBroz Backend V3 Master Constitution

**Status:** Normative architecture source of truth  
**Applies to:** Customer, Partner, Admin, API, domains, platform, SDUI, data, security, tests, tooling  
**Branch:** `architecture/backend-v3-clean`

---

## 1. Authority

This is the single normative architecture document for CarBroz Backend V3. Implementation and tests are the evidence of compliance. Names such as factory, builder, clean architecture, repository, provider, or unit of work are not evidence by themselves.

No competing architecture document may redefine these rules. Historical phase/audit/design documents are migration input only and must not survive as parallel architecture authorities.

## 2. Architectural style

CarBroz is a modular monolith using DDD bounded contexts, Clean/Hexagonal Architecture, Dependency Inversion, Ports and Adapters, explicit application use cases, event-driven readiness, PostgreSQL, Prisma as infrastructure, Fastify as transport, Zod at runtime boundaries, and a pnpm workspace.

Microservices are not the current deployment model, but boundaries must remain independently testable and extractable.

## 3. Canonical topology

```text
apps/api                 transport + composition root only
foundation/kernel        one universal kernel
domains/*                bounded contexts
packages/sdui-engine     one canonical SDUI structural/composition engine
platform/*               technical capabilities/integrations
tests/*                  architecture/contracts/integration/e2e
prisma/*                 schema/migrations/seed
docs/MASTER-BACKEND-CONSTITUTION.md
```

Final V3 forbids top-level shared business architecture, a generic business `common` God-package, duplicate kernels, duplicate UI SDKs, duplicate business repositories, tracked normal build output, and duplicate package responsibilities.

## 4. Foundation kernel

Exactly one kernel exists: `foundation/kernel` / `@carbroz/foundation-kernel`.

It may own only universal primitives such as Entity/AggregateRoot/ValueObject, DomainEvent, Result/error primitives, Money, Clock/ID ports, pagination, actor identity and truly universal transaction contracts.

It must not own User, Customer, Partner, Booking, Payment, Coupon, Review, Address, KYC, SDUI screen models, or other CarBroz business concepts. `shared/kernel` must disappear after migration.

## 5. Bounded-context ownership

- **Identity:** User, Session, authentication, OTP, token/session policy, roles, permissions.
- **Customer:** CustomerProfile, preferences, addresses, customer garage/vehicles.
- **Partner:** Partner/Profile, organization/member concepts, KYC, capabilities, declared availability/leave.
- **Catalog:** ServiceCategory, Service, Addon, pricing configuration, multipliers, tax classification metadata.
- **Booking:** Booking aggregate, lifecycle/state machine, snapshots, cancellation and booking invariants. Not capacity/dispatch.
- **Operations:** slots, capacity, availability, assignment, dispatch, radius/travel feasibility, workload, tracking, ETA and service execution.
- **Financials:** payment, invoice, refund, payout, commission, taxes, ledger, settlement and payment webhooks.
- **Communications:** notification concepts, templates/preferences, delivery policy; vendor adapters remain platform integrations.
- **Engagement:** reviews, ratings, coupons, promotions/offers.
- **Configuration:** persisted runtime/business configuration, feature rollout, maintenance/version/bootstrap policy; not secrets/env configuration.
- **SDUI:** screen metadata, drafts, publish/version/rollback lifecycle and persistence. It consumes but never redefines `sdui-engine`.
- **Audit:** immutable business/security audit records and actor/action semantics.

## 6. Domain structure

Domains use only folders with real responsibilities. Typical structure:

```text
domains/<domain>/src/
├── domain/{entities,value-objects,events,services,repositories}
├── application/{commands,queries,use-cases,dto,ports}
├── infrastructure/{persistence,mappers,adapters}
├── presentation/
├── composition/
└── public/
```

Domain entities and repository ports belong to their bounded context, never a global common package.

## 7. Dependency law

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

Domain code must not import Fastify, Prisma, Redis, Awilix, vendor SDKs, filesystem APIs, `process.env`, or concrete platform infrastructure. Application code depends on domain + ports, not concrete infrastructure. Infrastructure implements ports. API composes and transports; it does not own business entities/use cases/repositories/SDUI contracts.

Architecture tests must enforce dependency direction and cycles.

## 8. API application

Final application is `apps/api` / `@carbroz/api`. It owns Fastify/server lifecycle, request context, middleware/plugins/guards, error-to-HTTP mapping, route composition, bootstrap/composition, readiness and shutdown only.

Public product APIs use `/api/v1/...`. Every route declares explicit access policy. Security cannot rely only on a soft global JWT decode hook.

## 9. Authentication/session security

Production OTP requires cryptographically secure generation, hash-at-rest, expiry, attempt limit, resend cooldown, one-time consumption, challenge+phone binding, rate limiting and provider abstraction. Production bootstrap rejects mock/development OTP modes.

Refresh tokens require cryptographic strength, rotation, expiry, revocation, session/device binding and reuse detection. Token policy is centralized. OTPs, access/refresh tokens, authorization headers and secrets are never logged.

## 10. Authorization/resource ownership

Transport authorization and resource ownership are separate checks. User-owned resources must validate actor ownership or explicit permission. External APIs prefer public UUID-like identifiers over internal autoincrement IDs.

## 11. Persistence/repositories

`platform/database` owns Prisma client lifecycle, connection health, transaction infrastructure and database-level utilities only.

Business Prisma repositories belong in their owning domain infrastructure. Platform/database must not export every business repository or depend on every domain. Domain/application contracts never expose Prisma types.

## 12. Transactions

A transaction is real only when all repository operations inside the callback use the same underlying database transaction. Critical flows require real PostgreSQL rollback tests. Passing a transaction client that repositories ignore is forbidden.

## 13. Events/outbox

Cross-domain side effects should use versioned domain events and a transactional outbox rather than deep repository coupling. Domain change + outbox insertion must commit atomically when required. Delivery is retryable/idempotent.

## 14. Money/financial invariants

Money is integer minor units + currency; INR uses paise. Floating-point monetary storage/arithmetic is forbidden. Pricing produces immutable/versioned quotation snapshots. Tax rules do not live as hardcoded Booking logic. Ledger/payout/refund/settlement invariants require tests.

## 15. Booking/operations invariants

Booking owns booking state; Operations owns capacity/availability/dispatch/tracking/execution. Slot reservation must be concurrency-safe. Booking transitions are explicit and encapsulated. Business-time policy uses a Clock abstraction.

## 16. Error architecture

Expected business failures use typed error categories and must not accidentally become HTTP 500. HTTP mapping occurs at transport. Clients receive stable safe codes/details; internal stack/infrastructure details are never exposed.

## 17. Configuration

Secrets/environment configuration and persisted business configuration are separate. Reusable configuration packages do not call `process.exit()` during import. Only `.env.example` is the general committed template. Production rejects known unsafe/default credentials and development-only provider modes.

## 18. Observability/PII

Logs default to metadata, not payload dumps. OTP/token/auth headers, sensitive contact/address/coordinates/KYC/payment/vendor secrets are omitted or redacted. Meaningful provider failures cannot disappear in silent catches.

---

# SDUI CONSTITUTION

## 19. One canonical SDUI engine

Exactly one structural/composition package exists: `packages/sdui-engine` / `@carbroz/sdui-engine`. The deleted UI SDKs are not restored. Their valid composition capability is migrated into this canonical engine.

```text
packages/sdui-engine/src/
├── contract/            canonical Zod runtime structure
├── catalog/             reusable registered definitions
│   ├── template/
│   ├── component/
│   ├── section/
│   ├── group/
│   └── element/
├── factory/             validated instance creation
├── builder/             hierarchy-safe composition
├── validator/           canonical validation
├── serializer/          validated serialization/deserialization
├── versioning/          schema-version policy
└── public/              supported public API only
```

No API DTO/domain/shared/second SDK may independently redefine the hierarchy.

## 20. Canonical SDUI hierarchy

Template and Component are mandatory; Element is the terminal structural leaf. Section and Group are optional.

Every Component independently selects exactly one legal branch:

```text
Template → Component → Element
Template → Component → Section → Element
Template → Component → Section → Group → Element
```

One Template may mix these shapes across different Components.

Rules:

- Template contains a non-empty `components` array.
- Every Component resolves transitively to at least one Element.
- Component chooses `elements` OR `sections`, never both.
- Section chooses `elements` OR `groups`, never both.
- Component cannot contain Group directly.
- Template cannot contain Section/Group/Element directly.
- Group contains Elements only.
- Element cannot own structural descendants.
- Skipped levels are omitted, not represented by null/empty placeholders.
- Selected structural arrays are non-empty.
- Multiple Components/Sections/Groups/Elements are supported.
- Legacy `Subcomponent`, `Child`, `ChildrenData`, `subComponents`, `children`, `childrenData` are forbidden aliases and must not return.

## 21. SDUI definition vs instance vs runtime data

Reuse is a first-class invariant at **every level**: Template, Component, Section, Group and Element.

The engine distinguishes:

1. **Definition/type** — immutable reusable structure/semantics registered in the catalog, e.g. `form_template`, `profile_header`, `primary_button`.
2. **Instance/id** — one concrete use of a definition in one composed screen, e.g. `login_continue_button`.
3. **Runtime data/overrides** — permitted values for that instance, e.g. text, image, action, enabled state, labels, layout/property overrides.

`type` identifies reusable behavior/structure. `id` identifies the concrete instance. They are never treated as the same concept.

A definition may be reused on Login, Dashboard, Booking or another screen with different IDs and data without duplicating its implementation.

Example:

```text
primary_button definition
├── login_continue_button    data.text = "Continue"
└── dashboard_book_button    data.text = "Book Now"
```

Reuse is by configuration. A new definition is created only when structure or semantics genuinely differ. Arbitrary mutation that makes a registered definition meaningless is forbidden.

## 22. SDUI catalog/registry

The catalog is the extension point for reusable UI vocabulary.

To introduce a new UI type:

```text
create definition → register canonical type → compose/use through factory/builder
```

Examples:

```text
catalog/template/FormTemplate
catalog/template/DashboardTemplate
catalog/component/ProfileHeaderComponent
catalog/section/FormSection
catalog/group/InputGroup
catalog/element/PrimaryButtonElement
```

Registries exist independently for Template, Component, Section, Group and Element. Duplicate type registration must fail. Unknown type resolution must fail. Runtime filesystem scanning/dynamic discovery is forbidden; registration is deterministic and explicit.

Screen/business modules must not duplicate registry mechanics.

## 23. Factory responsibility

Factories create one validated instance from a registered reusable definition plus instance input/runtime data. Factories do not own screen-specific business decisions.

Canonical responsibilities include TemplateFactory, ComponentFactory, SectionFactory, GroupFactory and ElementFactory.

Factories validate output against canonical schemas before returning it. Raw/unregistered creation, when intentionally exposed for infrastructure/testing/composition primitives, must still pass canonical schema validation.

## 24. Builder responsibility

Builders compose legal trees and enforce hierarchy invariants while building, not only after serialization.

Canonical builders include ScreenBuilder, TemplateBuilder, ComponentBuilder, SectionBuilder and GroupBuilder.

Builders expose canonical vocabulary only: `addComponent`, `addSection`, `addGroup`, `addElement`. Legacy `addSubcomponent`, `addChild`, `addChildData` are forbidden.

A ComponentBuilder that has selected direct Elements must reject Sections, and vice versa. A SectionBuilder that has selected direct Elements must reject Groups, and vice versa. Empty selected branches fail canonical validation.

## 25. Screen-specific composition ownership

Reusable structural definitions belong to `sdui-engine`. Business/screen-specific composition belongs to the appropriate bounded context/application presentation layer, for example an Identity Login composer or Customer Dashboard composer.

A screen composer selects registered definitions and supplies business/runtime data; it must not redefine how `primary_button`, `profile_header`, `form_template`, etc. structurally work.

Example conceptual flow:

```text
LoginScreenComposer
  → form_template
  → auth_header component
  → form component
  → input section/group
  → phone_input + primary_button elements
```

Dashboard may reuse the same header/button/group definitions with different instance IDs and runtime data.

## 26. SDUI element responsibility

Element is the atomic leaf and may contain id, type, typed properties, actions, analytics, accessibility, validation, binding, visibility and metadata according to versioned contracts. Unknown expansion is validator/version controlled; unrestricted `any` is forbidden in the core hierarchy.

## 27. SDUI persistence/versioning

Published SDUI is an immutable versioned document stored in PostgreSQL JSONB after canonical validation. Published metadata includes screenId, targetApp, schemaVersion, version, templateId, templateType, documentJson/checksum/status and creation/publish metadata.

```text
Composer/Admin Editor
→ canonical builder/factory
→ canonical validator
→ Draft
→ Publish
→ Immutable Version
→ PostgreSQL JSONB
→ validated read
→ Client
```

Corrupted published documents are observable contract failures, not silently replaced with static fallback. `targetApp` is finite: CUSTOMER, PARTNER, ADMIN. Schema-version support is explicit and tested.

## 28. SDUI test matrix

Tests must cover all three legal branches, mixed components in one template, multiples at every level, zero/empty structural branches, illegal mixed branches, illegal skipped relationships, structural descendants under Element, duplicate IDs, invalid targetApp/schema version, malformed actions/properties, unknown/duplicate registry definitions, factory validation, builder invariants, serialization round-trip, and reuse of one definition with different IDs/runtime data.

---

## 29. Platform integrations

External vendors are adapters behind ports. Domains never instantiate/import concrete Maps, payment, SMS, email, push or storage vendor SDKs. Provider selection is configuration-driven, typed and observable.

## 30. API/validation contracts

Public response contracts are typed and do not default to `any`. Boundary payloads are validated before use. Safe machine-readable validation codes may be exposed for SDUI forms.

## 31. Generated artifacts/source control

Normal generated output is not source and final V3 must not track `**/dist/**`, `**/*.tsbuildinfo`, normal emitted JS/declarations/maps, or coverage output. A clean build must not leave unintended tracked changes.

## 32. Package naming/uniqueness

Every responsibility has one owner. Duplicate package responsibilities/names are forbidden. Historical phase numbers belong to Git history, not final production organization.

## 33. Testing policy

All executable CarBroz production TypeScript targets final merge coverage of 100% statements, branches, functions and lines. Generated/type-only/barrel files are validated by build/architecture checks rather than fake coverage. Exclusions cannot be added merely to reach a number.

Required layers include unit, domain invariant, state-machine, use-case, repository contract, real Prisma/PostgreSQL integration, rollback/concurrency, HTTP/auth/authz, provider adapter, SDUI schema/catalog/factory/builder/serialization/versioning, configuration, error, architecture, security and critical E2E tests.

## 34. Architecture enforcement

Automated checks must fail on forbidden domain technology imports, app-owned business logic, platform-owned business repositories, multiple SDUI authorities, reintroduced common/shared God architecture, tracked generated output, duplicate responsibilities, dependency cycles, legacy SDUI terms, or architecture policy scanning generated `dist` as if it were source.

Architecture scans must target actual source and intentionally exclude generated output.

## 35. Migration rules

Every legacy file receives KEEP, REFACTOR, REWRITE or DELETE based on evidence. Defective behavior is never preserved solely for compatibility.

Known outcomes:

- business-heavy `packages/common` → migrate ownership then DELETE;
- `shared/kernel` → consolidate useful universal primitives then DELETE;
- duplicate UI SDKs → remain DELETED; valid builder/factory/catalog capability lives in `sdui-engine`;
- Subcomponent/Child/ChildrenData → DELETE, never alias;
- app-owned business use cases → MOVE/REFACTOR to domain;
- central platform business repositories → MOVE to domain infrastructure;
- tracked dist → DELETE;
- competing architecture docs → DELETE.

Temporary coexistence is allowed only when necessary to keep migration controlled and must be removed before freeze. Compatibility shims that preserve wrong ownership are forbidden.

## 36. Final freeze criteria

V3 is not merge-ready until there is exactly one constitution, one kernel, one SDUI authority, no common/shared business God package, no platform-owned business repositories, no app-owned business use cases, no tracked normal build output, no legacy SDUI hierarchy, secure auth/session design, real transaction propagation, no forbidden dependency cycles/imports, stable error mapping, all required test layers green, executable production coverage 100/100/100/100, fresh install/build/test green, and clean Git status after validation.

## 37. Amendment rule

Implementation must not silently deviate from this constitution. When evidence proves a rule incomplete or wrong: document evidence, amend this constitution intentionally, add/update enforcement tests, then change production code. Architecture drift by convenience is forbidden.
