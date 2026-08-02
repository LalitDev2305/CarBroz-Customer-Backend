# Phase 1 Implementation Plan
**Foundation: DI Container & Architecture Skeleton**

## 1. Phase Overview
This phase establishes the strict structural and dependency bedrock for the CarBroz Backend Platform. It introduces a global Dependency Injection (DI) container, configures the Clean Architecture directory skeleton without domain-specific logic, defines the core DDD/Provider/Repository interfaces, and standardizes Vitest for workspace testing.

## 2. Goal
To build a highly decoupled architectural skeleton enabling strict boundary enforcement. The domain must remain pristine, and all infrastructure dependencies must be dynamically resolved via the Provider pattern in subsequent phases. 

## 3. Current State Analysis
- **DI Container**: Absent. Current MVP heavily uses direct hardcoded imports.
- **Architecture**: Violated in `auth.controller.ts`.
- **Testing**: No test runner configured.
- **Interfaces**: Missing DDD components, Repositories, and Providers.

## 4. Scope
- Implement Awilix strictly as the DI Container at the API boundary.
- Scaffold base Clean Architecture directories in `backend-api` and `@carbroz/common`.
- Implement core DDD definitions (Entities, Aggregate Roots, Events).
- Implement standard architectural definitions (Repositories, UseCases, Providers, Factories, Builders).
- Define essential systemic providers (Clock, IdGen, Transaction, Logger).
- Define (design only) the structure for the Request-Scoped Context.
- Configure Vitest workspace tests with 85% coverage.
- Reference and enforce all relevant ADRs.

## 5. Out of Scope / Explicit Constraints
Phase 1 **MUST NOT**:
- Touch or refactor Auth logic.
- Touch `Prisma` schema or logic.
- Touch `Redis`, `BullMQ`, or `MinIO`.
- Introduce any business logic.
- Introduce feature modules/folders (e.g., `auth/`, `booking/`).
- Modify SDUI engine or logic.

## 6. Existing Files Analysis
- `apps/backend-api/src/app.ts`: Needs plugin modifications to bind Awilix in request scope.
- `packages/common/src/index.ts`: Needs to export all newly created generic abstractions.
- `package.json`: Needs `vitest` replacing any `jest` variants.

## 7. Files to Create
`@carbroz/common`:
- `domain/IEntity.ts`
- `domain/IAggregateRoot.ts`
- `domain/IDomainEvent.ts`
- `domain/IRepository.ts`
- `domain/IReadRepository.ts`
- `domain/IWriteRepository.ts`
- `domain/IProvider.ts`
- `application/IUseCase.ts`
- `shared/IFactory.ts`
- `shared/IBuilder.ts`
- `providers/IClockProvider.ts`
- `providers/IIdGeneratorProvider.ts`
- `providers/ITransactionProvider.ts`
- `providers/ILoggerProvider.ts`
- `application/IRequestContext.ts` (Design only)

`backend-api`:
- `container/index.ts` (Composition Root)
- `plugins/di.plugin.ts`
- `vitest.workspace.ts`
- `vitest.config.ts`

## 8. Files to Modify
- `apps/backend-api/src/app.ts`
- `apps/backend-api/package.json`
- `packages/common/package.json`
- `packages/common/src/index.ts`

## 9. Folder Structure Changes
Create empty structural skeletons only. **No feature folders are permitted.**

`apps/backend-api/src/`
- `core/`
- `container/`
- `plugins/`
- `shared/`

`packages/common/src/`
- `domain/`
- `application/`
- `infrastructure/`
- `shared/`

## 10. Dependency Changes
- **Add**: `awilix`, `fastify-awilix` (to `backend-api` only).
- **Add (Dev)**: `vitest`, `@vitest/coverage-v8`.
- **Remove**: Any and all `jest`, `@types/jest`, `ts-jest` dependencies globally.

## 11. Package Changes
- `@carbroz/common`: Serves as the pure generic definitions package for the entire monorepo.
- `backend-api`: Holds the composition root linking abstractions to concretions.

## 12. DI Container Design
- **Standard**: Awilix.
- **Mode**: Strict Mode enabled.
- **Scope**: Request-scoped container via `fastify-awilix`.
- **Isolation**: The Composition Root MUST exist **only** in `backend-api/src/container`. 
- **Purity**: Domain and Application layers must NEVER import or reference Awilix.

