# 14 — Architecture Decision Records (ADRs)

## ADR-01: Adoption of Feature Co-Location (100% Single Feature Ownership)
- **Status**: PROPOSED
- **Context**: Code for a single feature was previously scattered across `@carbroz/common`, `@carbroz/database`, and `apps/backend-api/src/modules/`.
- **Decision**: All domain models, repository interfaces, Prisma implementations, use cases, delivery controllers, SDUI builders, and tests for a single capability will be co-located inside `features/<feature>/` (or modular `src/modules/<feature>/`).
- **Consequences**: Drastically improves developer experience and code navigation. Single directory contains 100% of feature logic.

---

## ADR-02: Delivery Surfaces as Sub-Folders Within Feature Modules
- **Status**: PROPOSED
- **Context**: Client applications (Customer, Partner, Corporate, Admin) were previously confused with business domains.
- **Decision**: Client delivery surfaces exist inside feature modules under `delivery/customer/`, `delivery/partner/`, `delivery/admin/`, and `delivery/corporate/`.
- **Consequences**: Business domain logic (`Booking`, `Catalog`) remains 100% DRY and single-sourced, while surface-specific REST routing and SDUI builders are cleanly segregated.

---

## ADR-03: Minimal Shared Kernel Boundary
- **Status**: PROPOSED
- **Context**: `@carbroz/common` contained domain entities for 20+ business domains.
- **Decision**: Restrict `@carbroz/common-kernel` to base abstractions (`Entity`, `ValueObject`, `Result`), universal value objects (`Money`, `Coordinates`, `AddressSnapshot`), and base repository ports.
- **Consequences**: Prevents `@carbroz/common-kernel` from becoming an overstuffed monolith.

---

## ADR-04: Self-Registering Feature DI Modules
- **Status**: PROPOSED
- **Context**: `apps/backend-api/src/container/index.ts` was a 580-line monolithic DI binding script.
- **Decision**: Every feature package/module exports a `<feature>.module.ts` self-registration block executed during application bootstrap.
- **Consequences**: Decouples DI registration and prevents merge conflicts.
