# Phase 17 Architectural Decisions & Blockers Log

---

## 1. Architectural Decisions

### ADR-016: Payment Gateway Abstraction Interface (`IPaymentGatewayProvider`)
- **Decision**: Define `IPaymentGatewayProvider` in `@carbroz/common` and implement `RazorpayPaymentGatewayProvider` in `apps/backend-api`.
- **Rationale**: Isolates gateway-specific SDK logic from core domain and use cases. Allows switching or adding Stripe/Cashfree without domain refactoring.

### ADR-017: Commercial Values Stored in Integer Paise
- **Decision**: All payment amounts, tax components, commission deductions, and net payouts stored strictly in integer paise.
- **Rationale**: Eliminates floating-point rounding errors across financial calculations.

### ADR-018: Webhook Idempotency via Unique Event ID
- **Decision**: Persist incoming webhooks in `payment_webhooks` table with `eventId` unique index before processing.
- **Rationale**: Guarantees replay protection and prevents double-crediting/double-settling of bookings.

---

## 2. Blockers
- **None**: All underlying dependencies (`Booking`, `Partner`, `PrismaTransactionProvider`) exist and are verified.
