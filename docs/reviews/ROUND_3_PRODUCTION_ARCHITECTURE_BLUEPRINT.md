# CarBroz Backend — Round 3 Production-Grade Architecture Blueprint

## Executive Architecture Summary

CarBroz is a single, unified backend platform built as a **Modular Monolith** serving four client delivery surfaces: **Customer App**, **Partner App**, **Corporate Experience**, and **Admin Panel**.

Following Round 3 architectural refinement, the codebase adopts an in-app **Feature-Bounded Monolith Architecture** located inside `apps/backend-api/src/features/`.

---

## 1. Answers to 25 Production-Grade Architectural Questions

### Q1: Overall Architecture Evaluation
- **Verdict**: **In-App Feature-Bounded Modular Monolith (`apps/backend-api/src/features/`) is the optimal architecture**.
- **Refinements**: Standardize feature internal directories into clean DDD sub-layers (`domain/`, `application/`, `infrastructure/`, `delivery/`, `ui/`, `public/`, `feature.manifest.ts`, `README.md`).

### Q2: Workspace Package Boundaries
- **`@carbroz/common-kernel`**: Foundational domain base classes (`Entity`, `AggregateRoot`, `ValueObject`, `Result`), universal VOs (`Money`, `Coordinates`), and domain errors.
- **`@carbroz/platform`**: Shared infrastructure adapters (`CacheProvider`, `QueueProvider`, `EventBus`, `StorageProvider`, `SmsProvider`, `EmailProvider`, `CryptoProvider`, `ClockProvider`).
- **`@carbroz/database`**: Centralized `schema.prisma`, generated `@prisma/client`, and `PrismaTransactionProvider`.
- **`@carbroz/ui-sdk`**: Pure domain-agnostic layout composition engine (`ScreenFactory`, `BaseScreenBuilder`, node primitives, `UI` DSL, Zod schemas). Zero business domain imports.
- **`@carbroz/config`**, **`@carbroz/feature-flags`**, **`@carbroz/logger`**: Infrastructure utility wrappers.

### Q3: Common Kernel Exact Audit
- **KEEP**: `Entity<T>`, `AggregateRoot<T>`, `ValueObject<T>`, `Result<T, E>`, `IDomainEvent`, `Money`, `Coordinates`, `DomainError` hierarchy.
- **REMOVE / MOVE OUT**: Generic `IRepository` (abolished), `AddressSnapshot` (moved to Customer domain).

### Q4: Platform Package Scope
- **YES**. Technical services (Cache, Queue, EventBus, Storage, SMS, Email, Crypto, Clock) belong in `@carbroz/platform` so features consume interface ports without coupling to vendor SDKs (Redis, S3, Twilio).

### Q5: Canonical Feature Folder Layout
```
src/features/booking/
├── domain/                                # PURE DOMAIN LAYER
│   ├── entities/                          # Booking.ts
│   ├── value-objects/                     # BookingSlot.ts
│   ├── events/                            # BookingCreatedEvent.ts
│   ├── policies/                          # BookingCancellationPolicy.ts
│   ├── specifications/                    # EligiblePartnerSpecification.ts
│   ├── repositories/                      # IBookingRepository.ts (Port)
│   └── services/                          # BookingPricingCalculator.ts
├── application/                           # APPLICATION LAYER
│   ├── use-cases/                         # CreateBookingUseCase.ts
│   ├── commands/                          # CreateBookingCommand.ts
│   ├── queries/                           # GetBookingDetailsQuery.ts
│   ├── dtos/                              # booking.dto.ts
│   ├── mappers/                           # BookingDtoMapper.ts
│   └── validators/                        # BookingInputValidator.ts
├── infrastructure/                        # PERSISTENCE & ADAPTERS
│   ├── repositories/                      # PrismaBookingRepository.ts
│   ├── mappers/                           # PrismaBookingMapper.ts
│   └── transactions/                      # BookingTransactionAdapter.ts
├── delivery/                              # TRANSPORT-AWARE DELIVERY SURFACES
│   ├── rest/                              # REST API Controllers & Routes
│   │   ├── customer/                      # CustomerBookingController.ts
│   │   ├── partner/                       # PartnerBookingController.ts
│   │   ├── corporate/                     # CorporateBookingController.ts
│   │   └── admin/                         # AdminBookingController.ts
│   ├── websocket/                         # Live Booking WebSocket Gateways
│   ├── grpc/                              # High-speed internal gRPC endpoints
│   ├── events/                            # Event Subscribers (PaymentCompletedSubscriber.ts)
│   └── jobs/                              # Background Queue Handlers (BookingExpiryJob.ts)
├── ui/                                    # FEATURE SDUI BUILDERS
│   ├── customer/                          # SlotSelectionBuilder.ts, BookingConfirmationBuilder.ts
│   ├── partner/                           # PartnerJobCardBuilder.ts
│   └── corporate/                         # CorporateBookingCheckoutBuilder.ts
├── public/                                # STRICT PUBLIC BARREL
│   └── index.ts                           # Exposed public contracts ONLY
├── tests/                                 # CO-LOCATED SPEC SUITE
│   ├── Booking.spec.ts
│   └── CreateBookingUseCase.spec.ts
├── feature.manifest.ts                    # Declarative Feature Metadata
├── booking.module.ts                      # Awilix DI & Fastify Route Self-Registration
└── README.md                              # Mandatory Feature Documentation
```

