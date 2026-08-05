# 01 — Complete Repository Architecture Vision & Blueprint

## 1. Executive Vision & Core Philosophy

CarBroz is a unified, high-performance mobility and vehicle care platform serving four distinct client delivery surfaces:
1. **Customer Mobile & Web App**
2. **Partner (Service Provider) Mobile App**
3. **Corporate Fleet Portal & Mobile App**
4. **Admin Web Control Panel**

These delivery surfaces are **NOT** separate backend microservices or siloed backend applications. They are client-facing presentation surfaces consuming a single, highly modularized **Modular Monolith** backend architecture.

---

## 2. Core Architectural Principles

### 1. Single Feature Co-Location (100% Feature Ownership)
Every business capability (e.g. `Auth`, `Booking`, `Catalog`, `Payment`, `Corporate`) owns **ALL** of its code in **ONE single folder location**:
- Domain Entities & Aggregates
- Value Objects
- Repository Interfaces
- Infrastructure Repositories (Prisma implementations)
- Application Use Cases
- Input/Output DTOs & Validation Schemas
- Delivery Controllers (Customer, Partner, Corporate, Admin)
- Fastify Route Definitions
- Feature SDUI Builders (Customer, Partner, Corporate)
- Unit, Integration & Regression Tests
- Feature DI Registration Block

A developer investigating or extending a feature never searches across distant root folders. Opening `features/booking/` exposes 100% of Booking functionality.

### 2. Multi-Surface Delivery Layer Isolation
Delivery surfaces (`customer`, `partner`, `corporate`, `admin`) exist inside feature modules, not as separate business domains. Single domain logic (e.g., `CancelBookingUseCase`) is reused across all surfaces, while persona-specific REST controllers and SDUI builders sit inside `delivery/customer/`, `delivery/partner/`, `delivery/admin/`.

### 3. Strict Domain & Infrastructure Layer Independence
- **Domain**: Pure TypeScript models and calculation services. Zero dependencies on Fastify, Prisma, Awilix, or HTTP.
- **Application**: Use cases orchestrating domain entities and ports. Zero HTTP or database dependencies.
- **Infrastructure**: Persistence ports implemented via Prisma; notifications via multi-channel providers.
- **UI SDK (`@carbroz/ui-sdk`)**: Pure, domain-agnostic layout composition engine. Zero knowledge of CarBroz business models.

---

## 3. High-Level Modular Monolith Diagram

```
                              ┌─────────────────────────────────────────────────────────┐
                              │                 CLIENT DELIVERY SURFACES                │
                              │  Customer App   Partner App   Corporate App   Admin Panel│
                              └───────────────────────────┬─────────────────────────────┘
                                                          │
                                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 APPS / BACKEND-API (BOOTSTRAP & HTTP SERVER)                            │
│  ├── Server Lifecycle & Plugins (JWT, CORS, Rate Limit, Error Handler, DI Bootstrap)                   │
│  └── Global Route Registry                                                                             │
└─────────────────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                          │
                                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       CARBROZ FEATURE MODULES                                          │
│                                                                                                        │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  ┌───────────────┐  │
│  │     FEATURE: AUTH      │  │    FEATURE: BOOKING    │  │    FEATURE: CATALOG    │  │ FEATURE: CORP │  │
│  │ ├── domain/            │  │ ├── domain/            │  │ ├── domain/            │  │ ├── domain/   │  │
│  │ ├── application/       │  │ ├── application/       │  │ ├── application/       │  │ ├── application│  │
│  │ ├── infrastructure/    │  │ ├── infrastructure/    │  │ ├── infrastructure/    │  │ ├── infra/    │  │
│  │ ├── delivery/          │  │ ├── delivery/          │  │ ├── delivery/          │  │ ├── delivery/ │  │
│  │ │   ├── customer/      │  │ │   ├── customer/      │  │ │   ├── customer/      │  │ │   ├── corp/   │  │
│  │ │   ├── partner/       │  │ │   ├── partner/       │  │ │   └── admin/         │  │ │   └── admin/  │  │
│  │ │   └── admin/         │  │ │   └── admin/         │  │ ├── ui/                 │  │ ├── ui/        │  │
│  │ ├── ui/                │  │ ├── ui/                │  │ └── tests/             │  │ └── tests/    │  │
│  │ └── tests/             │  │ └── tests/             │  └────────────────────────┘  └───────────────┘  │
│  └────────────────────────┘  └────────────────────────┘                                                │
│                                                                                                        │
└─────────────────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                          │
                                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       SHARED INFRASTRUCTURE & KERNEL                                    │
│  ├── @carbroz/common-kernel  (Base Entity, Base Value Objects, Result/Response Helpers, Money VO)      │
│  ├── @carbroz/database       (Prisma Schema, Client Generator, Transaction Provider)                    │
│  ├── @carbroz/ui-sdk         (ScreenFactory, BaseScreenBuilder, Node Builders, UI DSL, Zod Schemas)   │
│  ├── @carbroz/config         (Environment Configuration Provider)                                      │
│  ├── @carbroz/feature-flags  (Feature Flag Evaluation Engine)                                          │
│  └── @carbroz/logger         (Pino Structured Logger Wrapper)                                          │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
