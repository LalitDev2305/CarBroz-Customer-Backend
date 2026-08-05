# CarBroz Backend — Final Architecture Review & 25-Question Blueprint

## 1. Executive Architecture Review

CarBroz is a high-scale, unified mobility platform built as a **Modular Monolith** backend serving four client delivery surfaces:
1. **Customer App** (Mobile & Web)
2. **Partner App** (Mobile Service Providers)
3. **Corporate Experience** (B2B Fleet & Billing)
4. **Admin Panel** (Web Control Panel)

This architectural review establishes the 5–10 year maintainability standard for CarBroz based on **Feature-First Co-Location** without workspace package explosion.

---

## 2. Answers to the 25 Architectural Questions

### Q1: Is Feature-First architecture actually the best solution?
**Answer**: **YES**. Feature-First co-location groups code by business capability (`features/<feature>/`) instead of technical layer (`domain/`, `controllers/`, `use-cases/`). This eliminates the "Scavenger Hunt Developer Experience" where a developer must open 6 distant workspace folders to understand a single feature.

### Q2: Should features be folders, packages, or workspace packages?
**Answer**: **Feature Folders (`features/<feature>/`) inside a clean monorepo**.
- *Why NOT 30+ Workspace Packages*: Having 30+ `package.json` files creates extreme package management overhead, slow `pnpm build` times, complex TypeScript project reference chains, and versioning friction.
- *Why Feature Folders*: Feature folders provide 100% co-location and clear physical boundaries while keeping build times under sub-second speeds.

### Q3: Should `@carbroz/common` remain one package or become multiple packages?
**Answer**: **It should be split into 2 minimal packages**:
1. **`@carbroz/common-kernel`**: Contains strictly foundational base classes (`Entity`, `ValueObject`, `Result`, `IDomainEvent`), universal VOs (`Money`, `Coordinates`, `AddressSnapshot`), and base ports.
2. **`@carbroz/ui-sdk`**: Pure, domain-agnostic layout composition engine (`ScreenFactory`, `BaseScreenBuilder`, node builders, `UI` DSL, Zod schemas). Zero business domain imports.

### Q4: What belongs inside Common Kernel?
**Answer**:
- Base Classes: `Entity<T>`, `AggregateRoot<T>`, `ValueObject<T>`, `Result<T, E>`, `IDomainEvent`
- Base Ports: `IRepository<T>`, `IReadRepository<T>`, `IWriteRepository<T>`, `ITransactionProvider`
- Universal VOs: `Money`, `Coordinates`, `AddressSnapshot`
- Universal Errors: `DomainError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ConflictError`
Everything else (business entities, DTOs, feature repositories) moves to feature folders.

### Q5: Should Prisma remain centralized or feature-owned?
**Answer**: **Prisma Schema (`schema.prisma`) remains centralized in `@carbroz/database`**.
- *Reason*: PostgreSQL foreign keys (`Booking` -> `User`, `Vehicle`, `CorporateAccount`, `Payment`) require relational schema integrity.

### Q6: Should Prisma repositories remain centralized or move beside each feature?
**Answer**: **Move beside each feature (`features/<feature>/infrastructure/repositories/`)**.
- *Reason*: Co-locates database queries and mappings right next to the domain models and use cases that consume them.

### Q7: Where should Repository interfaces live?
**Answer**: **Inside the feature domain folder (`features/<feature>/domain/repositories/IBookingRepository.ts`)**.

### Q8: Where should Use Cases live?
**Answer**: **Inside the feature application folder (`features/<feature>/application/use-cases/CreateBookingUseCase.ts`)**.

### Q9: Where should Controllers live?
**Answer**: **Inside delivery subfolders by client persona (`features/<feature>/delivery/customer/`, `delivery/partner/`, `delivery/admin/`, `delivery/corporate/`)**.

### Q10: Where should Routes live?
**Answer**: **Co-located with their respective controllers in `features/<feature>/delivery/<persona>/<persona>-<feature>.routes.ts`**.

