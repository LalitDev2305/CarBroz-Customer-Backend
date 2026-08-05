# Phase 22 — Multi-Tenant Corporate Accounts, Fleet Management & B2B Billing Platform Implementation Plan

---
**Phase**: Phase 22 (Corporate Accounts, Fleet Management & B2B Billing)  
**Status**: PLANNING ONLY  
**Branch**: `feature/phase-22-corporate-fleet-billing`  
**Dependencies**: Phases 1–21 (Authentication, RBAC, Customer Profile, Vehicles, Booking Engine, Pricing & Catalog, SDUI, Payment Engine, Invoicing Engine, Audit Logging, Reviews, Coupons, Disputes & SLA Refunds)

---

## 1. Executive Summary & Goals

Phase 22 introduces enterprise B2B capabilities to the CarBroz platform. It enables multi-tenant corporate organizations to enroll as enterprise accounts with negotiated credit limits, enroll fleet vehicles, manage employee membership/roles, enforce monthly allowance and spending policies, aggregate employee booking charges into monthly consolidated billing cycles, generate official B2B Tax Invoices with GSTIN breakdown, and process corporate payment allocations with full credit ledger auditability.

---

## 2. Comprehensive Repository Findings & Architectural Analysis (Phases 1–21)

An extensive audit of the existing codebase was conducted to maximize reuse and maintain strict Clean Architecture:

1. **User & RBAC (`packages/common/src/domain/user`)**:
   - `User` aggregate handles system-wide authentication. System roles (`UserRole`: `CUSTOMER`, `PARTNER`, `ADMIN`, `SUPER_ADMIN`).
   - *Finding*: Corporate users will be existing `User` records with role `CUSTOMER`. Corporate permissions (`CORPORATE_ADMIN`, `CORPORATE_FLEET_MANAGER`, `CORPORATE_EMPLOYEE`) will be modeled within the `CorporateMember` entity inside the Corporate bounded context, keeping global RBAC untouched.
2. **CustomerProfile (`packages/common/src/domain/customer`)**:
   - Stores customer contact details, tax info, and preferences.
   - *Finding*: Corporate employees link to individual `CustomerProfile` records. Corporate account details (GSTIN, company registration, billing contact) live in `CorporateAccount`.
3. **Vehicle (`packages/common/src/domain/vehicle`)**:
   - `Vehicle` aggregate represents individual vehicle entities in the customer garage.
   - *Finding*: `CorporateFleetVehicle` will reference existing `Vehicle` records (`vehicleId`), adding fleet-specific metadata (`department`, `costCenter`, `allowanceLimitPaise`, `status`).
4. **Booking (`packages/common/src/domain/booking`)**:
   - `Booking` aggregate represents service bookings with snapshots, pricing, and status state machine.
   - *Finding*: Reused completely! Corporate bookings populate `corporateAccountId` and `corporateFleetVehicleId` foreign keys on the `Booking` entity/schema, allowing seamless execution through the standard booking workflow.
5. **Payment (`packages/common/src/domain/payment`)**:
   - `Payment` aggregate handles Razorpay/Cashfree order creation and webhooks.
   - *Finding*: Individual payments are bypassed for corporate credit bookings. A new payment method `CORPORATE_CREDIT` is introduced, recording transactions in the `CorporateCreditLedger`.
6. **Invoice (`packages/common/src/domain/invoice`)**:
   - `Invoice` and `InvoiceSequence` handle B2C consumer tax invoices.
   - *Finding*: B2B corporate billing requires consolidated monthly invoices with line items for dozens of employee bookings. `CorporateInvoice` and `CorporateInvoiceLine` entities handle batch billing, while sharing the `InvoiceSequence` service for sequential GST tax invoice numbering (`INV-CORP-YYYYMM-XXXX`).
7. **Money (`packages/common/src/domain/money`)**:
   - Value object storing currency (`INR`) and amount in integer paise.
   - *Finding*: Reused universally across all corporate credit limits, ledgers, line items, and invoices.
8. **TaxCalculator (`packages/common/src/domain/tax`)**:
   - Domain service calculating CGST, SGST, IGST.
   - *Finding*: Reused directly to calculate tax breakdowns on B2B corporate invoices based on company state vs. service state.
