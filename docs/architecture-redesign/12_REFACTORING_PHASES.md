# 12 — Refactoring Milestones & Implementation Phases

To execute the stabilization safely, the migration is structured into 5 clear milestones:

---

## Milestone 1: Minimal Shared Kernel (`@carbroz/common-kernel`)
- **Goal**: Extract `Entity`, `ValueObject`, `Result`, `Money`, `Coordinates`, `AddressSnapshot`, and base repository interfaces into `packages/common-kernel`.
- **Validation**: `pnpm test` passes 100%.

---

## Milestone 2: Feature Co-Location (Batch 1 Core Features)
- **Goal**: Transition core feature code into feature directories (`features/auth/`, `features/customer/`, `features/partner/`, `features/catalog/`, `features/vehicle/`).
- **Files Moved**: Domain models, repository interfaces, Prisma repos, use cases, controllers, routes, SDUI builders, and tests for Batch 1.
- **Validation**: `pnpm test` passes 100%.

---

## Milestone 3: Feature Co-Location (Batch 2 Transactional Features)
- **Goal**: Transition transactional feature code (`features/booking/`, `features/tracking/`, `features/payment/`, `features/invoice/`, `features/payout/`).
- **Validation**: `pnpm test` passes 100%.

---

## Milestone 4: Feature Co-Location (Batch 3 Engagement & B2B Features)
- **Goal**: Transition engagement feature code (`features/notification/`, `features/review/`, `features/coupon/`, `features/dispute/`, `features/corporate/`, `features/sdui/`, `features/audit/`, `features/config/`).
- **Validation**: `pnpm test` passes 100%.

---

## Milestone 5: Modular DI Registration & Boundary Verification
- **Goal**: Replace monolithic `container/index.ts` with self-registering feature DI modules. Add automated ESLint dependency boundary enforcement rules.
- **Validation**: Full monorepo verification (`pnpm build`, `pnpm test`, `pnpm exec eslint --quiet .`).