### Q11: Where should Middleware live?
**Answer**: **Global auth/RBAC middleware lives in `apps/backend-api/src/middleware/`. Feature-specific guards live in `features/<feature>/delivery/guards/`**.

### Q12: Where should Validation live?
**Answer**: **DTO Zod schemas in `features/<feature>/application/dtos/` for API requests; Domain invariants in `features/<feature>/domain/models/`**.

### Q13: Where should DTOs live?
**Answer**: **Inside `features/<feature>/application/dtos/<feature>.dto.ts`**.

### Q14: Where should SDUI Builders live?
**Answer**: **Co-located in feature `ui/` directories (`features/auth/ui/AuthLoginBuilder.ts`, `features/booking/ui/customer/SlotSelectionBuilder.ts`, `features/corporate/ui/CorporateBookingBuilder.ts`)**.

### Q15: How should Customer SDUI and Partner SDUI coexist?
**Answer**: **Independent feature builders consuming shared generic layout node primitives from `@carbroz/ui-sdk`**. They share no business logic or feature builder classes.

### Q16: Should Admin have its own feature or only delivery layer?
**Answer**: **Only delivery layer (`delivery/admin/`)**. Admin is a delivery surface, not a business domain.

### Q17: How should feature dependencies work without circular references?
**Answer**:
- Direct use case invocation via dependency injection for read/query needs.
- Domain Events (`EventBus`) for asynchronous cross-domain side effects (e.g. `BookingCreatedEvent` -> Notification Service).

### Q18: Should features expose only public APIs?
**Answer**: **YES**. Every feature exports an `index.ts` barrel exposing domain entities, use-case contracts, and DTOs. Internal infrastructure files remain private to the feature folder.

### Q19: Should DI remain centralized or modular?
**Answer**: **Modular**. Each feature exports a `<feature>.module.ts` self-registration block executed during app startup.

### Q20: How should tests be organized?
**Answer**: **Co-located feature tests (`features/<feature>/tests/`)** covering domain unit tests, use-case integration tests, and SDUI layout tests. Global E2E API tests remain in `apps/backend-api/tests/`.

### Q21: Which files are currently misplaced?
**Answer**: All 38 entity files in `packages/common/src/domain/*.ts` and repository interfaces in `packages/common/src/domain/repositories/*.ts` belong inside their respective feature folders in `features/`.

### Q22: Final Repository Tree
```
CarBroz Root
├── apps/
│   └── backend-api/
│       ├── src/
│       │   ├── server.ts
│       │   ├── app.ts
│       │   └── container/
│       └── tests/
├── features/
│   ├── auth/
│   ├── customer/
│   ├── partner/
│   ├── catalog/
│   ├── vehicle/
│   ├── booking/
│   ├── tracking/
│   ├── payment/
│   ├── invoice/
│   ├── payout/
│   ├── notification/
│   ├── review/
│   ├── coupon/
│   ├── dispute/
│   ├── corporate/
│   ├── sdui/
│   ├── audit/
│   └── config/
└── packages/
    ├── common-kernel/
    ├── database/
    ├── ui-sdk/
    ├── config/
    ├── feature-flags/
    └── logger/
```

### Q23: How should a NEW FEATURE be added?
1. Create `features/<new_feature>/` adhering to the 5-layer feature template.
2. Define models, repository port, use cases, DTOs, delivery controllers, and tests.
3. Export `<new_feature>.module.ts` DI registration.
4. Add routes to `apps/backend-api/src/app.ts`.

### Q24: How should a NEW SCREEN be added?
1. Create `<ScreenName>Builder.ts` inside `features/<feature>/ui/<surface>/`.
2. Extend `BaseScreenBuilder` from `@carbroz/ui-sdk`.
3. Register builder in `ScreenFactory`.

### Q25: How should future microservices be extracted later?
- Because each feature folder in `features/<feature>/` already contains 100% of its domain, application, infrastructure, delivery, and tests, extracting a feature into an independent microservice requires simply wrapping its `features/<feature>/` directory with a standalone HTTP server package.