## 13. Factory Pattern Design
Define `IFactory<T>` in `common/src/shared`. Provides a standardized interface for complex object hydration.

## 14. Builder Pattern Design
Define `IBuilder<T>` in `common/src/shared`. Essential for programmatic UI generation (SDUI) later.

## 15. Repository Abstractions
Define in `common/src/domain`:
- `IRepository<TEntity, TId>`
- `IReadRepository<TEntity, TId>`
- `IWriteRepository<TEntity, TId>`

## 16. Provider Abstractions
Define in `common/src/domain` and `common/src/providers`:
- `IProvider` (Marker Interface)
- `IClockProvider`
- `IIdGeneratorProvider`
- `ITransactionProvider`
- `ILoggerProvider`

## 17. Common Package Changes
Ensure `index.ts` cleanly exports the new namespaces (e.g., `export * from './domain/IRepository';`).

## 18. Backend API Changes
Configure Fastify to support `fastify-awilix`, binding `request.diScope` globally so future routes can resolve controllers purely from the DI container.

## 19. Test Infrastructure
- Standardize completely on **Vitest**.
- Remove Jest.
- Configure workspace-wide test coverage with an 85% target requirement.

## 20. Build Changes
- No structural build changes required.

## 21. Environment Changes
- No environment variables altered.

## 22. Risks
- DI strict mode configuration may initially clash with fastify lifecycle timings.
- **Mitigation**: Follow fastify-awilix official documentation precisely.

## 23. Rollback Strategy
- Discard `feature/phase-1-di-foundation`. The DI container and interfaces are additive, meaning a `git reset --hard` fully reverts without side effects.

## 24. Request Context (Design Only)
Create `IRequestContext.ts` (in `common/src/application`) defining:
- `correlationId` (string)
- `requestId` (string)
- `traceId` (string)
- `spanId` (string)
- `authenticatedUser` (object/optional)
- `guestUser` (object/optional)
- `locale` (string)
- `timezone` (string)

## 25. Dependency Rules
The following architectural constraints are explicitly enforced:
- **Domain** → No external dependencies allowed.
- **Application** → Can depend only on Domain.
- **Infrastructure** → Can depend on Domain + Application.
- **API (Controllers)** → Can depend only on Application.

## 26. ADR References
This plan strictly implements the following locked architectural records:
- **ADR-001**: Modular Monolith Architecture
- **ADR-002**: Clean Architecture
- **ADR-003**: DDD Bounded Contexts
- **ADR-004**: Provider Pattern
- **ADR-005**: Repository Pattern
- **ADR-006**: Dependency Injection
- **ADR-010**: Engineering Standards Constitution

## 27. Verification Plan
- Type-check the entire workspace (`tsc --noEmit`).
- Run `pnpm test` ensuring Vitest runs without errors.
- Confirm DI plugin registers successfully via an integration test.

## 28. Backward Compatibility
- Existing API endpoints must remain 100% functional. We do not modify the existing MVP routes during Phase 1.

## 29. Deliverables
Phase 1 must generate:
- `docs/phases/phase-01/implementation_plan.md`
- `docs/phases/phase-01/walkthrough.md`
- `docs/phases/phase-01/release_notes.md`
- `docs/reviews/PHASE_1_ARCHITECTURE_REVIEW.md`

## 30. Definition of Done & Acceptance Criteria
- [ ] DI standardizes on Awilix (strict, request-scoped, composed exclusively in `backend-api`).
- [ ] Domain and Application layers are free of Awilix imports.
- [ ] Vitest is configured workspace-wide (85% coverage target) and Jest is removed.
- [ ] All 10 DDD/Arch abstractions are created in `@carbroz/common`.
- [ ] Core Provider interfaces (Clock, IdGen, Transaction, Logger) are created.
- [ ] Request Context interface is designed.
- [ ] Architectural skeletons exist without feature folders.
- [ ] **No circular dependencies exist.**
- [ ] **No architecture violations.**
- [ ] **No direct infrastructure imports.**
- [ ] **DI resolves successfully.**
- [ ] **Existing routes remain functional.**
