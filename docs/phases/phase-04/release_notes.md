# Phase 4 Release Notes

## Features Added
- **Config API Endpoint**: Added `GET /v1/config/init` endpoint for fetching startup configurations, maintenance status, and mandatory update versions.
- **Dynamic Configuration Layer**: Introduced `SystemConfig` database entity and domain logic to power remote config updates.
- **Feature Flag Layer**: Introduced `FeatureFlag` database entity and domain logic for granular, robust feature toggling.

## Technical Enhancements
- **Dependency Injection**: Restructured the DI container to utilize `@fastify/awilix` globally using `CLASSIC` injection mode. This ensures all modules resolve properly based on constructor parameter names and standardizes our approach.
- **Provider Architecture**: Implemented robust `ConfigProvider` and `FeatureFlagProvider` using proper repository isolation.

## Breaking Changes
- N/A

## Deployment Instructions
- The database schema has been updated. Apply the Prisma migration before launching the API: `pnpm prisma migrate deploy`.
