# Phase 4 Implementation Plan: Config API & Bootstrap Flow

## Objective
Implement the App Startup API (`GET /v1/config/init`) and the Feature Flags infrastructure in accordance with Phase 4 requirements and strict architectural rules (Modular Monolith, Clean Architecture, Provider/Repository patterns).

## Scope & Components

### 1. Database Schema (`packages/database/prisma/schema.prisma`)
- **SystemConfig**: Store configuration as key/value entries (e.g., `maintenance.enabled`, `android.minVersion`).
- **FeatureFlag**: Model containing `id`, `publicId`, `key` (unique), `enabled` (boolean), `description`, `createdAt`, `updatedAt`, `deletedAt`.

### 2. Common & Domain Interfaces (`packages/common`)
- **Domain Models**: `SystemConfig`, `FeatureFlag`.
- **Repositories**: `IConfigRepository`, `IFeatureFlagRepository`.
- **Providers**: `IConfigProvider`, `IFeatureFlagProvider`.

### 3. Repository Layer (`packages/database`)
- Implement `PrismaConfigRepository` and `PrismaFeatureFlagRepository`.
- Repositories act as the strict persistence bridge; providers cannot access Prisma directly.

### 4. Provider Layer (`packages/config` & `packages/feature-flags`)
- Implement `ConfigProvider` implementing `IConfigProvider` (depends purely on `IConfigRepository`).
- Implement `FeatureFlagProvider` implementing `IFeatureFlagProvider` (depends purely on `IFeatureFlagRepository`).

### 5. Application Layer (`apps/backend-api/src/modules/config`)
- **DTOs**: `InitConfigResponseDto`, `MaintenanceDto`, `ForceUpdateDto`, `FeatureFlagsDto`.
- **UseCase**: `GetInitConfigUseCase` retrieving domain data from Providers.
- **Controller**: `ConfigController` formatting the response correctly (No DB entities exposed).
- **Route**: `GET /v1/config/init`.
- **DI Registration**: Register all Repositories and Providers in the Awilix DI container.

### 6. Database Seeding (`packages/database/prisma/seed.ts`)
- Seed default maintenance settings (`maintenance.enabled`, `maintenance.message`).
- Seed default version settings (`android.minVersion`, `ios.latestVersion`, etc.).
- Seed default feature flags (`wallet`, `subscriptions`).

### 7. Testing
- Implement Repository tests.
- Implement Provider tests.
- Implement Controller / UseCase tests.
- Implement Integration API test.
- Verify seed execution.

## Verification
Execute the following sequentially:
1. `pnpm lint`
2. `pnpm build`
3. `pnpm test`
4. `pnpm prisma validate`
5. `pnpm prisma generate`
6. `pnpm prisma migrate dev`
