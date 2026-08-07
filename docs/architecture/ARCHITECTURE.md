#---
Version: 2.0.0
Status: FROZEN
Owner: CarBroz Architecture Team
Last Updated: 2026-08-08
---

# CarBroz Enterprise Architecture Blueprint

## Architectural Freeze Declaration

> [!IMPORTANT]
> CarBroz Backend Enterprise Architecture is hereby **VERIFIED, COMPLETED, AND FROZEN**. All architectural patterns, bounded context boundaries, SDUI engine dynamic layout nodes, and CQRS handlers conform strictly to Clean Architecture and DDD principles.

### Key Architectural Standards & Patterns

- **Clean Architecture Core**: `foundation/kernel` contains pure abstractions (`AggregateRoot`, `Entity`, `ValueObject`). Zero framework or Prisma dependencies in domain core.
- **DDD & Lifecycle State Machines**: Explicit `BookingStateMachine` (`domains/operations/booking/src/domain/BookingStateMachine.ts`) enforces state transition invariants (`PENDING` -> `CONFIRMED`/`CANCELLED` -> `COMPLETED`).
- **CQRS Orchestration**: `CreateBookingCommandHandler` and `UpdateLiveGpsLocationCommandHandler` orchestrate mutations via domain interfaces without leaking concrete infrastructure.
- **SDUI Engine**: Dynamic layout trees (`Screen` -> `Template` -> `Component` -> `SubComponent` -> `Child` -> `ChildrenData`) remain locked and backwards compatible.

## System Overview
CarBroz is a **Modular Monolith** backend engineered for high scale, serving Customer, Partner, Corporate, and Admin delivery surfaces.

## Final Nine Bounded Contexts
1. **Identity**: Authentication, JWT, Roles, Permissions, User domain models, Login/Otp SDUI Builders.
2. **Customer**: Profile management, Addresses, Garage/Vehicles, Preferences, Customer Dashboard SDUI Builder.
3. **Partner**: Onboarding, Individual/Organization capabilities, KYC document verification, Availability.
4. **Catalog**: Services, Categories, Addons, Variants, Packages, Requirements.
5. **Commerce**: Pricing rules, Tiers, Discounts, Promotions, Coupons.
6. **Scheduling**: Slots, Capacity, Service Areas, Appointments.
7. **Fulfillment**: Booking lifecycle, Tracking sessions, Location pings, Dispatch, Disputes.
8. **Financials**: Payments, Invoices, Payouts, Ledger entries, Financial transactions.
9. **Engagement**: Reviews, Ratings, Notifications, Customer feedback.

## SDUI Architecture
- Generic Layout Engine: @carbroz/sdui-engine
- Feature-Owned Screen Builders: Co-located inside domain presentation layers (domains/identity/ui, domains/customer/ui).

## Provider Architecture
External integrations follow strict provider capability contracts in platform/ with mock/sandbox/production isolation.
