# CarBroz Backend — Milestone 1 Migration Execution Plan

## Executive Summary

This document defines the exact, step-by-step engineering execution plan for **Milestone 1: Shared Kernel & Technical Platform Extraction**.

The architecture is **permanently frozen**. This playbook contains zero design changes and focuses exclusively on file migration order, path mapping, build validation, git commands, and rollback procedures.

---

## 1. Exact File Movement Inventory

### Batch 1.1: Shared Kernel (`shared/kernel/`)
- `packages/common/src/domain/base/Entity.ts` ➔ `shared/kernel/src/domain/base/Entity.ts`
- `packages/common/src/domain/base/AggregateRoot.ts` ➔ `shared/kernel/src/domain/base/AggregateRoot.ts`
- `packages/common/src/domain/base/ValueObject.ts` ➔ `shared/kernel/src/domain/base/ValueObject.ts`
- `packages/common/src/domain/base/Result.ts` ➔ `shared/kernel/src/domain/base/Result.ts`
- `packages/common/src/domain/base/IDomainEvent.ts` ➔ `shared/kernel/src/domain/base/IDomainEvent.ts`
- `packages/common/src/domain/value-objects/Money.ts` ➔ `shared/kernel/src/domain/value-objects/Money.ts`
- `packages/common/src/domain/value-objects/Coordinates.ts` ➔ `shared/kernel/src/domain/value-objects/Coordinates.ts`
- `packages/common/src/domain/errors/DomainError.ts` ➔ `shared/kernel/src/domain/errors/DomainError.ts`

### Batch 1.2: Shared UI SDK (`shared/ui-sdk/`)
- `packages/ui-sdk/src/factory/ScreenFactory.ts` ➔ `shared/ui-sdk/src/factory/ScreenFactory.ts`
- `packages/ui-sdk/src/builders/BaseScreenBuilder.ts` ➔ `shared/ui-sdk/src/builders/BaseScreenBuilder.ts`
- `packages/ui-sdk/src/models/ui.models.ts` ➔ `shared/ui-sdk/src/models/ui.models.ts`
- `packages/ui-sdk/src/schemas/ui.schemas.ts` ➔ `shared/ui-sdk/src/schemas/ui.schemas.ts`
- `packages/ui-sdk/src/utils/UI.ts` ➔ `shared/ui-sdk/src/utils/UI.ts`

### Batch 1.3: Technical Platform Services (`platform/`)
- `packages/common/src/infrastructure/cache/` ➔ `platform/cache/`
- `packages/common/src/infrastructure/queue/` ➔ `platform/queue/`
- `packages/common/src/infrastructure/events/` ➔ `platform/event-bus/`
- `packages/common/src/infrastructure/storage/` ➔ `platform/storage/`
- `packages/database/src/` ➔ `platform/database/`

### Batch 1.4: Legacy Compatibility Barrels
- `packages/common/src/index.ts` ➔ Re-exports from `@shared/kernel` & `@platform/*` for 100% backward compatibility during migration.

---

## 2. Dependency Migration Order
1. **`shared/kernel`**: 0 internal dependencies. Base kernel must move first.
2. **`shared/ui-sdk`**: Depends only on `@shared/kernel`. Moves second.
3. **`platform/*`**: Depends on `@shared/kernel`. Infrastructure ports and adapters move third.
4. **Backward Compatibility Barrels**: Re-exports from `@shared/kernel` and `@platform/*` to prevent any broken imports in legacy modules.

---

## 3. Implementation Batches

### Batch 1.1: Shared Kernel Extraction
- **Purpose**: Extract universal DDD base classes (`Entity`, `ValueObject`, `Result`, `Money`, `Coordinates`).
- **Validation**: `pnpm build` + `pnpm test`.
- **Commit**: `feat(kernel): extract shared base kernel abstractions`

### Batch 1.2: UI SDK Extraction
- **Purpose**: Move framework-only SDUI primitives to `shared/ui-sdk`.
- **Validation**: `pnpm build` + `pnpm test`.
- **Commit**: `feat(ui-sdk): extract domain-agnostic sdui sdk`

### Batch 1.3: Technical Platform Extraction
- **Purpose**: Extract technical infrastructure ports to `platform/`.
- **Validation**: `pnpm build` + `pnpm test`.
- **Commit**: `feat(platform): extract technical infrastructure ports and adapters`

### Batch 1.4: Compatibility Barrels & Alias Setup
- **Purpose**: Configure `tsconfig.json` path aliases (`@shared/*`, `@platform/*`) and compatibility barrels.
- **Validation**: `pnpm build` + `pnpm test`.
- **Commit**: `feat(monorepo): configure path aliases and compatibility barrels`

---

## 4. Import Migration Strategy
- Configure `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@shared/kernel": ["shared/kernel/src/index.ts"],
        "@shared/ui-sdk": ["shared/ui-sdk/src/index.ts"],
        "@platform/*": ["platform/*/src/index.ts"]
      }
    }
  }
  ```
- Existing imports from `@carbroz/common` will re-export from `@shared/kernel` so no existing feature code breaks during migration.

---

## 5. Build Safety Strategy
After every batch, run:
1. `pnpm build` (TypeScript compilation check)
2. `pnpm test` (All 162 unit & integration tests must pass)
3. `pnpm lint` (ESLint import rules check)

---

## 6. Rollback Strategy
If any batch fails validation:
```bash
git restore .
git clean -fd
```
The branch remains safe and uncorrupted.

---

## 7. Risk Matrix

| Batch | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 1.1 | Missing base class import | Low | Low | Compatibility barrel re-export |
| 1.2 | Broken SDUI type alias | Low | Low | Zod schema validation tests |
| 1.3 | Prisma client path resolution error | Low | Medium | Explicit `platform/database/` path alias |

---

## 8. Verification Checklist
- [ ] `pnpm build` returns zero compiler errors.
- [ ] `pnpm test` passes 100% of tests.
- [ ] Legacy imports compile cleanly via re-export barrels.
- [ ] Git status shows clean staged changes without untracked artifact pollution.

---

## 9. Git Execution Plan
- **Branch**: `feature/m1-shared-kernel-platform`
- **Base**: `feature/architecture-stabilization`
- **PR Title**: `feat(m1): extract shared kernel and technical platform packages`

---

## 10. Migration Timeline
- **Batches**: 4
- **Files Moved**: ~30 files
- **Total Effort**: 2-3 hours
- **Validation Effort**: Sub-second per batch

---

## 11. Success Criteria
1. `shared/kernel/` and `platform/` directories populated cleanly.
2. `pnpm build` compiles with 0 TypeScript errors.
3. `pnpm test` passes 100% (162/162 tests green).
4. Zero production code functionality changed.
5. Merge-ready PR into `feature/architecture-stabilization`.
