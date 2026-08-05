# Phase 23 — Customer SDUI Composition Engine Blockers & Architecture Decisions

## Architectural Decisions

### ADR-23.1: Separation of UI SDK Primitives and Backend Customer Builders
- **Decision**: Keep base abstractions (`ScreenFactory`, `BaseBuilder`, generic registries) in `@carbroz/ui-sdk`, while implementing all 28 concrete Customer builders in `apps/backend-api/src/modules/sdui/builders/customer/`.
- **Rationale**: Keeps `@carbroz/ui-sdk` lightweight and platform-agnostic, preventing backend database and business logic dependencies from leaking into shared SDKs.

### ADR-23.2: BaseCustomerBuilder Shared Template Abstraction
- **Decision**: All 28 customer builders inherit from `BaseCustomerBuilder`, which automatically injects default headers, navigation bars, localization keys, and feature-flag checks.
- **Rationale**: Eliminates repetitive layout boilerplate across 28 screens and enforces uniform visual hierarchy and branding.

### ADR-23.3: Two-Layer SDUI JSON Caching Strategy
- **Decision**: Implement L1 In-Memory LRU Cache + L2 Redis Cache keying on `sdui:customer:{screenKey}:{locale}:{version}:{role}`.
- **Rationale**: Delivers sub-5ms SDUI JSON response times under high concurrency while allowing instant cache invalidation upon catalog/pricing updates or version deployment.

---

## Risks & Mitigation

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| High JSON payload size on complex screens | Increased network latency on mobile networks | Implement child property payload minification and gzip compression |
| Stale SDUI layouts after catalog or price changes | Inconsistent service pricing displayed to customer | Trigger event-driven cache invalidation upon Catalog/Pricing domain events |
| Deeply nested component trees causing slow frontend rendering | UI lag during Compose/Flutter layout pass | Enforce maximum 4-level component/subcomponent nesting limit in builders |

---

## Current Blockers
- **None**: All Phase 1–22 domain repositories, services, and `@carbroz/ui-sdk` primitives are fully built, tested, and ready for integration.
