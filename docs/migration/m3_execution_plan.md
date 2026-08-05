# Milestone 3 — Detailed Execution Plan

Step-by-step batch execution plan for migrating the 5 Transactional Bounded Contexts (`booking`, `tracking`, `payment`, `invoice`, `payout`).

## 1. Batch Execution Schedule

### Batch 3.1: Booking Domain (`domains/booking/`)
- Extract `Booking`, `BookingSnapshots`, `BookingStatus`, `BookingStatusHistoryItem` into `domains/booking/domain/`.
- Extract `IBookingRepository` into `domains/booking/application/repositories/`.
- Extract `PrismaBookingRepository` into `domains/booking/infrastructure/repositories/`.
- Create `booking.module.ts`, `module.manifest.ts`, `package.json`, `tsconfig.json`, `public/index.ts`, `README.md`.
- Register `@carbroz/domain-booking` in `pnpm-workspace.yaml`.
- Run `pnpm -r build` & `pnpm test`.

### Batch 3.2: Tracking Domain (`domains/tracking/`)
- Extract `TrackingSession` into `domains/tracking/domain/`.
- Extract `ITrackingSessionRepository` into `domains/tracking/application/repositories/`.
- Extract `PrismaTrackingSessionRepository` into `domains/tracking/infrastructure/repositories/`.
- Create `tracking.module.ts`, `module.manifest.ts`, `package.json`, `tsconfig.json`, `public/index.ts`, `README.md`.
- Register `@carbroz/domain-tracking` in `pnpm-workspace.yaml`.
- Run `pnpm -r build` & `pnpm test`.

### Batch 3.3: Payment Domain (`domains/payment/`)
- Extract `Payment`, `PaymentMethod`, `PaymentStatus`, `PaymentWebhook` into `domains/payment/domain/`.
- Extract `IPaymentRepository` into `domains/payment/application/repositories/`.
- Extract `PrismaPaymentRepository` into `domains/payment/infrastructure/repositories/`.
- Create `payment.module.ts`, `module.manifest.ts`, `package.json`, `tsconfig.json`, `public/index.ts`, `README.md`.
- Register `@carbroz/domain-payment` in `pnpm-workspace.yaml`.
- Run `pnpm -r build` & `pnpm test`.

### Batch 3.4: Invoice & Payout Domains (`domains/invoice/`, `domains/payout/`)
- Extract `Invoice`, `InvoiceStatus`, `IInvoiceRepository`, `PrismaInvoiceRepository`.
- Extract `PartnerPayout`, `PayoutStatus`, `IPartnerPayoutRepository`, `PrismaPartnerPayoutRepository`.
- Create package manifests, tsconfigs, module registrations, and public barrel files.
- Register `@carbroz/domain-invoice` and `@carbroz/domain-payout` in `pnpm-workspace.yaml`.
- Run `pnpm -r build` & `pnpm test`.

### Batch 3.5: Final Monorepo Integration & Validation Audit
- Verify container registrations in `apps/backend-api/src/container/`.
- Run workspace build: `pnpm -r build`.
- Run complete test suite: `pnpm test`.
- Run ESLint audit: `pnpm lint`.
- Verify clean git status.

---

## 2. Mandatory Stop Gate

- **Do NOT proceed to implementation automatically.**
- Present analysis deliverables for review.
- Wait for user approval before starting Batch 3.1.
