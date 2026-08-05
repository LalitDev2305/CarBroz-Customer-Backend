# Milestone 2 — Comprehensive Validation Plan

Quality assurance and architectural verification plan for Milestone 2 Core Domains migration.

## 1. Automated Verification Commands

| Step | Command | Success Criteria |
|---|---|---|
| **1. Workspace Build** | `pnpm -r build` | 0 TypeScript errors across all 15 workspace projects |
| **2. Monorepo Tests** | `pnpm test` | 100% pass rate (41 test files, 162/162 unit & integration tests) |
| **3. ESLint Audit** | `pnpm exec eslint --quiet .` | 0 lint or import resolution errors |
| **4. Prisma Schema Check** | `npx prisma validate` | Prisma schema valid and in sync |

---

## 2. Public API & Boundary Check
- Verify that `domains/<domain>/` exposes ONLY `public/index.ts`.
- Verify that no external package imports directly from `domains/<domain>/domain/*` or `domains/<domain>/infrastructure/*`.

---

## 3. Backward Compatibility Verification
- Verify that legacy imports from `@carbroz/common` and `@carbroz/database` continue to work cleanly without breakage.