9. **Notification & Audit Services (`packages/common/src/domain/notification`, `audit`)**:
   - `AuditLogService` and `INotificationProvider` (`Msg91SmsProvider`, `ResendEmailProvider`, `FcmPushProvider`).
   - *Finding*: Reused to audit credit adjustments, invoice generations, and member enrollments, and to notify admins of credit limit breaches or invoice issuances.

---

## 3. Architecture Questions & Key Design Decisions

1. **Is `CorporateAccount` the aggregate root?**
   - **Yes**. `CorporateAccount` is the primary aggregate root managing company metadata, GSTIN verification, credit limits, status (`PENDING_APPROVAL`, `ACTIVE`, `SUSPENDED`, `CLOSED`), and controlling member/fleet boundaries.
2. **Are `CorporateMember` and `CorporateRole` required for MVP?**
   - **Yes**. `CorporateMember` links `userId` to `corporateAccountId` with role enum (`CORP_ADMIN`, `FLEET_MANAGER`, `EMPLOYEE`), enabling fine-grained corporate authorization.
3. **Does `FleetVehicle` reference the existing `Vehicle` aggregate?**
   - **Yes**. `CorporateFleetVehicle` holds a foreign key to `Vehicle.id` (`vehicleId`), preventing duplicate vehicle telemetry or maintenance specs.
4. **Do corporate bookings reuse `Booking` or require a separate model?**
   - **Reuse `Booking`**. A corporate booking is a standard booking attached to a corporate account (`corporateAccountId`), paid via `CORPORATE_CREDIT`.
5. **Does B2B billing reuse `Invoice` or require `CorporateInvoice`?**
   - **Requires `CorporateInvoice`**. B2B billing aggregates multiple booking line items into a single monthly bill with consolidated GST breakdown, payment terms, and status (`DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`).
6. **Does credit tracking require a ledger instead of mutable balance fields?**
   - **Requires a proper Ledger (`CorporateCreditLedger`)**. Mutable balances are prone to race conditions and audit failure. Every credit allocation, booking charge, refund, or adjustment creates an immutable ledger entry with `balanceAfterPaise`.
7. **Where do monthly allowances belong?**
   - **`CorporateFleetVehicle` and `CorporateMember`**. MVP supports per-vehicle and per-member monthly spending caps (`monthlyCapPaise`), validated at booking creation.
8. **Should corporate billing and fleet management remain in one phase?**
   - **Yes**. Fleet enrollment and credit billing are tightly coupled in the corporate user workflow.
9. **Essential MVP Business Rules**:
   - Company GSTIN validation & Admin approval.
   - Immutable credit ledger with real-time limit checks (`utilisedCreditPaise + bookingAmount <= creditLimitPaise`).
   - Corporate credit payment option at booking checkout.
   - Monthly automated/manual consolidated invoice generation.
   - Corporate Admin dashboard and Platform Admin credit controls.
10. **Enterprise Features Postponed to Future Phases**:
    - Multi-company holding hierarchies / parent-subsidiary billing.
    - Department-level cost center budget approvals & PO workflows.
    - Automated bank API feeds for real-time payment reconciliation.
    - Dynamic automated credit scoring algorithms.

---

## 4. Domain Design & Bounded Contexts

Location: `packages/common/src/domain/corporate/`

### Aggregate Root: `CorporateAccount`
- **Fields**: `id`, `publicId`, `companyName`, `legalName`, `gstin`, `pan`, `billingAddress`, `creditLimitPaise`, `utilisedCreditPaise`, `status` (`PENDING_APPROVAL`, `ACTIVE`, `SUSPENDED`, `CLOSED`), `paymentTermsDays`, `createdAt`, `updatedAt`.
- **Invariants**:
  - `utilisedCreditPaise` must never exceed `creditLimitPaise` for active bookings.
  - Account must be in `ACTIVE` status to allow new corporate bookings.
  - Credit limit adjustments can only be performed by Platform Admins.

### Entity: `CorporateMember`
- **Fields**: `id`, `publicId`, `corporateAccountId`, `userId`, `role` (`CORP_ADMIN`, `FLEET_MANAGER`, `EMPLOYEE`), `status` (`ACTIVE`, `INACTIVE`), `monthlyCapPaise`, `createdAt`, `updatedAt`.

### Entity: `CorporateFleetVehicle`
- **Fields**: `id`, `publicId`, `corporateAccountId`, `vehicleId`, `department`, `costCenter`, `monthlyCapPaise`, `status` (`ACTIVE`, `INACTIVE`), `createdAt`, `updatedAt`.

