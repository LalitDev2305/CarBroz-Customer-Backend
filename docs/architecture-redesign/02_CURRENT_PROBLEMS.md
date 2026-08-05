# 02 — Comprehensive Audit of Current Architecture Problems

## Executive Summary
This report details every architectural defect, structural bottleneck, and maintenance friction point identified in the current CarBroz backend repository prior to stabilization.

---

## 1. Major Architectural Defects

### Problem 1: Fragmented Feature Code ("Scavenger Hunt Developer Experience")
- **Symptom**: Adding or modifying a single feature (e.g. `Booking` or `Corporate`) requires jumping between 6 top-level directories:
  1. `packages/common/src/domain/booking/` (Domain Entities)
  2. `packages/common/src/domain/repositories/` (Repository Contracts)
  3. `packages/database/src/repositories/` (Prisma Repositories)
  4. `apps/backend-api/src/modules/booking/use-cases/` (Use Cases)
  5. `apps/backend-api/src/modules/booking/controllers/` (Controllers)
  6. `apps/backend-api/src/modules/sdui/builders/` (SDUI Builders)
- **Impact**: Developer cognitive overload, slow onboarding, and high risk of missing updates across scattered layers.

### Problem 2: Overstuffed Shared Kernel (`packages/common`)
- **Symptom**: `@carbroz/common` contains 38 entity files, 30 repository contracts, domain services, value objects, and SDUI models for 20 distinct business domains.
- **Impact**: Any change to any domain model invalidates TypeScript caches across the monorepo, forcing unnecessary rebuilds.

### Problem 3: Monolithic Dependency Injection Container
- **Symptom**: `apps/backend-api/src/container/index.ts` is a 580-line monolithic file registering over 120 services, use cases, and controllers manually.
- **Impact**: Prone to missing constructor bindings, tight coupling, and merge conflicts during team collaboration.

### Problem 4: Misunderstood Delivery Surface Boundaries
- **Symptom**: Admin operations are partially placed in a standalone `modules/admin/` folder and partially placed inside feature modules (`AdminCorporateController`, `AdminDisputeController`).
- **Impact**: Inconsistent REST routing conventions and duplicate authorization logic across delivery surfaces.

### Problem 5: Non-Uniform Domain Directory Layout
- **Symptom**: Some domain models sit at root `packages/common/src/domain/` (`Address.ts`, `Service.ts`, `Partner.ts`), while others sit in subdirectories (`booking/`, `corporate/`, `coupon/`).
- **Impact**: Confusing file discovery and unpredictable import paths.
