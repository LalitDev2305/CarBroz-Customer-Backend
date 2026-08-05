# 03 — Package and Bounded Context Audit

---

## 1. Monorepo Package Analysis

### Active Packages to Retain
1. `apps/backend-api`: Delivery layer & application assembly.
2. `packages/common`: Unified domain entities, bounded contexts (`sdui`, `user`, `partner`, `catalog`), repository interfaces.
3. `packages/database`: Prisma persistence engine, migrations, repository implementations.
4. `packages/ui-sdk`: SDUI frontend/SDK components, builders, serializers.
5. `packages/config`: Type-safe environment management.
6. `packages/feature-flags`: Dynamic feature flag provider.
7. `packages/logger`: Monorepo logging abstraction.

### Unused / Shell Packages Recommended for Deletion
- `packages/cache` (0 source files)
- `packages/events` (0 source files)
- `packages/messaging` (0 source files)
- `packages/observability` (0 source files)
- `packages/performance` (0 source files)
- `packages/types` (Duplicate of `packages/common`)
- `packages/validation` (Duplicate of `packages/common` Zod schemas)

---

## 2. Bounded Context Structure

All core domain bounded contexts are grouped in `packages/common/src/domain/`:
- `sdui/`: `SduiScreen`, `SduiTemplate`, `SduiComponent`, `SduiSubcomponent`, `SduiChild`, `SduiChildrenData`, `ISduiRegistryRepository`.
- `user/`: `User`, `UserSession`, `Role`, `Permission`, `IUserRepository`.
- `partner/`: `Partner`, `PartnerProfile`, `KycDocument`, `IPartnerRepository`.
- `customer/`: `CustomerProfile`, `Address`, `ICustomerProfileRepository`.
- `catalog/`: `ServiceCategory`, `Service`, `ServiceAddon`, `PricingTier`, `ICatalogRepository`.
