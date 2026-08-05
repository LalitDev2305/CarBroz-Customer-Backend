# Milestone 3 — Transactional Domains Migration Summary

Summary of migration for the 5 Transactional Bounded Contexts.

## 1. Migrated Bounded Contexts

| Bounded Context | Package Name | Directory | Domain Artifacts |
|---|---|---|---|
| Booking | `@carbroz/domain-booking` | `domains/booking/` | `Booking`, `BookingSnapshots`, `BookingStatus`, `BookingStatusHistoryItem`, `PrismaBookingRepository` |
| Tracking | `@carbroz/domain-tracking` | `domains/tracking/` | `TrackingSession`, `PrismaTrackingSessionRepository` |
| Payment | `@carbroz/domain-payment` | `domains/payment/` | `Payment`, `PaymentMethod`, `PaymentStatus`, `PaymentWebhook`, `PrismaPaymentRepository` |
| Invoice | `@carbroz/domain-invoice` | `domains/invoice/` | `Invoice`, `InvoiceStatus`, `PrismaInvoiceRepository` |
| Payout | `@carbroz/domain-payout` | `domains/payout/` | `PartnerPayout`, `PayoutStatus`, `PrismaPartnerPayoutRepository` |

---

## 2. Backward Compatibility Barrels

- All 5 domain models remain exported via `@carbroz/common` for legacy consumers.
- DI container registrations in `apps/backend-api/src/container/index.ts` invoke individual module registers: `registerBookingModule`, `registerTrackingModule`, `registerPaymentModule`, `registerInvoiceModule`, `registerPayoutModule`.
