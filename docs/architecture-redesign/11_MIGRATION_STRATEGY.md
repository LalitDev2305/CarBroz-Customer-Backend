# 11 — Safe Architecture Migration Strategy

## Executive Summary
This document outlines a non-breaking, incremental refactoring strategy to transition CarBroz from the current structure to the target Feature-Bounded Architecture while keeping test suites passing after every step.

---

## 1. Golden Rules of Migration
1. **Zero Downtime / Continuous Buildability**: Every commit must compile (`pnpm build`) and pass unit/integration tests (`pnpm test`).
2. **Backward Compatible Barrel Exports**: When moving domain models out of `@carbroz/common` root into feature directories, re-export them from `packages/common-kernel/src/index.ts` during transition so legacy import paths do not break immediately.
3. **Feature-by-Feature Transition**: Refactor one feature bounded context at a time (e.g. `Auth` first, `Booking` second) rather than a risky global file move.
4. **No Database Migration Impact**: Database tables, Prisma models, and PostgreSQL migrations remain unchanged.
5. **No SDUI Contract Changes**: Dynamic UI JSON output remains 100% frozen.
