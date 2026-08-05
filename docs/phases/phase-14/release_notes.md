# Phase 14 Release Notes — SDUI Versioning & Publishing System

---

## Key Features

1. **Screen Layout Versioning**:
   - Explicit version status lifecycle: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
   - Immutable version history: previous published versions are automatically archived upon publishing a new version.
2. **Single Active Published Screen Guarantee**:
   - Atomic database transactions (`prisma.$transaction`) ensure exactly one `PUBLISHED` screen version exists per `(screenId, targetApp)` pair at any point in time.
3. **Optimistic Concurrency Control**:
   - `lockVersion` validation on draft updates prevents concurrent admin overwrite conflicts with `409 Conflict` errors.
4. **Non-Mutating Rollback Strategy**:
   - Rollback creates a new published version ($V_{new} = MAX(versionNumber) + 1$) referencing the historical version in `createdFromVersion`.
5. **Version Comparison & Auditability**:
   - Diff endpoint allowing admins to compare layout JSON structure and component deltas between any two screen versions.

---

## API Endpoints Added

- `POST /api/v1/admin/sdui/screens/draft` — Create draft
- `PUT /api/v1/admin/sdui/screens/draft` — Update draft with optimistic lock
- `POST /api/v1/admin/sdui/screens/publish` — Publish screen version
- `POST /api/v1/admin/sdui/screens/archive` — Archive screen version
- `POST /api/v1/admin/sdui/screens/rollback` — Non-mutating rollback
- `GET /api/v1/admin/sdui/screens/:screenId/history` — Get version history
- `GET /api/v1/admin/sdui/screens/:screenId/versions/:versionNumber` — Get specific version
- `GET /api/v1/admin/sdui/screens/:screenId/compare` — Compare two versions
