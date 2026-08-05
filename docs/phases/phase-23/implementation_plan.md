# Phase 23 — Customer SDUI Composition Engine Technical Implementation Plan

## Executive Summary
Phase 23 designs and implements the complete Customer SDUI Composition Engine for CarBroz, establishing 28 dynamic screen builders in `apps/backend-api/src/modules/sdui/builders/customer/`. The engine reuses existing `@carbroz/ui-sdk` primitives (`ScreenFactory`, `TemplateFactory`, `ComponentFactory`, `SubComponentFactory`, `ActionRegistry`, `ValidatorRegistry`, `AnalyticsRegistry`), domain use cases, and versioning mechanisms to deliver rich, localized, feature-flagged, and cached SDUI JSON structures.

---

## User Review Required

> [!IMPORTANT]
> **Strict SDUI Rules Enforcement (`AGENTS.md`)**:
> 1. Frontend renderers iterate dynamically over `node.children`. No hardcoded UI primitive texts/buttons in Compose/Flutter frontend.
> 2. All 28 screen builders must conform strictly to `docs/architecture/04_DYNAMIC_UI_SPECIFICATION.md`.
> 3. Zero breaking changes to existing domain repositories or API contracts.

---

## Proposed Technical Changes

### 1. Common UI SDK Extensions (`packages/ui-sdk/`)
#### [MODIFY] [ScreenFactory.ts](file:///d:/Backend/CarBroz/backend/packages/ui-sdk/src/factories/ScreenFactory.ts)
- Register all 28 Customer screen builders upon container startup.

---

### 2. Customer SDUI Builders (`apps/backend-api/src/modules/sdui/builders/customer/`)
#### [NEW] `BaseCustomerBuilder.ts`
- Base class providing shared header/footer injection, localization token lookup, and feature-flag filter evaluation.

#### [NEW] Auth & Access Builders (4 Builders)
- `SplashBuilder.ts`
- `GuestLoginBuilder.ts`
- `LoginBuilder.ts`
- `OTPBuilder.ts`

#### [NEW] Discovery & Catalog Builders (5 Builders)
- `DashboardBuilder.ts`
- `SearchBuilder.ts`
- `CategoryBuilder.ts`
- `ServiceListingBuilder.ts`
- `ServiceDetailBuilder.ts`

#### [NEW] Garage & Location Builders (3 Builders)
- `VehicleBuilder.ts`
- `GarageBuilder.ts`
- `AddressBuilder.ts`

#### [NEW] Booking Flow Builders (5 Builders)
- `SlotSelectionBuilder.ts`
- `BookingConfirmationBuilder.ts`
- `ActiveBookingBuilder.ts`
- `BookingTrackingBuilder.ts`
- `BookingHistoryBuilder.ts`

#### [NEW] Payments, Offers & Rewards Builders (6 Builders)
- `InvoiceBuilder.ts`
- `CouponBuilder.ts`
- `ReviewBuilder.ts`
- `WalletBuilder.ts`
- `ReferralBuilder.ts`
- `SubscriptionBuilder.ts`

#### [NEW] Corporate, Account & Support Builders (5 Builders)
- `CorporateBookingBuilder.ts`
- `ProfileBuilder.ts`
- `SettingsBuilder.ts`
- `HelpSupportBuilder.ts`

---

### 3. API & Controller Layer (`apps/backend-api/src/modules/sdui/`)
#### [NEW] `CustomerSduiController.ts`
- Single API controller handling `/api/v1/sdui/customer/screens/:screenKey`.

#### [NEW] `customer-sdui.routes.ts`
- Fastify route registration for customer SDUI endpoints.

---

## Verification Plan

### Automated Tests
- Workspace build: `pnpm build`
- Unit & integration test suite: `pnpm test` (adding `apps/backend-api/tests/customer-sdui-engine.test.ts`)
- Linter verification: `pnpm exec eslint --quiet .`

### Manual Verification
- Validate SDUI JSON output against `04_DYNAMIC_UI_SPECIFICATION.md` schema for all 28 screen keys.
