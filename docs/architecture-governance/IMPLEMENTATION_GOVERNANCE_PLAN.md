# CarBroz Backend — Implementation Governance & Milestone Preparation Blueprint

## Executive Foundation Summary

The Enterprise Architecture (`apps/`, `domains/`, `platform/`, `shared/`) is **permanently frozen**. This document defines the mandatory repository-wide engineering foundation and governance standards for all implementation milestones.

---

## 1. Coding Standards

### TypeScript & Naming Conventions
- **Strict TypeScript**: `verbatimModuleSyntax: true`, `noImplicitAny: true`, `strictNullChecks: true`.
- **Domain Entities**: `PascalCase` (`Booking.ts`, `CustomerProfile.ts`).
- **Domain Repository Ports**: `I<Domain>Repository.ts` (`IBookingRepository.ts`).
- **Prisma Repositories**: `Prisma<Domain>Repository.ts` (`PrismaBookingRepository.ts`).
- **Use Cases**: `<Verb><Domain>UseCase.ts` (`CreateBookingUseCase.ts`).
- **Domain Events**: `<Domain><PastTenseAction>Event.ts` (`BookingCreatedEvent.ts`).

### Dependency Injection & Error Handling
- **Awilix DI**: Constructor injection using `camelCase` registration keys.
- **Domain Errors**: Inherit from `DomainError` base class with typed error codes.
- **Result Pattern**: Use `Result.ok(value)` and `Result.fail(error)` for expected failures.

---

## 2. Definition of Done (DoD) Checklist

- [ ] `pnpm build` compiles cleanly with zero TypeScript errors.
- [ ] `pnpm test` executes and passes 100% of unit, integration, and architecture tests.
- [ ] `pnpm lint` executes with zero ESLint or formatting errors.
- [ ] `architecture.spec.ts` passes with zero circular or deep-import violations.
- [ ] Co-located `README.md` and `module.manifest.ts` are updated in modified domain folders.
- [ ] Public contracts are exported exclusively from `domains/<domain>/public/index.ts`.

---

## 3. Pull Request Checklist

- [ ] Functional requirements match approved `implementation_plan.md`.
- [ ] No deep imports across domains (`domains/foo/infrastructure/...`).
- [ ] No circular dependencies across modules.
- [ ] Unit and integration test coverage meets or exceeds 85%.
- [ ] Breaking API changes are documented with semver migration notes.

---

## 4. Canonical Module Template (`domains/<domain>/`)

```
domains/<domain>/
├── domain/                                # Pure Domain Model (Entities, VOs, Events, Policies, Ports)
├── application/                           # Application Layer (Use Cases, Commands, Queries, DTOs, Mappers)
├── infrastructure/                        # Persistence Layer (Prisma Repositories, Mappers)
├── ui/                                    # SDUI Screen Builders (Surface-specific UI layout builders)
├── public/                                # Public API Barrel (Exposes contracts ONLY)
│   └── index.ts
├── module.manifest.ts                     # Declarative Domain Metadata
├── <domain>.module.ts                     # Awilix DI & Fastify Route Registration
└── README.md                              # Mandatory Domain Documentation
```

---

## 5. Feature Implementation Workflow (13 Mandatory Steps)

1. **Analysis**: Inspect codebase and requirements.
2. **Design**: Formulate clean architecture design.
3. **Implementation Plan**: Write `implementation_plan.md`.
4. **User Approval**: Stop and obtain explicit user approval.
5. **Implementation**: Execute code changes in strict milestone scope.
6. **Self Review**: Verify against Clean Architecture & DDD rules.
7. **Automated Validation**: Run `pnpm build`, `pnpm test`, `pnpm lint`.
8. **Documentation Update**: Write `walkthrough.md` and update `docs/PROJECT_STATUS.md`.
9. **Commit**: Git commit with conventional commit message.
10. **Push**: Push to feature branch.
11. **Pull Request**: Open PR against `feature/architecture-stabilization`.
12. **Merge**: Merge PR after review.
13. **Project Status Update**: Update status tracking.

---

## 6. Git Strategy & Branching Model

- **Base Stabilization Branch**: `feature/architecture-stabilization`
- **Milestone Feature Branches**: `feature/m1-shared-kernel-platform`, `feature/m2-core-domains`, etc.
- **Commit Messages**: Follow Conventional Commits (`feat(booking): add CreateBookingUseCase`, `fix(auth): update jwt verification`).

---

## 7. Documentation Standards

Every domain MUST contain:
- `README.md`: 10-section comprehensive documentation.
- `module.manifest.ts`: Metadata declaring owner, dependencies, emitted events, and version.

---

## 8. Automated CI/CD Fitness Functions

Automated CI pipeline executes:
1. `pnpm build` (TypeScript compilation)
2. `pnpm test` (Vitest unit, integration, and architecture tests)
3. `pnpm lint` (ESLint import boundary rules)
4. `dependency-cruiser` (Acyclic graph validation)

---

## 9. Review Standards
- **Self Review**: Developer verifies against `PR_CHECKLIST.md`.
- **Architecture Review**: Verifies zero domain leakage and proper barrel exports.

---

## 10. Implementation Roadmap & Execution Sequence

- **Milestone 1**: Common Kernel & Platform Setup (`shared/kernel`, `shared/ui-sdk`, `platform/*`).
- **Milestone 2**: Core Domains Migration (`identity`, `customer-profile`, `address`, `partner-profile`, `partner-kyc`, `catalog`, `pricing`, `garage`).
- **Milestone 3**: Transactional Domains Migration (`booking`, `tracking`, `payment`, `invoice`, `payout`).
- **Milestone 4**: Engagement Domains Migration (`notification`, `review`, `coupon`, `dispute`, `sdui-registry`, `audit`, `config`).
- **Milestone 5**: Delivery Applications Restructuring (`apps/customer-app`, `apps/partner-app`, `apps/admin-panel`).

---

## 11. Implementation Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| Deep import leaks across domains | High | Low | ESLint barrel rules + Vitest architecture spec |
| Awilix DI key naming mismatch | Medium | Low | Strict registration naming conventions |
| Database migration conflict | High | Low | Centralized Prisma schema ownership in `platform/database/` |

---

## 12. Final Readiness Verdict

### Can implementation begin immediately?

> **YES, IMMEDIATELY.**
> **The architecture is frozen, implementation governance is complete, and Milestone 1 (Shared Kernel & Technical Platform Extraction) is ready for execution.**
