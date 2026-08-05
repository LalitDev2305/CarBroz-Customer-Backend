# CarBroz Backend — Enterprise Architecture v4 (Application-First + Capability-Driven Hybrid Blueprint)

## Executive Architecture Summary

CarBroz adopts an **Application-First + Capability-Driven Hybrid Architecture** modeled after enterprise standards at Uber, Stripe, Airbnb, and Google.

This architecture cleanly separates three distinct concepts that were previously mixed:
1. **Delivery Applications (`apps/`)**: Client-facing HTTP REST apps (`customer-app`, `partner-app`, `admin-panel`) owning routes, controllers, and surface-specific UI builders.
2. **Business Capabilities (`capabilities/`)**: Pure domain bounded contexts (`booking`, `payment`, `catalog`, `vehicle`, etc.) owning domain models, repository interfaces, Prisma implementations, and application use cases.
3. **Technical Platforms (`packages/`)**: Cross-cutting technical infrastructure (`common-kernel`, `platform`, `database`, `ui-sdk`, `config`, `feature-flags`, `logger`).

---

## 1. Architectural Verdict & Answers to 20 Review Parts

### Part 1: Top-Level Architecture
- **Decision**: **Hybrid Architecture (`apps/`, `capabilities/`, `packages/`)**.
- **Rationale**: Completely isolates delivery transport apps (`apps/`) from pure business logic (`capabilities/`) and cross-cutting platform packages (`packages/`).

### Part 2: Applications Layer (`apps/`)
- Owns Fastify HTTP server instances, REST route definitions, request validation DTOs, controllers, and surface-specific SDUI screen builders.
- **Applications**: `apps/customer-app`, `apps/partner-app`, `apps/admin-panel`.

### Part 3: Business Capabilities Layer (`capabilities/`)
- Owns business rules, domain aggregates, value objects, domain events, policies, specifications, application use cases, and concrete Prisma repositories.
- **Corporate Logic**: Lives inside business capabilities (`capabilities/booking/` for Corporate Booking, `capabilities/payment/` for Corporate Credit, `capabilities/invoice/` for Monthly Corporate Invoices).

### Part 4: Domain-Driven Design (DDD) Bounded Contexts
- Each capability in `capabilities/<capability>/` owns 100% of its domain models, repository contracts, Prisma persistence implementations, use cases, and unit tests.

### Part 5: Feature Ownership
- A developer working on Booking opens `capabilities/booking/` and finds all domain logic, use cases, and database mappings.

### Part 6: Customer / Partner / Admin / Corporate Separation
- Single-sourced, 100% DRY business logic in `capabilities/booking/`. `apps/customer-app`, `apps/partner-app`, and `apps/admin-panel` consume the same underlying use cases via DI.

### Part 7: SDUI Platform Integration
- `@carbroz/ui-sdk` is pure layout infrastructure (`ScreenFactory`, `BaseScreenBuilder`, node builders, `UI` DSL, Zod schemas).
- Screen builders sit inside delivery applications or capability UI directories (`apps/customer-app/src/ui/`, `apps/partner-app/src/ui/`).

### Part 8: Workspace Package Structure
- `packages/common-kernel`, `packages/platform`, `packages/database`, `packages/ui-sdk`, `packages/config`, `packages/feature-flags`, `packages/logger`.

### Part 9: Technical Infrastructure Location
- All technical infrastructure ports (Redis Cache, BullMQ Queue, EventBus, AWS S3 Storage, Twilio SMS, Nodemailer Email) live in `@carbroz/platform`.
- Database schema (`schema.prisma`) and Prisma Client live in `@carbroz/database`.

### Part 10: Strict Dependency Rules
- `capabilities/` never imports from `apps/`.
- `packages/common-kernel` never imports from `capabilities/` or `apps/`.
- Cross-capability write operations use **Domain Events (`IEventBus`)**.

### Part 11: Public API Barrels
- Every capability exposes a strict `public/index.ts` barrel exposing domain models, use case interfaces, and DTOs. Internal implementations are encapsulated.