### Entity / Value Object: `CorporateCreditLedger`
- **Fields**: `id`, `publicId`, `corporateAccountId`, `bookingId` (optional), `invoiceId` (optional), `entryType` (`CREDIT_GRANTED`, `BOOKING_DEBIT`, `BOOKING_REFUND_CREDIT`, `PAYMENT_CREDIT`, `ADJUSTMENT`), `amountPaise`, `balanceAfterPaise`, `referenceNotes`, `createdAt`.

### Aggregate Root / Entity: `CorporateInvoice`
- **Fields**: `id`, `publicId`, `invoiceNumber`, `corporateAccountId`, `billingPeriodStart`, `billingPeriodEnd`, `subtotalPaise`, `cgstPaise`, `sgstPaise`, `igstPaise`, `totalAmountPaise`, `paidAmountPaise`, `dueDate`, `status` (`DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`), `createdAt`, `updatedAt`.

---

## 5. Database Schema Proposal (Prisma)

```prisma
enum CorporateAccountStatus {
  PENDING_APPROVAL
  ACTIVE
  SUSPENDED
  CLOSED
}

enum CorporateMemberRole {
  CORP_ADMIN
  FLEET_MANAGER
  EMPLOYEE
}

enum CorporateLedgerEntryType {
  CREDIT_GRANTED
  BOOKING_DEBIT
  BOOKING_REFUND_CREDIT
  PAYMENT_CREDIT
  ADJUSTMENT
}

enum CorporateInvoiceStatus {
  DRAFT
  ISSUED
  PARTIALLY_PAID
  PAID
  OVERDUE
}

model CorporateAccount {
  id                  Int                    @id @default(autoincrement())
  publicId            String                 @unique @default(uuid())
  companyName         String
  legalName           String
  gstin               String                 @unique
  pan                 String
  billingAddress      Json
  creditLimitPaise    BigInt                 @default(0)
  utilisedCreditPaise BigInt                 @default(0)
  status              CorporateAccountStatus @default(PENDING_APPROVAL)
  paymentTermsDays    Int                    @default(30)
  createdAt           DateTime               @default(now())
  updatedAt           DateTime               @updatedAt

  members        CorporateMember[]
  fleetVehicles  CorporateFleetVehicle[]
  ledgerEntries  CorporateCreditLedger[]
  invoices       CorporateInvoice[]

  @@index([status])
  @@map("corporate_accounts")
}

model CorporateMember {
  id                 Int                 @id @default(autoincrement())
  publicId           String              @unique @default(uuid())
  corporateAccountId Int
  userId             Int
  role               CorporateMemberRole @default(EMPLOYEE)
  status             String              @default("ACTIVE")
  monthlyCapPaise    BigInt?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  corporateAccount CorporateAccount @relation(fields: [corporateAccountId], references: [id], onDelete: Cascade)
  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([corporateAccountId, userId])
  @@index([userId])
  @@map("corporate_members")
}

model CorporateFleetVehicle {
  id                 Int      @id @default(autoincrement())
  publicId           String   @unique @default(uuid())
  corporateAccountId Int
  vehicleId          Int
  department         String?
  costCenter         String?
  monthlyCapPaise    BigInt?
  status             String   @default("ACTIVE")
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  corporateAccount CorporateAccount @relation(fields: [corporateAccountId], references: [id], onDelete: Cascade)
  vehicle          Vehicle          @relation(fields: [vehicleId], references: [id], onDelete: Cascade)

  @@unique([corporateAccountId, vehicleId])
  @@index([vehicleId])
  @@map("corporate_fleet_vehicles")
}

model CorporateCreditLedger {
  id                 Int                      @id @default(autoincrement())
  publicId           String                   @unique @default(uuid())
  corporateAccountId Int
  bookingId          Int?
  invoiceId          Int?
  entryType          CorporateLedgerEntryType
  amountPaise        BigInt
  balanceAfterPaise  BigInt
  referenceNotes     String?
  createdAt          DateTime                 @default(now())

  corporateAccount CorporateAccount  @relation(fields: [corporateAccountId], references: [id], onDelete: Cascade)
  booking          Booking?           @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  invoice          CorporateInvoice?  @relation(fields: [invoiceId], references: [id], onDelete: SetNull)

  @@index([corporateAccountId, createdAt])
  @@map("corporate_credit_ledgers")
}

model CorporateInvoice {
  id                 Int                    @id @default(autoincrement())
  publicId           String                 @unique @default(uuid())
  invoiceNumber      String                 @unique
  corporateAccountId Int
  billingPeriodStart DateTime
  billingPeriodEnd   DateTime
  subtotalPaise      BigInt
  cgstPaise          BigInt
  sgstPaise          BigInt
  igstPaise          BigInt
  totalAmountPaise   BigInt
  paidAmountPaise    BigInt                 @default(0)
  dueDate            DateTime
  status             CorporateInvoiceStatus @default(DRAFT)
  createdAt          DateTime               @default(now())
  updatedAt          DateTime               @updatedAt

  corporateAccount CorporateAccount        @relation(fields: [corporateAccountId], references: [id], onDelete: Cascade)
  lines            CorporateInvoiceLine[]
  ledgerEntries    CorporateCreditLedger[]

  @@index([corporateAccountId, status])
  @@map("corporate_invoices")
}

model CorporateInvoiceLine {
  id                 Int      @id @default(autoincrement())
  publicId           String   @unique @default(uuid())
  corporateInvoiceId Int
  bookingId          Int      @unique
  description        String
  amountPaise        BigInt
  taxRateBasis       Decimal  @db.Decimal(5, 2)
  createdAt          DateTime @default(now())

  invoice CorporateInvoice @relation(fields: [corporateInvoiceId], references: [id], onDelete: Cascade)
  booking Booking          @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@map("corporate_invoice_lines")
}
```

