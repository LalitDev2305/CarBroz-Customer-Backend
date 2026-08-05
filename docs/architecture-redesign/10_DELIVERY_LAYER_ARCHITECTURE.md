# 10 — Delivery Surface Architecture (Customer, Partner, Corporate, Admin)

## Executive Summary
This document clarifies how the four client delivery surfaces (Customer, Partner, Corporate, Admin) are routed and organized across CarBroz feature modules without duplicating domain logic.

---

## 1. REST Routing & Controller Blueprint

Client delivery surfaces map to REST URL namespaces served by `apps/backend-api`:

| Delivery Surface | Base Route Prefix | Controller Location in Feature | Authorization Middleware |
|---|---|---|---|
| **Customer App** | `/api/v1/customer/...` | `features/<feature>/delivery/customer/` | `CustomerJwtAuth` |
| **Partner App** | `/api/v1/partner/...` | `features/<feature>/delivery/partner/` | `PartnerJwtAuth`, `KycVerifiedGuard` |
| **Corporate App** | `/api/v1/corporate/...` | `features/<feature>/delivery/corporate/` | `CorporateJwtAuth`, `CorporateAccountGuard` |
| **Admin Panel** | `/api/v1/admin/...` | `features/<feature>/delivery/admin/` | `AdminJwtAuth`, `RbacPermissionGuard` |

---

## 2. Example Delivery Organization (`features/booking/`)

```
features/booking/delivery/
├── customer/
│   ├── CustomerBookingController.ts     # Create booking, view active, cancel
│   └── customer-booking.routes.ts       # POST /api/v1/customer/bookings
├── partner/
│   ├── PartnerBookingController.ts      # Accept job, update status, complete job
│   └── partner-booking.routes.ts        # POST /api/v1/partner/bookings/:id/accept
├── corporate/
│   ├── CorporateBookingController.ts    # Book on credit ledger, fleet assignment
│   └── corporate-booking.routes.ts      # POST /api/v1/corporate/bookings
└── admin/
    ├── AdminBookingController.ts        # Override status, force refund, reassign
    └── admin-booking.routes.ts          # POST /api/v1/admin/bookings/:id/override
```
- All four controllers delegate to shared domain use cases (`CreateBookingUseCase`, `CancelBookingUseCase`, `AssignPartnerUseCase`), guaranteeing **100% DRY domain logic**.
