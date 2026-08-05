# 07 — Naming & Dependency Governance Rules

## 1. Enforceable Dependency Rules

1. **Domain Layer Independence**: `packages/common/src/domain` must **NEVER** import from `apps/backend-api`, `@carbroz/database`, or Fastify.
2. **Infrastructure Ports & Adapters**: `@carbroz/database` implements domain repository contracts defined in `@carbroz/common`.
3. **UI SDK Independence**: `@carbroz/ui-sdk` must **NEVER** import backend modules, Fastify, Prisma, or concrete feature builders.
4. **Delivery Layer Cleanliness**: Controllers inside `apps/backend-api` handle HTTP parsing and delegate directly to Application Use Cases via Awilix request scope (`request.diScope.resolve(...)`). Controllers contain zero business logic.
5. **Type Import Enforcement**: All TypeScript interface and type imports must use explicit `type` keyword syntax (`import type { ... } from '...'`) to comply with `verbatimModuleSyntax`.

---

## 2. Canonical Naming Standards

| Element | Rule / Convention | Example |
|---|---|---|
| Workspace Package | kebab-case prefixed with `@carbroz/` | `@carbroz/common`, `@carbroz/database` |
| Feature Module Folder | kebab-case, singular or domain standard | `apps/backend-api/src/modules/booking` |
| Domain Entity Class | PascalCase matching entity name | `Booking.ts`, `CorporateAccount.ts` |
| Repository Interface | PascalCase prefixed with `I` and ending with `Repository` | `IBookingRepository.ts` |
| Prisma Repository | PascalCase prefixed with `Prisma` and ending with `Repository` | `PrismaBookingRepository.ts` |
| Application Use Case | PascalCase ending with `UseCase` | `CreateBookingUseCase.ts` |
| Input / Output DTO | kebab-case file, PascalCase types ending with `Dto` | `booking.dto.ts`, `CreateBookingDto` |
| Fastify Controller | PascalCase ending with `Controller` | `BookingController.ts` |
| Fastify Route File | kebab-case ending with `.routes.ts` | `booking.routes.ts` |
| SDUI Builder | PascalCase ending with `Builder` | `SlotSelectionBuilder.ts` |