---

## 6. Proposed REST APIs

### Corporate Admin APIs (`/api/v1/corporate/...`)
- `POST /api/v1/corporate/register`: Register new corporate account.
- `GET /api/v1/corporate/profile`: Get current corporate account details.
- `POST /api/v1/corporate/members`: Add employee/member by email & role.
- `DELETE /api/v1/corporate/members/:memberPublicId`: Deactivate member.
- `POST /api/v1/corporate/fleet`: Enroll vehicle into fleet.
- `DELETE /api/v1/corporate/fleet/:fleetVehiclePublicId`: Deactivate fleet vehicle.
- `GET /api/v1/corporate/credit-ledger`: View credit ledger & remaining credit limit.
- `GET /api/v1/corporate/invoices`: View monthly B2B invoices.
- `GET /api/v1/corporate/invoices/:invoicePublicId`: Download invoice detail & line items.

### Platform Admin APIs (`/api/v1/admin/corporate/...`)
- `POST /api/v1/admin/corporate/:accountPublicId/approve`: Approve corporate account & set initial credit limit.
- `POST /api/v1/admin/corporate/:accountPublicId/suspend`: Suspend corporate account.
- `POST /api/v1/admin/corporate/:accountPublicId/credit-limit`: Adjust credit limit (writes to credit ledger).
- `POST /api/v1/admin/corporate/:accountPublicId/generate-invoice`: Trigger billing cycle & generate invoice.
- `POST /api/v1/admin/corporate/invoices/:invoicePublicId/reconcile-payment`: Record B2B bank payment.

---

## 7. Security & Tenant Isolation
- **Tenant Authorization Middleware (`corporateAuthMiddleware`)**: Verifies that the authenticated user belongs to an active `CorporateMember` entry for the target `CorporateAccount`.
- **RBAC Enforcement**: Only `CORP_ADMIN` can add/remove members and manage credit settings; `FLEET_MANAGER` can manage fleet vehicles; `EMPLOYEE` can only book using corporate credit if authorized.
- **Platform Admin Controls**: Credit limit adjustments and payment reconciliation require Platform Admin credentials with explicit audit logging.

---

## 8. Verification & Performance Strategy
- **Automated Unit & Integration Tests**: Test `CorporateAccount` domain logic, credit ledger balance checks, booking eligibility validation, and `CorporateInvoice` generation.
- **Concurrent Credit Check Safety**: Implement Prisma transaction locks on `CorporateAccount` when validating `utilisedCreditPaise` during booking checkout.
- **Target Suite Verification**: Run `pnpm build`, `pnpm test` (aiming for 100% pass across all unit test suites), and `pnpm exec eslint`.
