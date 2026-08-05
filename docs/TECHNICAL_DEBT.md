# Genuine Technical Debt Register

Audit of genuine technical debt remaining in the workspace after Milestones 1–5.

## 1. Backward Compatibility Facades (`@carbroz/common`)

- **Item**: Pure re-export files in `packages/common/src/domain/`.
- **Reason**: Retained to ensure legacy controllers and tests importing from `@carbroz/common` do not experience breaking changes.
- **Future Plan**: Gradually update legacy imports in `apps/backend-api` to use `@carbroz/domain-*` directly, then deprecate facades in major version 2.0.

---

## 2. Platform Package Repository Re-exports (`@carbroz/database`)

- **Item**: Re-exports of domain repositories in `packages/database/src/index.ts` (`export { PrismaAddressRepository } from '@carbroz/domain-address';`, etc.).
- **Reason**: Retained so legacy callers importing repositories from `@carbroz/database` continue resolving.
- **Future Plan**: Migrate callers directly to `@carbroz/domain-*` in future refactoring cycles.
