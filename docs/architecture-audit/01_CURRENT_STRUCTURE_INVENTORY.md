# 01 — Complete Repository Structure Inventory

## Executive Summary
This document records an exhaustive, empirical inventory of all active workspace packages, applications, modules, files, classes, interfaces, entities, value objects, repositories, use cases, controllers, routes, tests, configuration, and scripts across the CarBroz backend repository.

---

## 1. Workspace Manifest & Package Inventory

| Package / Application | Type | Path | Purpose |
|---|---|---|---|
| `backend-api` | Fastify REST Application | `apps/backend-api` | Primary HTTP API service containing 20 feature modules |
| `@carbroz/common` | Shared Domain Kernel | `packages/common` | Entities, Value Objects, Domain Services, Contracts |
| `@carbroz/database` | Persistence Infrastructure | `packages/database` | Prisma Client wrapper & Prisma Repositories |
| `@carbroz/ui-sdk` | SDUI Layout SDK | `packages/ui-sdk` | BaseScreenBuilder, ScreenFactory, Node Primitives, UI DSL |
| `@carbroz/config` | Configuration Provider | `packages/config` | Environment variables & System Configuration wrapper |
| `@carbroz/feature-flags` | Feature Flag Infrastructure | `packages/feature-flags` | Feature Flag provider & toggle evaluation |
| `@carbroz/logger` | Logging Infrastructure | `packages/logger` | Pino / Fastify Logger configuration wrapper |

---

## 2. Inventory of Backend Feature Modules (`apps/backend-api/src/modules/`)

1. **`admin`**: Partner verification & KYC review endpoints.
2. **`auth`**: Guest login, OTP send/verify, JWT refresh/logout, RBAC middleware, `AuthLoginBuilder`, `AuthOtpBuilder`.
3. **`booking`**: Booking lifecycle use cases (create, confirm, assign partner, status transition, cancel, expire).
4. **`catalog`**: Service catalog browsing, service pricing calculation, catalog management.
5. **`config`**: System config API, `DashboardBuilder`.
6. **`corporate`**: Corporate account registration, membership, fleet enrollment, credit ledger, billing, controllers, routes.
7. **`coupon`**: Promo coupon creation, validation, application, discount calculations.
8. **`customer`**: Customer profile management, saved address management, customer data extraction.
9. **`dispute`**: Booking dispute raising, resolution, SLA refund calculations.
10. **`health`**: Liveness and readiness endpoints.
11. **`invoice`**: Customer tax invoice generation and retrieval.
12. **`maps`**: Google Maps geocoding, reverse geocoding, distance calculation.
13. **`notification`**: Device token registration, multi-channel push/SMS/email notifications.
14. **`partner`**: Partner registration, KYC document upload, partner status.
15. **`payment`**: Payment order creation, webhook handling, Razorpay gateway integration.
16. **`payout`**: Partner payout batching, eligibility calculations, payout marking.
17. **`review`**: Customer review submission, partner rating calculation, review moderation.
18. **`sdui`**: SDUI screen rendering, registry management, draft/publish versioning.
19. **`tracking`**: Real-time partner location tracking sessions and pings.
20. **`vehicle`**: Customer vehicle garage management (add, set default, archive).

---

## 3. Inventory of Shared Domain Components (`packages/common/src/domain/`)

- **Entities & Aggregates**: `User`, `UserSession`, `Role`, `Permission`, `CustomerProfile`, `Address`, `Partner`, `PartnerProfile`, `PartnerMember`, `KycDocument`, `Service`, `ServiceCategory`, `ServiceAddon`, `PricingTier`, `Booking`, `Payment`, `Invoice`, `InvoiceLine`, `PartnerPayout`, `TrackingSession`, `NotificationLog`, `DeviceToken`, `Review`, `Coupon`, `CouponUsage`, `AuditLog`, `Dispute`, `CorporateAccount`, `CorporateMember`, `CorporateFleetVehicle`, `CorporateCreditLedger`, `CorporateInvoice`, `CorporateInvoiceLine`, `SduiScreen`, `SduiComponent`, `SduiSubcomponent`, `SduiChild`, `SduiChildrenData`.
- **Value Objects**: `Money`, `AddressSnapshot`, `Coordinates`.
- **Domain Services**: `TaxCalculator`, `DisputeSettlementCalculator`, `PartnerRatingCalculator`, `CouponDiscountCalculator`, `AuditLogService`, `NotificationService`.
- **Repository Contracts**: 30+ interface contracts in `packages/common/src/domain/repositories/` and domain subdirectories.

---

## 4. Empirical Summary Assessment
The repository has grown cleanly across Phases 1–22 but contains structural inconsistencies:
- Domain entities are split between root `domain/` and subdirectories (`domain/booking/`, `domain/corporate/`, etc.).
- Repository contracts are split between `domain/repositories/` and `domain/<feature>/repositories/`.
- Delivery layer controllers for admin operations are split between `modules/admin/` and `modules/<feature>/controllers/Admin*Controller.ts`.
