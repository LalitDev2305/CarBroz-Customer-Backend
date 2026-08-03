# Phase 12 Implementation Plan: Catalog & Pricing Engine

## Objectives
Implement the core Service Catalog (Categories, Services, Add-ons) and Dynamic Pricing Engine (Base pricing, Vehicle Type multipliers, Add-on pricing, Tax/Surcharge calculation).

## Scope
- Prisma models: `ServiceCategory`, `Service`, `ServiceAddon`, `PricingTier`, `VehicleTypeMultiplier`
- Domain Entities: `ServiceCategory`, `Service`, `ServiceAddon`, `PricingTier`
- Repository Interfaces: `ICatalogRepository`, `IPricingRepository`
- Prisma Repositories: `PrismaCatalogRepository`, `PrismaPricingRepository`
- Use Cases:
  - `GetCatalogUseCase`: Fetch active categories, services, and add-ons for customer display.
  - `CalculateServicePriceUseCase`: Dynamically calculate service price based on service ID, vehicle category, location/zone, and selected add-ons.
  - `ManageCatalogUseCase`: Admin endpoints to create, update, and soft-delete categories, services, and add-ons.
  - `ManagePricingTierUseCase`: Admin endpoints to configure base prices and vehicle-type multipliers.
- Fastify Controllers: `catalog.controller.ts`, `admin-catalog.controller.ts`
- DTOs & Zod Schemas: `catalog.dto.ts`
- Routes:
  - `/api/v1/catalog` (Categories, services, price calculation)
  - `/api/v1/admin/catalog` (Catalog management & pricing tiers)
- Dependency Injection: Awilix container registration for all repositories and use cases.
- Unit & Integration Tests.

## Out of Scope
- Time-slot availability engine (Phase 18/20)
- Checkout & Order creation (Phase 21)
- Promo codes & Coupon discounts (Phase 27)
- Payment Gateway processing (Phase 28)

## Files to Create
- `packages/common/src/domain/ServiceCategory.ts`
- `packages/common/src/domain/Service.ts`
- `packages/common/src/domain/ServiceAddon.ts`
- `packages/common/src/domain/PricingTier.ts`
- `packages/common/src/domain/repositories/ICatalogRepository.ts`
- `packages/common/src/domain/repositories/IPricingRepository.ts`
- `packages/database/src/repositories/PrismaCatalogRepository.ts`
- `packages/database/src/repositories/PrismaPricingRepository.ts`
- `apps/backend-api/src/modules/catalog/use-cases/GetCatalogUseCase.ts`
- `apps/backend-api/src/modules/catalog/use-cases/CalculateServicePriceUseCase.ts`
- `apps/backend-api/src/modules/catalog/use-cases/ManageCatalogUseCase.ts`
- `apps/backend-api/src/modules/catalog/use-cases/ManagePricingTierUseCase.ts`
- `apps/backend-api/src/modules/catalog/api/catalog.controller.ts`
- `apps/backend-api/src/modules/catalog/api/catalog.routes.ts`
- `apps/backend-api/src/modules/admin/api/admin-catalog.controller.ts`
- `apps/backend-api/src/modules/admin/api/admin-catalog.routes.ts`
- `apps/backend-api/src/modules/catalog/dtos/catalog.dto.ts`
- Unit tests corresponding to each UseCase and Provider/Repository.

## Files to Modify
- `packages/database/prisma/schema.prisma` (Add `ServiceCategory`, `Service`, `ServiceAddon`, `PricingTier`, `VehicleTypeMultiplier`)
- `packages/database/src/index.ts`
- `packages/common/src/index.ts`
- `apps/backend-api/src/container/index.ts` (Register repositories and use cases)
- `apps/backend-api/src/app.ts` (Register `/api/v1/catalog` and `/api/v1/admin/catalog` routes)
- `docs/PROJECT_STATUS.md`

## Database Changes
- `ServiceCategory`: `id`, `publicId`, `name`, `slug`, `description`, `iconUrl`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`
- `Service`: `id`, `publicId`, `categoryId`, `name`, `slug`, `description`, `imageUrl`, `basePrice`, `estimatedDurationMinutes`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`
- `ServiceAddon`: `id`, `publicId`, `serviceId`, `name`, `description`, `price`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`
- `PricingTier`: `id`, `serviceId`, `vehicleType`, `priceMultiplier`, `flatSurcharge`, `createdAt`, `updatedAt`

## Verification Plan
1. Validate Prisma schema (`pnpm prisma validate`).
2. Generate Prisma client & create migration (`pnpm prisma generate`, `pnpm prisma migrate dev`).
3. Run TypeScript build across all packages (`pnpm build`).
4. Run ESLint checks across workspace (`pnpm lint`).
5. Execute unit and integration test suite (`pnpm test`).

## Risks & Mitigations
- **Complex Pricing Logic**: Dynamic vehicle multipliers and add-ons must be computed accurately without rounding bugs. Handled via cent-based integer currency amounts or precise decimal arithmetic.
