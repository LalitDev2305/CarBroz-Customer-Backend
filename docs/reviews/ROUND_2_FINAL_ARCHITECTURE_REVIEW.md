# CarBroz Backend — Round 2 Final Architecture Review & Refinement Blueprint

## Executive Architecture Summary

CarBroz is a single, unified backend platform built as a **Modular Monolith** serving four client delivery surfaces: **Customer App**, **Partner App**, **Corporate Experience**, and **Admin Panel**.

Following Round 2 architectural refinement, the codebase adopts an in-app **Feature-Bounded Monolith Architecture** located inside `apps/backend-api/src/features/`.

---

## 1. Answers to 17 Architectural Questions

### Q1: `features/` at Root vs `apps/backend-api/src/features/`
- **Recommendation**: **`apps/backend-api/src/features/`**.
- **Rationale**: CarBroz backend runs as a single application (`apps/backend-api`). Placing features in `apps/backend-api/src/features/` makes `apps/backend-api` self-contained, simplifies TypeScript path aliases (`@features/booking`), eliminates top-level monorepo pollution, and keeps all executable code inside `apps/backend-api/src/`.

### Q2: Prisma Repositories Ownership
- **Recommendation**: **Feature-Owned (`apps/backend-api/src/features/<feature>/infrastructure/repositories/`)**.
- **Rationale**: `@carbroz/database` owns ONLY `schema.prisma`, `@prisma/client` generation, migrations, and `PrismaTransactionProvider`. Concrete repository implementations sit inside each feature folder so feature developers own 100% of data mapping without modifying `@carbroz/database`.

### Q3: Common Kernel Audit & Classification
- `Entity<T>` -> **KEEP** (Universal Base class for entity equality)
- `AggregateRoot<T>` -> **KEEP** (Base class for domain event registration)
- `ValueObject<T>` -> **KEEP** (Base class for structural equality)
- `Result<T, E>` -> **KEEP** (Functional success/error wrapper)
- `IDomainEvent` -> **KEEP** (Domain event interface)
- `IRepository<T>`, `IReadRepository<T>`, `IWriteRepository<T>` -> **REMOVE** (Anemic generic repositories violate DDD; feature repositories must define explicit domain query methods).
- `Money` -> **KEEP** (Universal paise currency handling)
- `Coordinates` -> **KEEP** (Universal Lat/Lng VO)
- `AddressSnapshot` -> **MOVE** to `src/features/customer/domain/value-objects/` (Address logic is customer domain specific).
- `DomainError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ConflictError` -> **KEEP** (Universal HTTP/Domain errors).

### Q4: Generic Repositories vs Feature-Specific Repositories
- **Recommendation**: **Abolish Generic Repositories (`IRepository<T>`)**.
- **Rationale**: Generic CRUD repositories (`save`, `delete`, `findById`) encourage treating domain entities like database records. DDD repositories must express ubiquitous domain language (`findActiveBookingByCustomer`, `findAvailableSlotsForPartner`).

### Q5: Public API Rules & Barrels
- **Recommendation**: **Strict Public Barrel (`src/features/<feature>/index.ts`)**.
- **Rationale**: Features expose ONLY public contracts (domain models, use case interfaces, DTOs). Internal implementations (`infrastructure/`, internal use cases) are encapsulated.

### Q6: Module Registration Ownership
- **Recommendation**: **`registerFeatureModule(container, app)`**.
- **Rationale**: Each feature exports a `FeatureModule` definition that registers its dependencies in Awilix DI and mounts its Fastify REST routes in one unified call.

### Q7: Transport-Aware Delivery Architecture
- **Recommendation**: **Transport-Aware Layout (`delivery/rest/customer`, `delivery/rest/admin`, `delivery/events`, `delivery/jobs`)**.
- **Rationale**: Future-proofs the architecture for gRPC, WebSockets, background queue workers (`jobs/`), and event listeners (`events/`).

### Q8: Co-Located Testing Architecture
- **Recommendation**: **Co-located Beside Implementations**.
- **Rationale**: Unit tests sit right next to the code (`Booking.spec.ts` beside `Booking.ts`, `CreateBookingUseCase.spec.ts` beside `CreateBookingUseCase.ts`).

### Q9: Mandatory Feature `README.md`
- **Recommendation**: **Mandatory `README.md` per Feature**.
- **Rationale**: Documents owner team, dependencies, public APIs, delivery endpoints, SDUI screens, and events emitted.

### Q10: Explicit Feature Dependency Rules
- **Recommendation**: **Documented Acyclic Dependency Matrix**. Features communicate across boundaries via public use cases or Domain Events.

### Q11: Package Ownership Rules
- **Recommendation**: Document Owner, Consumers, Allowed Imports, and Forbidden Imports for all packages and features.

### Q12: SDUI Integration
- **Recommendation**: Platform capability (`@carbroz/ui-sdk` is pure DSL/schema). Screen builders sit in feature `ui/` folders.

### Q13: Delivery Surfaces (Customer, Partner, Corporate, Admin)
- **Recommendation**: Persona namespaces under `delivery/rest/<persona>/`.

### Q14: Routing Ownership
- **Recommendation**: Feature-owned routes mounted dynamically during `registerFeatureModule()`.

### Q15: Middleware Ownership
- **Recommendation**: Global cross-cutting middleware (CORS, Rate Limiting, JWT Parse) vs Feature-owned guards (e.g. `KycVerifiedGuard` in `features/partner/delivery/guards/`).

### Q16: Future Microservice Extraction
- **Recommendation**: Clean 1-to-1 feature isolation allows moving `apps/backend-api/src/features/<feature>/` into a separate app wrapper with zero domain refactoring.

### Q17: Complete Repository Tree
```
CarBroz Monorepo Root
├── apps/
│   └── backend-api/
│       ├── src/
│       │   ├── server.ts
│       │   ├── app.ts
│       │   ├── middleware/
│       │   ├── container/
│       │   └── features/
│       │       ├── auth/
│       │       ├── customer/
│       │       ├── partner/
│       │       ├── catalog/
│       │       ├── vehicle/
│       │       ├── booking/
│       │       ├── tracking/
│       │       ├── payment/
│       │       ├── invoice/
│       │       ├── payout/
│       │       ├── notification/
│       │       ├── review/
│       │       ├── coupon/
│       │       ├── dispute/
│       │       ├── corporate/
│       │       ├── sdui/
│       │       ├── audit/
│       │       └── config/
│       └── tests/
└── packages/
    ├── common-kernel/
    ├── database/
    ├── ui-sdk/
    ├── config/
    ├── feature-flags/
    └── logger/
```
