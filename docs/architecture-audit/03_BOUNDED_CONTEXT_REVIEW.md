# 03 — Bounded Context & Domain Isolation Review

## 1. Audit of 20 Core Bounded Contexts

| Bounded Context | Current Location (Domain) | Current Location (Backend API) | Target Recommendation |
|---|---|---|---|
| **Identity & Auth** | `common/src/domain/User.ts`, `Role.ts` | `backend-api/src/modules/auth/` | `modules/auth/` |
| **Customer** | `common/src/domain/CustomerProfile.ts` | `backend-api/src/modules/customer/` | `modules/customer/` |
| **Address** | `common/src/domain/Address.ts` | `backend-api/src/modules/customer/` | `modules/location/` (or `customer/address`) |
| **Vehicle & Garage** | `common/src/domain/vehicle/` | `backend-api/src/modules/vehicle/` | `modules/vehicle/` |
| **Partner & Onboarding**| `common/src/domain/Partner.ts`, `KycDocument.ts` | `backend-api/src/modules/partner/`, `kyc/` | `modules/partner/` |
| **Catalog & Services** | `common/src/domain/Service.ts`, `ServiceCategory.ts` | `backend-api/src/modules/catalog/` | `modules/catalog/` |
| **Pricing** | `common/src/domain/PricingTier.ts` | `backend-api/src/modules/catalog/` | `modules/pricing/` (or `catalog/pricing`) |
| **Booking Engine** | `common/src/domain/booking/` | `backend-api/src/modules/booking/` | `modules/booking/` |
| **Payment & Checkout** | `common/src/domain/payment/` | `backend-api/src/modules/payment/` | `modules/payment/` |
| **Invoice & Billing** | `common/src/domain/invoice/` | `backend-api/src/modules/invoice/` | `modules/billing/` (or `invoice`) |
| **Partner Payout** | `common/src/domain/payout/` | `backend-api/src/modules/payout/` | `modules/payout/` |
| **Tracking & Location** | `common/src/domain/location/` | `backend-api/src/modules/tracking/` | `modules/tracking/` |
| **Notifications** | `common/src/domain/notification/` | `backend-api/src/modules/notification/` | `modules/notification/` |
| **Reviews & Ratings** | `common/src/domain/review/` | `backend-api/src/modules/review/` | `modules/review/` |
| **Coupons & Offers** | `common/src/domain/coupon/` | `backend-api/src/modules/coupon/` | `modules/coupon/` |
| **Audit Logging** | `common/src/domain/audit/` | `backend-api/src/modules/config/` (or global) | `modules/audit/` |
| **Dispute & Refund** | `common/src/domain/dispute/` | `backend-api/src/modules/dispute/` | `modules/dispute/` |
| **Corporate B2B** | `common/src/domain/corporate/` | `backend-api/src/modules/corporate/` | `modules/corporate/` |
| **SDUI Engine** | `common/src/domain/sdui/`, `@carbroz/ui-sdk` | `backend-api/src/modules/sdui/` | `modules/sdui/` |
| **System Config & Flags**| `common/src/domain/config/`, `@carbroz/config` | `backend-api/src/modules/config/` | `modules/config/` |

---

## 2. Address Bounded Context Deep-Dive

### Current State:
- `Address.ts` entity is located at `packages/common/src/domain/Address.ts`.
- `AddressSnapshot` value object is located at `packages/common/src/domain/value-objects/AddressSnapshot.ts`.
- `IAddressRepository.ts` contract is located at `packages/common/src/domain/repositories/IAddressRepository.ts`.
- `PrismaAddressRepository.ts` is located at `packages/database/src/repositories/PrismaAddressRepository.ts`.
- Address use cases and controllers are located at `apps/backend-api/src/modules/customer/use-cases/ManageAddressUseCase.ts`.

### Recommendation for Address:
- **Decision**: Keep Address as a **Submodule of Customer Bounded Context** (`modules/customer/address/` or `domain/customer/Address.ts`).
- **Rationale**: Address is tightly coupled to Customer profile ownership in CarBroz. Booking uses an immutable `AddressSnapshot` value object to freeze the delivery location at checkout time, preventing customer profile updates from altering past booking history. Creating a separate npm package for Address would create unnecessary package proliferation.