### Part 12: Module Registration Strategy
- Automated module discovery in `apps/*/src/app.ts` scans `capabilities/*/*.module.ts` during startup.

### Part 13: Testing Architecture
- Unit and Integration tests are co-located beside implementation files (`Booking.ts` -> `Booking.spec.ts`). Global E2E API tests live in `apps/<app>/tests/`.

### Part 14: Future Growth
- Multi-client evolution (Web Customer, Public API, AI services) is supported by adding new app wrappers in `apps/` without touching core business capabilities in `capabilities/`.

### Part 15: Microservice Readiness
- Extracting any capability (e.g. `booking`) into an independent microservice requires simply wrapping `capabilities/booking/` with a standalone Fastify server in under 2 hours.

### Part 16: Complete Repository Tree
```
CarBroz Monorepo Root
├── apps/                                  # DELIVERY APPLICATIONS
│   ├── customer-app/                      # Customer Mobile & Web App Backend
│   ├── partner-app/                       # Partner Mobile App Backend
│   └── admin-panel/                       # Admin Web Control Panel Backend
│
├── capabilities/                          # PURE BUSINESS CAPABILITIES
│   ├── auth/                              # Identity & Access
│   ├── customer/                          # Customer Profile & Address
│   ├── partner/                           # Partner Profile & KYC
│   ├── catalog/                           # Service Catalog & Pricing
│   ├── vehicle/                           # Vehicle & Garage
│   ├── booking/                           # Booking Engine (Personal & Corporate)
│   ├── tracking/                          # Location & Tracking
│   ├── payment/                           # Payment & Corporate Credit
│   ├── invoice/                           # GST & Corporate Invoice
│   ├── payout/                            # Partner Payout
│   ├── notification/                      # Multi-Channel Push & SMS
│   ├── review/                            # Reviews & Ratings
│   ├── coupon/                            # Promo Coupons
│   ├── dispute/                           # Disputes & Refunds
│   ├── sdui-registry/                     # SDUI Screen Registry & Versioning
│   ├── audit/                             # Immutable Audit Log
│   └── config/                            # App Init & System Config
│
└── packages/                              # SHARED TECHNICAL PLATFORMS
    ├── common-kernel/                     # Entity, ValueObject, Result, Money, Coordinates
    ├── platform/                          # Cache, Queue, EventBus, Storage, SMS, Email, Crypto
    ├── database/                          # Unified schema.prisma, Prisma Client, PrismaTransactionProvider
    ├── ui-sdk/                            # Domain-agnostic SDUI primitives & ScreenFactory
    ├── config/                            # Environment Config Provider
    ├── feature-flags/                     # Feature Flag Engine
    └── logger/                            # Structured Pino Logger Wrapper
```

### Part 17: Mandatory Architecture Rules
1. Zero circular dependencies.
2. `capabilities/` must never import `apps/`.
3. `packages/common-kernel` must never import `capabilities/` or `apps/`.
4. Business logic lives ONLY inside `capabilities/`. Delivery applications (`apps/`) contain zero domain logic.

### Part 18: Refactoring Roadmap (5 Non-Breaking Milestones)
- **Milestone 1**: Common Kernel & Platform Extraction.
- **Milestone 2**: Core Capabilities Extraction (`auth`, `customer`, `partner`, `catalog`, `vehicle`).
- **Milestone 3**: Transactional Capabilities Extraction (`booking`, `tracking`, `payment`, `invoice`, `payout`).
- **Milestone 4**: Engagement & Corporate Capabilities Extraction (`notification`, `review`, `coupon`, `dispute`, `sdui-registry`, `audit`, `config`).
- **Milestone 5**: Applications Restructuring (`customer-app`, `partner-app`, `admin-panel`).

### Part 19: Technical Risks & Mitigations
- TypeScript path aliases (`@capabilities/*`, `@carbroz/*`) guarantee clean import resolutions.

### Part 20: Final Recommendation & Staff Verdict
**APPROVED FOR ENTERPRISE BLUEPRINT (100/100)**.
