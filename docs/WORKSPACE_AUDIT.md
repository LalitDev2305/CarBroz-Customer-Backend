# Workspace Audit & Package Inventory

Complete audit of all 35 workspace projects.

## 1. Application Layer (`apps/`)
- `apps/backend-api`: Primary backend HTTP API service.

## 2. Domain Bounded Contexts (`domains/`)
- `domains/identity` (`@carbroz/domain-identity`)
- `domains/customer-profile` (`@carbroz/domain-customer-profile`)
- `domains/address` (`@carbroz/domain-address`)
- `domains/partner-profile` (`@carbroz/domain-partner-profile`)
- `domains/partner-kyc` (`@carbroz/domain-partner-kyc`)
- `domains/catalog` (`@carbroz/domain-catalog`)
- `domains/pricing` (`@carbroz/domain-pricing`)
- `domains/garage` (`@carbroz/domain-garage`)
- `domains/booking` (`@carbroz/domain-booking`)
- `domains/tracking` (`@carbroz/domain-tracking`)
- `domains/payment` (`@carbroz/domain-payment`)
- `domains/invoice` (`@carbroz/domain-invoice`)
- `domains/payout` (`@carbroz/domain-payout`)
- `domains/notification` (`@carbroz/domain-notification`)
- `domains/review` (`@carbroz/domain-review`)
- `domains/coupon` (`@carbroz/domain-coupon`)
- `domains/dispute` (`@carbroz/domain-dispute`)
- `domains/sdui-registry` (`@carbroz/domain-sdui-registry`)
- `domains/audit` (`@carbroz/domain-audit`)
- `domains/config` (`@carbroz/domain-config`)

## 3. Platform Layer (`platform/` & `packages/`)
- `packages/database` (`@carbroz/database`)
- `platform/cache` (`@carbroz/cache`)
- `platform/queue` (`@carbroz/queue`)
- `platform/storage` (`@carbroz/storage`)
- `platform/event-bus` (`@carbroz/event-bus`)
- `packages/common` (`@carbroz/common`)
- `packages/config` (`@carbroz/config`)
- `packages/logger` (`@carbroz/logger`)
- `packages/feature-flags` (`@carbroz/feature-flags`)
- `packages/ui-sdk` (`@carbroz/ui-sdk`)

## 4. Shared Foundation Layer (`shared/`)
- `shared/kernel` (`@carbroz/shared-kernel`)
- `shared/ui-sdk` (`@carbroz/shared-ui-sdk`)
