# Phase 22 — Blockers & Key Architecture Decisions

---

## Architecture Decisions

### ADR-022-01: Immutable Ledger for Corporate Credit Tracking
- **Decision**: All corporate credit limit allocations, booking debits, refund credits, and payment reconciliations must be recorded as immutable rows in `CorporateCreditLedger` with explicit `balanceAfterPaise`.
- **Rationale**: Prevents race conditions during concurrent employee bookings and provides a 100% audit trail for financial disputes and B2B accounting reconciliation.

### ADR-022-02: Bounded Context Isolation for Corporate Membership
- **Decision**: Corporate membership roles (`CORP_ADMIN`, `FLEET_MANAGER`, `EMPLOYEE`) are scoped to `CorporateMember` within the Corporate bounded context, rather than extending system-wide `UserRole`.
- **Rationale**: Keeps global user authentication clean. A user can be a standard customer for personal bookings while acting as a Corporate Admin or Employee for corporate bookings.

### ADR-022-03: Consolidated B2B Invoicing Engine (`CorporateInvoice`)
- **Decision**: B2B billing uses dedicated `CorporateInvoice` and `CorporateInvoiceLine` entities, but shares the `InvoiceSequence` domain service with consumer invoicing for unified GST sequence compliance.
- **Rationale**: Consumer B2C invoices are per-booking immediate receipts, whereas B2B invoices aggregate dozens of employee bookings into a single monthly statement with net 30 payment terms.

---

## Blockers & Risk Analysis

1. **Concurrent Credit Utilization**: High-frequency employee bookings could exceed company credit limits if checked non-atomically.
   - *Mitigation*: Enforce `SELECT ... FOR UPDATE` or Prisma transaction locks during `utilisedCreditPaise` validation in `CorporateCreditLedgerService`.
2. **GST State Matching for IGST vs CGST+SGST**: Services rendered in state X for a company registered in state Y require IGST calculations.
   - *Mitigation*: Direct reuse of existing `TaxCalculator` service passing corporate GSTIN state code vs service location state code.
