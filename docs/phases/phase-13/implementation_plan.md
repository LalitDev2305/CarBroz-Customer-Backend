# Phase 13 Implementation Plan: SDUI Registry

## Objectives
Implement a dynamic, database-backed Server-Driven UI (SDUI) Screen Layout Registry. This enables dynamic layout configuration and resolution across Customer, Partner, and Admin apps without breaking the locked SDUI JSON schema hierarchy.

## Scope
- Prisma models: `SduiScreen`, `SduiComponentRegistry`
- Domain Entities: `SduiScreen`, `SduiComponent`
- Repository Interface: `ISduiRegistryRepository`
- Prisma Repository: `PrismaSduiRegistryRepository`
- Use Cases:
  - `GetSduiScreenUseCase`: Resolves SDUI screen layouts by `screenId`, target app (`CUSTOMER`, `PARTNER`, `ADMIN`), and version, falling back to static screen builders if no DB override exists.
  - `RegisterSduiComponentUseCase`: Admin registration of component definitions into the registry.
  - `UpdateSduiScreenLayoutUseCase`: Admin endpoint to update and publish SDUI JSON layouts.
- Fastify Controllers: `sdui-registry.controller.ts`, `admin-sdui.controller.ts`
- DTOs & Zod Validation: `sdui-registry.dto.ts`
- Routes:
  - `/api/v1/sdui/registry` (Screen layout resolution)
  - `/api/v1/admin/sdui` (Screen layout & component management)
- Dependency Injection: Awilix container registration for all repositories and use cases.
- Unit & Integration Tests.

## Out of Scope
- SDUI layout versioning rules & app version matching engine (Phase 14)
- Dynamic SDUI Localization engine (Phase 15)
- Dynamic media optimization for SDUI assets (Phase 16)

## Files to Create
- `packages/common/src/domain/SduiScreen.ts`
- `packages/common/src/domain/SduiComponent.ts`
- `packages/common/src/domain/repositories/ISduiRegistryRepository.ts`
- `packages/database/src/repositories/PrismaSduiRegistryRepository.ts`
- `apps/backend-api/src/modules/sdui/use-cases/GetSduiScreenUseCase.ts`
- `apps/backend-api/src/modules/sdui/use-cases/RegisterSduiComponentUseCase.ts`
- `apps/backend-api/src/modules/sdui/use-cases/UpdateSduiScreenLayoutUseCase.ts`
- `apps/backend-api/src/modules/sdui/api/sdui-registry.controller.ts`
- `apps/backend-api/src/modules/sdui/api/sdui-registry.routes.ts`
- `apps/backend-api/src/modules/admin/api/admin-sdui.controller.ts`
- `apps/backend-api/src/modules/admin/api/admin-sdui.routes.ts`
- `apps/backend-api/src/modules/sdui/dtos/sdui-registry.dto.ts`
- Unit tests corresponding to the UseCases and Repository.

## Files to Modify
- `packages/database/prisma/schema.prisma` (Add `SduiScreen` and `SduiComponentRegistry`)
- `packages/database/src/index.ts`
- `packages/common/src/index.ts`
- `apps/backend-api/src/container/index.ts` (Register dependencies)
- `apps/backend-api/src/app.ts` (Register `/api/v1/sdui` and `/api/v1/admin/sdui` routes)

## Database Changes
- `SduiScreen`: `id`, `publicId`, `screenId`, `targetApp`, `layoutJson` (Json), `version`, `isPublished`, `createdAt`, `updatedAt`
- `SduiComponentRegistry`: `id`, `publicId`, `name`, `componentType`, `schemaJson` (Json), `createdAt`, `updatedAt`

## Verification Plan
1. Validate Prisma schema (`pnpm prisma validate`).
2. Generate Prisma client & create migration (`pnpm prisma generate`, `pnpm prisma migrate dev`).
3. Run TypeScript build across all packages (`pnpm build`).
4. Run ESLint checks across workspace (`pnpm lint`).
5. Execute unit and integration test suite (`pnpm test`).

## Risks & Mitigations
- **Contract Parity**: The `layoutJson` stored in `SduiScreen` must strictly adhere to the frozen SDUI contract (`screenId`, `templateId`, `templateType`, `template`, `components`, `subcomponents`, `children`, `childrenData`, `theme`). Validated via Zod JSON schema validation before persistence.
