# Phase 15 — Monorepo Hygiene, Package Consolidation, and Architecture Cleanup Implementation Plan

## Executive Summary
Phase 15 cleans confirmed repository waste, deletes empty shell packages, merges `@carbroz/types` into `@carbroz/common`, removes unused root mock files and duplicate Prisma directories, and updates monorepo workspace configuration while preserving 100% of active business and SDUI capabilities.

## Changes Executed

1. **Delete Root Artifacts**:
   - `dashboard.json`, `dashboard2.json`, `login.json`, `lint.log`
   - `e-04 bootstrap into phase-07 admin rbac...`
   - Root `prisma/` folder stub

2. **Delete Empty Shell Packages**:
   - `packages/cache`
   - `packages/events`
   - `packages/messaging`
   - `packages/observability`
   - `packages/performance`
   - `packages/validation`

3. **Consolidate `@carbroz/types`**:
   - Move `ApiResponse`, `PaginationOptions`, `PaginatedData`, `RequestContext` into `packages/common/src/responses.ts`.
   - Update all workspace references from `@carbroz/types` to `@carbroz/common`.
   - Delete `packages/types`.

4. **Update Workspace Configuration**:
   - Update `pnpm-workspace.yaml`, root `package.json`, and tsconfig references.
   - Update `.gitignore` to prevent reintroduction of lint logs and root mocks.

## Verification Plan
- `pnpm install`
- `pnpm prisma validate`
- `pnpm prisma generate`
- `pnpm lint`
- `pnpm build`
- `pnpm test` (84/84 tests passing)
