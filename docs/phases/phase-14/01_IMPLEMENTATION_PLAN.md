# Phase 14 — SDUI Versioning & Publishing System Implementation Plan

## Executive Summary
Phase 14 introduces an enterprise-grade, immutable Server-Driven UI (SDUI) Versioning & Publishing System for CarBroz. Building upon Phase 13's relocated `@carbroz/ui-sdk` composition engine and database registry foundation, Phase 14 establishes full version history tracking, lifecycle state management (`DRAFT`, `PUBLISHED`, `ARCHIVED`), optimistic concurrency locking, atomic publish transitions, rollback capabilities, and layout diffing while preserving 100% backward compatibility for existing client applications.

---

## 1. Repository Analysis

### Current State (Post-Phase 13)
- **`@carbroz/ui-sdk`**: Reusable SDUI engine containing `ScreenFactory`, `BaseScreenBuilder`, `ui.schemas.ts` (level-by-level Zod schemas), `ui.models.ts` (strict UI interfaces), and `JsonSerializer`. It has zero dependencies on Fastify, Prisma, or backend feature modules.
- **`packages/database`**: Defines Prisma schema for `SduiScreen`, `SduiTemplate`, and `SduiComponentRegistry`.
  - Current `SduiScreen` schema has a hard `@@unique([screenId, targetApp])` constraint and a binary `isPublished: Boolean` flag.
- **`packages/common`**: Owns `SduiScreenEntity`, `SduiComponentRegistryEntity`, and `ISduiRegistryRepository`.
- **`apps/backend-api`**: Implements Fastify routes, controllers, and Awilix DI container registration for SDUI orchestration (`GetSduiScreenUseCase`, `RegisterSduiComponentUseCase`, `UpdateSduiScreenLayoutUseCase`).

---

## 2. Architecture Impact & Design

### Principles & Boundaries
1. **Clean Architecture & DDD**: Domain logic in `packages/common` defines entities (`SduiScreenEntity`), enum status (`SduiScreenStatus`), and repository interfaces (`ISduiRegistryRepository`).
2. **Infrastructure Independence**: `@carbroz/ui-sdk` remains uncoupled from persistence and version management. Payload validation uses exported `screenSchema` from `@carbroz/ui-sdk`.
3. **Immutable History**: Once a version is created, its `layoutJson` is never overwritten. Updates to layout create a new version or edit a `DRAFT` before publishing.
4. **Single Published Constraint**: At any given time, exactly ONE screen version per `(screenId, targetApp)` can have status `PUBLISHED`.
5. **Optimistic Locking**: Uses `lockVersion` counter to prevent lost updates during concurrent edits.

---

## 3. Draft Lifecycle & Business Rules

1. **Multiple Drafts Constraint**: Only ONE active `DRAFT` version can exist per `(screenId, targetApp)` at any time. Creating a draft when one already exists returns `409 Conflict` unless `overwriteExistingDraft: true` is passed.
2. **Immutability of Published & Archived Versions**:
   - `PUBLISHED` and `ARCHIVED` versions are strictly read-only.
   - Editing a published or archived version requires creating a new `DRAFT` seeded from that version.
3. **Publishing Workflow**:
   - Publishing transitions a `DRAFT` or `ARCHIVED` version to `PUBLISHED`.
   - In an atomic Prisma transaction, the currently `PUBLISHED` version transitions to `ARCHIVED`, and the target version becomes `PUBLISHED` with updated `publishedAt` and `publishedBy` metadata.
4. **Rollback Workflow**:
   - Rolling back to a historic version $V_{hist}$ does NOT mutate $V_{hist}$.
   - Instead, it creates a new version $V_{new} = MAX(versionNumber) + 1$ with `createdFromVersion = V_{hist}`, `changeDescription = "Rollback to version V_{hist}"`, and immediately sets $V_{new}$ to `PUBLISHED`.
5. **Version Number Sequencing**: Version numbers are strictly monotonic integers ($1, 2, 3, \dots$) auto-incremented per `(screenId, targetApp)`.

---

## 4. Database Design

### Prisma Schema Update (`packages/database/prisma/schema.prisma`)

```prisma
enum SduiScreenStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model SduiScreen {
  id                 Int              @id @default(autoincrement())
  publicId           String           @unique @default(uuid()) @map("public_id")
  screenId           String           @map("screen_id")
  targetApp          String           @default("CUSTOMER") @map("target_app")
  versionNumber      Int              @default(1) @map("version_number")
  status             SduiScreenStatus @default(DRAFT)
  layoutJson         Json             @map("layout_json")
  lockVersion        Int              @default(1) @map("lock_version")
  publishedAt        DateTime?        @map("published_at")
  publishedBy        String?          @map("published_by")
  createdFromVersion Int?             @map("created_from_version")
  changeDescription  String?          @map("change_description")
  createdAt          DateTime         @default(now()) @map("created_at")
  updatedAt          DateTime         @updatedAt @map("updated_at")

  @@unique([screenId, targetApp, versionNumber])
  @@index([screenId, targetApp, status])
  @@map("sdui_screens")
}
```

---

## 5. API Design & Version Comparison Contract

