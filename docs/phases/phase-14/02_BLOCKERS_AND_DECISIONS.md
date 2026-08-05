# Phase 14 — Blockers & Architecture Decisions

## Architectural Decisions

### Decision 1: Single Table with Enum Status vs. Separate Version Archive Table
- **Context**: Phase 14 requires immutable version history tracking (`DRAFT`, `PUBLISHED`, `ARCHIVED`) per `(screenId, targetApp)`.
- **Options Evaluated**:
  1. Separate `sdui_screen_history` table for archived versions.
  2. Single `sdui_screens` table with `version_number`, `status` enum (`DRAFT`, `PUBLISHED`, `ARCHIVED`), and composite unique index `@@unique([screenId, targetApp, versionNumber])`.
- **Decision**: Option 2 (Single table with Enum Status).
- **Rationale**: Simplifies query semantics, avoids data duplication, and enables direct transactional state transitions between `DRAFT` → `PUBLISHED` → `ARCHIVED` in a single table with clean Prisma query filters.

---

### Decision 2: Transactional Single Published Enforcement
- **Context**: Business rule requires that exactly ONE version per `(screenId, targetApp)` can have status `PUBLISHED` at any given time.
- **Decision**: Enforce single active published version inside `PrismaSduiRegistryRepository.publishVersion()` using interactive Prisma transaction (`prisma.$transaction`):
  1. Execute `UPDATE sdui_screens SET status = 'ARCHIVED' WHERE screen_id = ? AND target_app = ? AND status = 'PUBLISHED'`.
  2. Execute `UPDATE sdui_screens SET status = 'PUBLISHED', published_at = NOW(), published_by = ? WHERE screen_id = ? AND target_app = ? AND version_number = ?`.

---

### Decision 3: Optimistic Concurrency Control
- **Context**: Prevent concurrent admin edits from overwriting layout drafts.
- **Decision**: Include `lockVersion` counter on `SduiScreen` entity. On update, check `WHERE lock_version = expectedLockVersion` and increment `lock_version` by 1. Throw `ConflictError` if updated row count is 0.

---

### Decision 4: Non-Mutating Rollback Strategy
- **Context**: Rollback to past version $V_{hist}$ must preserve immutable history.
- **Decision**: Rollback creates a new version $V_{new} = MAX(versionNumber) + 1$ with `createdFromVersion = V_{hist}` and change description `Rollback to version V_{hist}`, and atomically publishes $V_{new}$.

---

## Blockers Log

- **Current Blockers**: None.
- **Unresolved Architectural Questions**: None.
