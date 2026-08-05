# Phase 14 — SDUI Versioning & Publishing System Walkthrough

---

## 1. Executive Summary

Phase 14 successfully delivers enterprise layout versioning, publishing lifecycle controls, optimistic locking, and version comparison for Server-Driven UI (SDUI) screen layouts.

All design decisions strictly adhere to Clean Architecture boundaries and keep `@carbroz/ui-sdk` completely pure and infrastructure-independent.

---

## 2. Changes Made

### 2.1 Database Schema & Migration
- Created Prisma enum `SduiScreenStatus` (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- Replaced `isPublished` boolean with explicit `status` and `versionNumber` tracking.
- Added concurrency controls (`lockVersion`) and auditing attributes (`publishedAt`, `publishedBy`, `createdFromVersion`, `changeDescription`).
- Updated unique constraint: `@@unique([screenId, targetApp, versionNumber])`.
- Added composite status index: `@@index([screenId, targetApp, status])`.
- Applied deterministic SQL migration `20260803120000_phase14/migration.sql`.

### 2.2 Domain & Interfaces (`packages/common`)
- Updated `SduiScreenEntity` and `SduiScreenProps` with versioning & auditing fields.
- Added getter functions `isPublished` and `version` for 100% backward compatibility.
- Extended `ISduiRegistryRepository` with version management methods:
  - `createDraft`
  - `updateDraft`
  - `publishVersion`
  - `archiveVersion`
  - `rollbackVersion`
  - `getVersionHistory`
  - `getSpecificVersion`
  - `findDraft`

### 2.3 Persistence Layer (`packages/database`)
- Implemented transactional state transitions in `PrismaSduiRegistryRepository`:
  - Enforced single `PUBLISHED` screen version invariant via atomic `prisma.$transaction`.
  - Enforced single active `DRAFT` per `(screenId, targetApp)` constraint.
  - Implemented optimistic concurrency validation via `lockVersion`.
  - Implemented non-mutating rollback mechanism (creates new version $V_{new} = MAX(versionNumber) + 1$).

### 2.4 Use Cases & API (`apps/backend-api`)
- Created 8 dedicated versioning UseCases:
  - `CreateSduiDraftUseCase`
  - `UpdateSduiDraftUseCase`
  - `PublishSduiVersionUseCase`
  - `ArchiveSduiVersionUseCase`
  - `RollbackSduiVersionUseCase`
  - `GetSduiVersionHistoryUseCase`
  - `GetSduiSpecificVersionUseCase`
  - `CompareSduiVersionsUseCase`
- Created Zod validation schemas and DTOs in `sdui-registry.dto.ts`.
- Updated `AdminSduiController` and `adminSduiRoutes` with admin endpoints.
- Registered all UseCases in Awilix DI container (`apps/backend-api/src/container/index.ts`).

---

## 3. Verification Suite Results

- `pnpm prisma validate`: PASSED
- `pnpm prisma generate`: PASSED
- `pnpm lint`: PASSED (300 warnings, 0 errors)
- `pnpm build`: PASSED (All workspace packages compiled)
- `pnpm test`: PASSED (88 / 88 tests passing across 21 test suites)