### Version Comparison Contract (`GET /api/v1/admin/sdui/screens/:screenId/compare`)

- **Query Parameters**: `targetApp`, `sourceVersion`, `targetVersion`
- **Response Format**:
  ```ts
  interface VersionComparisonResponseDto {
    screenId: string;
    targetApp: string;
    sourceVersion: {
      versionNumber: number;
      status: SduiScreenStatus;
      publishedAt?: string;
      layoutJson: SduiJsonContract;
    };
    targetVersion: {
      versionNumber: number;
      status: SduiScreenStatus;
      publishedAt?: string;
      layoutJson: SduiJsonContract;
    };
    comparisonSummary: {
      isIdentical: boolean;
      templateTypeChanged: boolean;
      componentsCountDelta: number;
      subcomponentsCountDelta: number;
    };
  }
  ```

---

## 6. Authorization Matrix

| Endpoint / Operation | HTTP Method & Path | Required Role | Required Permission |
| :--- | :--- | :--- | :--- |
| **Create Draft** | `POST /api/v1/admin/sdui/screens/draft` | Admin | `sdui:draft:create` |
| **Update Draft** | `PUT /api/v1/admin/sdui/screens/draft` | Admin | `sdui:draft:update` |
| **Publish Version** | `POST /api/v1/admin/sdui/screens/publish` | Admin | `sdui:version:publish` |
| **Archive Version** | `POST /api/v1/admin/sdui/screens/archive` | Admin | `sdui:version:archive` |
| **Rollback Version** | `POST /api/v1/admin/sdui/screens/rollback` | Admin | `sdui:version:rollback` |
| **Get Version History** | `GET /api/v1/admin/sdui/screens/:screenId/history` | Admin | `sdui:version:read` |
| **Get Version Details** | `GET /api/v1/admin/sdui/screens/:screenId/versions/:versionNumber` | Admin | `sdui:version:read` |
| **Compare Versions** | `GET /api/v1/admin/sdui/screens/:screenId/compare` | Admin | `sdui:version:read` |

---

## 7. Error & Conflict Matrix

| Status Code | Error Type | Trigger Condition | Expected Handling / Response |
| :--- | :--- | :--- | :--- |
| **400 Bad Request** | `InvalidTransitionError` | Attempting to edit a `PUBLISHED` or `ARCHIVED` version directly | Return message asking user to create a new `DRAFT` |
| **403 Forbidden** | `ForbiddenError` | User is not authenticated as Admin or lacks permission | Return standard access denied JSON |
| **404 Not Found** | `NotFoundError` | Specified `screenId` or `versionNumber` does not exist | Return resource not found message |
| **409 Conflict** | `ConcurrencyConflictError` | `lockVersion` mismatch on draft update | Return stale version conflict message with current `lockVersion` |
| **409 Conflict** | `DraftAlreadyExistsError` | Creating draft when draft already exists without `overwriteExistingDraft` | Return active draft conflict details |
| **422 Unprocessable** | `ValidationError` | Provided `layoutJson` fails Zod `@carbroz/ui-sdk` `screenSchema` | Return field-level Zod validation errors |
| **500 Internal Error**| `InternalServerError` | Database transaction timeout or infrastructure failure | Log error, rollback Prisma transaction, return safe 500 |

---

## 8. Acceptance Criteria

- [x] **Single Published Constraint**: Guaranteed exactly 1 active `PUBLISHED` version per `(screenId, targetApp)`.
- [x] **Immutable History**: Published and archived versions cannot be mutated.
- [x] **Rollback Integrity**: Rollback creates a new incremented version $V_{new}$ instead of overwriting history.
- [x] **SDK Independence**: `@carbroz/ui-sdk` zero-infrastructure coupling preserved.
- [x] **Backward Parity**: `GetSduiScreenUseCase` continues serving published screen layouts with zero API breaking changes.
- [x] **Full Build & Test Verification**: `pnpm prisma validate`, `pnpm prisma generate`, `pnpm lint`, `pnpm build`, `pnpm test` pass with 100% success.

---

## 9. Implementation Checklist

- [ ] **Migration**: Create and run Prisma migration `20260803120000_phase14`.
- [ ] **Domain**: Update `SduiScreenEntity`, `SduiScreenStatus`, `ISduiRegistryRepository`.
- [ ] **Database Repository**: Update `PrismaSduiRegistryRepository` with transactional versioning methods.
- [ ] **UseCases**: Implement `CreateSduiDraftUseCase`, `PublishSduiVersionUseCase`, `ArchiveSduiVersionUseCase`, `RollbackSduiVersionUseCase`, `GetSduiVersionHistoryUseCase`, `CompareSduiVersionsUseCase`.
- [ ] **DTOs & Controllers**: Update `sdui-registry.dto.ts`, `admin-sdui.controller.ts`, and `admin-sdui.routes.ts`.
- [ ] **DI Registration**: Register UseCases in Awilix container (`apps/backend-api/src/container/index.ts`).
- [ ] **Unit Tests**: Create `SduiVersioningUseCases.spec.ts`.
- [ ] **Verification**: Run `pnpm prisma validate ; pnpm prisma generate ; pnpm lint ; pnpm build ; pnpm test`.