### Q6: Domain Layer Division
- Divided into `entities/`, `value-objects/`, `events/`, `policies/`, `specifications/`, `repositories/`, `services/`.

### Q7: Application Layer Division
- Divided into `use-cases/`, `commands/`, `queries/`, `dtos/`, `mappers/`, `validators/`.

### Q8: Persistence Layer Division
- Inside feature `infrastructure/`: `repositories/` (Prisma implementations), `mappers/` (Prisma Model <-> Domain Entity mappers), `transactions/`.

### Q9: Delivery Layer Division
- Divided by transport: `rest/` (customer, partner, corporate, admin), `websocket/`, `grpc/`, `events/` (subscribers), `jobs/` (queue handlers).

### Q10: UI Layer Division
- Divided by persona: `ui/customer/`, `ui/partner/`, `ui/corporate/`. Concrete builders extend `BaseScreenBuilder` from `@carbroz/ui-sdk`.

### Q11: Internal Folder vs Encapsulation
- Replaced by `public/index.ts` encapsulation. All files outside `public/` are private to the feature.

### Q12: Public API Rules (`public/index.ts`)
- **`public/index.ts` is required**. Exposes ONLY domain entities, use-case interfaces, commands, queries, and DTOs. Internal implementations are protected.

### Q13: `feature.manifest.ts` Metadata
- **YES**. Declarative manifest defining name, owner, allowed dependencies, events emitted/subscribed, routes, screens, and permissions.

### Q14: Automatic Module Registration (`booking.module.ts`)
- App bootstrap executes automated discovery scanning `src/features/*/*.module.ts` during startup.

### Q15: Dependency Rules & Automated Enforcement
- ESLint boundaries + Vitest architecture test (`architecture.spec.ts`) asserting zero circular imports and zero forbidden deep imports across feature boundaries.

### Q16: Events Location
- Feature domain events defined in `domain/events/`. Handlers in `delivery/events/`.

### Q17: Policies Location
- Pure domain business rules sit in `domain/policies/` (`BookingCancellationPolicy.ts`, `RefundPolicy.ts`).

### Q18: Specifications Pattern
- Business rule predicates and query filters sit in `domain/specifications/` (`PartnerAvailableSlotSpecification.ts`).

### Q19: Mappers Location
- `application/mappers/` for DTO ↔ Domain Entity.
- `infrastructure/mappers/` for Prisma DB model ↔ Domain Entity.
- `ui/mappers/` for Domain View DTO ↔ SDUI Node.

### Q20: Testing Architecture
- Unit & Integration tests co-located beside implementation files (`Booking.ts` -> `Booking.spec.ts`). Global E2E API tests in `apps/backend-api/tests/`.

### Q21: Documentation Standard (`README.md`)
- Mandatory 10-section markdown file in every feature folder.

### Q22: Future Feature Standard Template
- Copy-paste ready 7-layer directory template (`features/<new_feature>/`).

### Q23: Future Microservice Extraction Plan
- 1-to-1 feature isolation allows wrapping `src/features/<feature>/` in a standalone Fastify server app wrapper in under 2 hours without rewriting domain or database code.

### Q24: Technical Risks & Mitigations
- Documented import path aliases (`@features/*`) and Awilix Cradle parameter checks.

### Q25: Canonical Monorepo Tree
- Complete, unabridged repository tree from monorepo root down to feature spec files.
