# Milestone 4 — Detailed Execution Plan

Step-by-step batch execution plan for migrating the 7 Engagement Bounded Contexts (`notification`, `review`, `coupon`, `dispute`, `sdui-registry`, `audit`, `config`).

## 1. Batch Execution Schedule

### Batch 4.1: Notification & Review Domains (`domains/notification/`, `domains/review/`)
- Extract Notification models & repositories into `domains/notification/`.
- Extract Review models & repositories into `domains/review/`.
- Package manifests, module registrations, public barrels.
- Run `pnpm -r build` & `pnpm test`.

### Batch 4.2: Coupon & Dispute Domains (`domains/coupon/`, `domains/dispute/`)
- Extract Coupon models & repositories into `domains/coupon/`.
- Extract Dispute models & repositories into `domains/dispute/`.
- Package manifests, module registrations, public barrels.
- Run `pnpm -r build` & `pnpm test`.

### Batch 4.3: SDUI Registry, Audit & Config Domains (`domains/sdui-registry/`, `domains/audit/`, `domains/config/`)
- Extract SDUI Registry models & repositories into `domains/sdui-registry/`.
- Extract Audit models & repositories into `domains/audit/`.
- Extract Config models & repositories into `domains/config/`.
- Package manifests, module registrations, public barrels.
- Run `pnpm -r build` & `pnpm test`.

### Batch 4.4: Monorepo Integration & Final Validation Audit
- Register modules in `apps/backend-api/src/container/index.ts`.
- Run full validation suite: `pnpm -r build`, `pnpm test`, `pnpm lint`.
- Generate `walkthrough.md`, `migration_summary.md`, `validation_report.md`.

---

## 2. Mandatory Stop Gate

- **Do NOT proceed to implementation automatically.**
- Present analysis deliverables for review.
- Wait for user approval before starting Batch 4.1.
