# 03 — Target Package & Workspace Structure Blueprint

## 1. High-Level Monorepo Package Hierarchy

To achieve 100% feature ownership without creating 30+ separate npm packages that degrade build performance, CarBroz adopts a **Feature-Bounded Monolith Monorepo Architecture**:

```
CarBroz Monorepo Root
├── apps/
│   └── backend-api/                       # Application Bootstrapper & HTTP Delivery Server
│       ├── src/
│       │   ├── server.ts                  # Fastify server entry point
│       │   ├── app.ts                     # Fastify plugin & route registrator
│       │   └── container/                 # Application DI Container orchestrator
│       └── tests/                         # E2E & Integration API test suites
│
├── features/                              # FEATURE BOUNDED CONTEXTS (100% Feature Co-Location)
│   ├── auth/                              # Authentication & RBAC Feature Package / Module
│   ├── customer/                          # Customer Profile & Address Feature
│   ├── partner/                           # Partner Onboarding & KYC Feature
│   ├── catalog/                           # Service Catalog & Pricing Feature
│   ├── vehicle/                           # Garage & Vehicle Management Feature
│   ├── booking/                           # Booking Engine & Slot Feature
│   ├── tracking/                          # Live Tracking & Maps Feature
│   ├── payment/                           # Payment & Razorpay Gateway Feature
│   ├── invoice/                           # GST Tax Invoice Feature
│   ├── payout/                            # Partner Payout Batching Feature
│   ├── notification/                      # Multi-Channel Push & SMS Feature
│   ├── review/                            # Customer Reviews & Ratings Feature
│   ├── coupon/                            # Discount Coupon Engine Feature
│   ├── dispute/                           # Booking Dispute & SLA Refund Feature
│   ├── corporate/                         # Corporate Accounts & B2B Billing Feature
│   ├── sdui/                              # SDUI Registry & Versioning Feature
│   ├── audit/                             # Immutable Audit Logging Feature
│   └── config/                            # App Initialization & System Config Feature
│
└── packages/                              # GENUINE SHARED KERNEL & UTILITY LIBRARIES
    ├── common-kernel/                     # Base Entity, Base Value Object, Result, Money VO
    ├── database/                          # Unified Prisma Schema, Client Generator, Transaction Provider
    ├── ui-sdk/                            # Domain-Agnostic SDUI Layout Composition SDK
    ├── config/                            # Environment Config Provider
    ├── feature-flags/                     # Feature Flag Engine
    └── logger/                            # Structured Pino Logger Utility
```

---

## 2. Package Responsibilities & Boundaries

| Package / Folder | Purpose | Direct Dependencies | Prohibited Dependencies |
|---|---|---|---|
| `features/<feature>` | 100% Ownership of feature business domain, use cases, Prisma repos, delivery controllers, SDUI builders | `common-kernel`, `database`, `ui-sdk` | Other feature internal implementations |
| `packages/common-kernel` | Base abstractions (`Entity`, `ValueObject`, `Result`, `Money`, `Coordinates`) | None (0 internal dependencies) | Everything else |
| `packages/database` | Unified Prisma Client & Database Migrations | `@prisma/client`, `common-kernel` | Feature modules |
| `packages/ui-sdk` | Domain-agnostic SDUI node primitives, `BaseScreenBuilder`, `ScreenFactory` | `common-kernel` | Feature modules, Fastify, Prisma |
