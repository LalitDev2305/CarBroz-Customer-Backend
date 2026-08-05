# 05 — Target Modular Architecture Blueprint

## 1. Evaluation of 3 Package Architecture Options

### OPTION A: Keep Current Packages and Improve Internal Modules
- **Pros**: Zero refactor cost for package manifests; minimum risk of breaking build tools or imports.
- **Cons**: `@carbroz/common` remains a monolithic kernel; domain entity files remain scattered.

### OPTION B: Split by Bounded-Context Packages (`packages/domain-auth`, `packages/domain-booking`, etc.)
- **Pros**: Maximum isolation; independent package publishing.
- **Cons**: High package proliferation (20+ new packages); slow build performance; high refactor cost; complex `tsconfig` project references.

### OPTION C: Hybrid Modular Structure (RECOMMENDED)
- **Structure**:
  - Keep core infrastructure packages (`@carbroz/common`, `@carbroz/database`, `@carbroz/ui-sdk`, `@carbroz/config`, `@carbroz/feature-flags`, `@carbroz/logger`).
  - Standardize `@carbroz/common` internal layout into clean domain bounded context subfolders (`domain/auth/`, `domain/customer/`, `domain/catalog/`, `domain/booking/`, `domain/corporate/`, etc.).
  - Standardize `apps/backend-api` feature modules into consistent 5-layer internal folders (`dtos/`, `use-cases/`, `controllers/`, `routes/`, `ui/`).
- **Pros**: Easy to navigate; zero risk of package proliferation; sub-second build times; clean bounded context boundaries; seamless developer onboarding.

---

## 2. Proposed Target Folder Tree (`apps/backend-api/src/modules/`)

```
apps/backend-api/src/modules/
├── auth/
│   ├── dtos/
│   ├── use-cases/
│   ├── controllers/
│   ├── routes/
│   └── ui/              (AuthLoginBuilder, AuthOtpBuilder, GuestLoginBuilder)
├── booking/
│   ├── dtos/
│   ├── use-cases/
│   ├── controllers/
│   ├── routes/
│   └── ui/              (SlotSelectionBuilder, BookingConfirmationBuilder, ActiveBookingBuilder, BookingHistoryBuilder)
├── catalog/
│   ├── dtos/
│   ├── use-cases/
│   ├── controllers/
│   ├── routes/
│   └── ui/              (SearchBuilder, CategoryBuilder, ServiceListingBuilder, ServiceDetailBuilder)
├── customer/
│   ├── dtos/
│   ├── use-cases/
│   ├── controllers/
│   ├── routes/
│   └── ui/              (AddressBuilder, ProfileBuilder)
├── corporate/
│   ├── dtos/
│   ├── use-cases/
│   ├── controllers/
│   ├── routes/
│   └── ui/              (CorporateBookingBuilder)
... (repeat standardized layout across all 20 feature modules)
```
