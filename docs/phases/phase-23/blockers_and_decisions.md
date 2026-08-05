# Phase 23 — Customer SDUI Composition Engine Blockers & Architecture Decisions

## Architectural Decisions

### ADR-23.1: Strict Infrastructure Independence of `@carbroz/ui-sdk`
- **Decision**: `@carbroz/ui-sdk` will not import backend modules, Fastify, Prisma, or concrete feature builders.
- **Rationale**: Preserves `@carbroz/ui-sdk` as a pure, lightweight UI SDK and prevents circular dependency leaks between backend services and shared SDKs.

### ADR-23.2: Reuse of Existing Builders Without Duplication
- **Decision**: Preserve `AuthLoginBuilder`, `AuthOtpBuilder`, and `DashboardBuilder` in `apps/backend-api/src/modules/auth/ui/` and `config/ui/`.
- **Rationale**: Reuses working production code, protects locked JSON layout regression tests, and avoids duplicate builder maintenance.

### ADR-23.3: Feature Module Builder Ownership
- **Decision**: Place concrete builders inside their respective feature modules (e.g. `modules/catalog/ui/`, `modules/booking/ui/`) rather than one giant `sdui/builders/` directory.
- **Rationale**: Adheres to Bounded Context DDD principles and keeps UI composition code adjacent to domain models and use cases.

### ADR-23.4: Application-Level LRU Caching
- **Decision**: Implement L1 In-Memory LRU Cache with key format `sdui:customer:{screenKey}:{locale}:{version}:{role}`. No Redis dependency will be added without explicit project approval.
- **Rationale**: Delivers high-throughput SDUI resolution without introducing unapproved third-party infrastructure.

---

## Current Blockers
- **None**: All Phase 1–22 domain repositories, services, and `@carbroz/ui-sdk` primitives are fully built and tested.
