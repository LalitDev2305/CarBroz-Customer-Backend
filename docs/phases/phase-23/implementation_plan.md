# Phase 23 — Customer SDUI Composition Engine Technical Implementation Plan

## Executive Summary
Phase 23 implements the Customer SDUI Composition Engine for CarBroz across 6 modular backend feature areas (`apps/backend-api/src/modules/*/ui/`). The engine reuses existing `@carbroz/ui-sdk` primitives (`BaseScreenBuilder`, `ScreenFactory`, `BaseTemplate`, `GenericComponent`, `Subcomponent`, `Child`, `ChildrenData`, `UI` helper), existing builders (`AuthLoginBuilder`, `AuthOtpBuilder`, `DashboardBuilder`), domain use cases, and Phase 14 `SduiVersioning` to deliver rich, localized, feature-flagged, and cached SDUI JSON structures conforming strictly to `04_DYNAMIC_UI_SPECIFICATION.md`.

---

## User Review Required

> [!IMPORTANT]
> **Strict Repository & Architecture Directives**:
> 1. `@carbroz/ui-sdk` remains 100% infrastructure-independent. No imports of Fastify, Prisma, or backend modules into `ui-sdk`.
> 2. Builders compose layouts using single `ScreenFactory` and node builders (`BaseTemplate`, `GenericComponent`, `Subcomponent`, `Child`, `ChildrenData`, `UI` helper). No non-existent factories or registries.
> 3. Existing builders (`AuthLoginBuilder`, `AuthOtpBuilder`, `DashboardBuilder`) are preserved in their respective feature modules and registered in DI without code duplication or JSON breaking changes.

---

## Screen Inventory & Implementation Batches

### Batch 1 — Authentication & Foundation (5 Screens)
- `SplashBuilder` (`splash_main`): App splash & config init loading screen.
- `GuestLoginBuilder` (`guest_login_main`): Guest onboarding screen.
- `AuthLoginBuilder` (`auth_login`) — **REUSED**: Mobile OTP login screen (`modules/auth/ui/AuthLoginBuilder.ts`).
- `AuthOtpBuilder` (`auth_otp`) — **REUSED**: OTP verification screen (`modules/auth/ui/AuthOtpBuilder.ts`).
- `DashboardBuilder` (`dashboard_main`) — **REUSED**: Home dashboard screen (`modules/config/ui/DashboardBuilder.ts`).

### Batch 2 — Catalog & Discovery (4 Screens)
- `SearchBuilder` (`catalog_search`): Universal search for services and packages.
- `CategoryBuilder` (`catalog_category`): Category listing screen.
- `ServiceListingBuilder` (`catalog_service_list`): Package listing screen.
- `ServiceDetailBuilder` (`catalog_service_detail`): Detailed service specs & pricing breakdown.

### Batch 3 — Garage & Location (3 Screens)
- `GarageBuilder` (`garage_main`): Customer garage vehicle listing screen.
- `VehicleBuilder` (`vehicle_add_edit`): Vehicle creation and spec entry screen.
- `AddressBuilder` (`customer_address_manage`): Saved addresses management screen.

### Batch 4 — Booking & Tracking (5 Screens)
- `SlotSelectionBuilder` (`booking_slot_select`): Date & time slot picker screen.
- `BookingConfirmationBuilder` (`booking_checkout_confirm`): Booking review & payment selection screen.
- `ActiveBookingBuilder` (`booking_active_status`): Active booking status overview screen.
- `BookingTrackingBuilder` (`booking_live_tracking`): Real-time live partner tracking screen.
- `BookingHistoryBuilder` (`booking_history_list`): Past booking history screen.

### Batch 5 — Payments, Reviews, Notifications & Support (8 Screens)
- `InvoiceBuilder` (`invoice_detail`): Itemized GST tax invoice screen.
- `CouponBuilder` (`coupon_list_apply`): Available promo coupons screen.
- `ReviewBuilder` (`review_submit_list`): Customer rating & review submission screen.
- `NotificationBuilder` (`notification_inbox`): Push notification history screen.
- `ProfileBuilder` (`customer_profile`): Customer profile details screen.
- `SettingsBuilder` (`app_settings`): App preferences screen.
- `HelpSupportBuilder` (`help_support_static`): FAQ & customer support contact screen.
- `CorporateBookingBuilder` (`corporate_booking_checkout`): Corporate credit booking checkout screen.

### Batch 6 — Deferred Screens (3 Screens)
- `WalletBuilder` (Deferred: Wallet domain backend not implemented)
- `ReferralBuilder` (Deferred: Referral domain backend not implemented)
- `SubscriptionBuilder` (Deferred: Subscription domain backend not implemented)

---

## Proposed Technical Changes (Modular Builder Ownership)

### 1. Awilix DI Registration (`apps/backend-api/src/container/index.ts`)
- Register new concrete screen builders and populate `ScreenFactory` via DI container initialization.

### 2. Feature Module UI Builders (`apps/backend-api/src/modules/`)
- `modules/config/ui/`: `SplashBuilder.ts`, `SettingsBuilder.ts`
- `modules/auth/ui/`: `GuestLoginBuilder.ts`
- `modules/catalog/ui/`: `SearchBuilder.ts`, `CategoryBuilder.ts`, `ServiceListingBuilder.ts`, `ServiceDetailBuilder.ts`
- `modules/vehicle/ui/`: `GarageBuilder.ts`, `VehicleBuilder.ts`
- `modules/customer/ui/`: `AddressBuilder.ts`, `ProfileBuilder.ts`
- `modules/booking/ui/`: `SlotSelectionBuilder.ts`, `BookingConfirmationBuilder.ts`, `ActiveBookingBuilder.ts`, `BookingHistoryBuilder.ts`
- `modules/tracking/ui/`: `BookingTrackingBuilder.ts`
- `modules/invoice/ui/`: `InvoiceBuilder.ts`
- `modules/coupon/ui/`: `CouponBuilder.ts`
- `modules/review/ui/`: `ReviewBuilder.ts`
- `modules/notification/ui/`: `NotificationBuilder.ts`
- `modules/corporate/ui/`: `CorporateBookingBuilder.ts`
- `modules/support/ui/`: `HelpSupportBuilder.ts`

---

## Verification Plan

### Automated Tests
- `pnpm build`: Verify monorepo compilation.
- `pnpm test`: Execute all 41 test suites including existing regression tests.
- `pnpm exec eslint --quiet .`: Verify code cleanliness.
