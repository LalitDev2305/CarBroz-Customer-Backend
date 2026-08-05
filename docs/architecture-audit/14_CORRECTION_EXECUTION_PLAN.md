# 14 — Correction Execution Plan

---

## 1. Safest Step-by-Step Implementation Sequence

1. **Step 1 — Document Approval & Sign-Off**: Review and approve the 18 audit documents.
2. **Step 2 — Root & Workspace File Deletions**: Remove root mock JSON files (`dashboard.json`, `dashboard2.json`, `login.json`), `lint.log`, orphan note file (`e-04 bootstrap into phase-07...`), and root duplicate `prisma/` directory.
3. **Step 3 — Shell Package Cleanup**: Delete 5 empty shell packages (`packages/cache`, `packages/events`, `packages/messaging`, `packages/observability`, `packages/performance`) and update `pnpm-workspace.yaml`.
4. **Step 4 — Package Type Consolidation**: Merge `@carbroz/types` and `@carbroz/validation` into `@carbroz/common`.
5. **Step 5 — Phase 16 Execution**: Begin Phase 16 Booking & Order State Machine.
