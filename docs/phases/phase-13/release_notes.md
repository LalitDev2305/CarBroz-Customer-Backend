# Phase 13 Release Notes — SDUI Core Engine Relocation & Database-Backed SDUI Registry

## Summary

Phase 13 establishes the official, production-ready Server-Driven UI (SDUI) composition and registry foundation for the CarBroz platform. It resolves architectural ownership by establishing `@carbroz/ui-sdk` as the single reusable owner of the SDUI composition engine, while introducing dynamic database-backed template and component layout management.

## Key Changes

### Part A — Core SDUI Engine Relocation (`packages/ui-sdk`)
- **Package Creation**: Created `@carbroz/ui-sdk` package in monorepo with ZERO external dependencies on backend apps, Fastify, or Prisma.
- **Engine Ownership**: Moved `ScreenFactory`, `IScreenBuilder`, `BaseScreenBuilder`, `JsonSerializer`, `ui.models.ts`, base components, sections, templates, and `UI` DSL helpers into `packages/ui-sdk`.
- **Builder Modularization**: Relocated concrete screen builders to their respective feature modules:
  - `AuthLoginBuilder` & `AuthOtpBuilder` → `apps/backend-api/src/modules/auth/ui/`
  - `DashboardBuilder` → `apps/backend-api/src/modules/config/ui/`
- **Legacy Cleanup**: Removed all legacy duplicate SDUI files from `apps/backend-api/src/ui/`.

### Part B — Database-Backed SDUI Registry (`@carbroz/database` & `backend-api`)
- **Prisma Schema**: Added `SduiScreen`, `SduiTemplate`, and `SduiComponentRegistry` models to `schema.prisma`.
- **Domain Layer**: Created `SduiScreenEntity`, `SduiTemplateEntity`, `SduiComponentRegistryEntity` and `ISduiRegistryRepository` in `@carbroz/common`.
- **Persistence Layer**: Implemented `PrismaSduiRegistryRepository` in `@carbroz/database`.
- **Use Cases**:
  - `GetSduiScreenUseCase`: Resolves published DB layout -> validates against locked SDUI contract -> falls back to static screen builder (`ScreenFactory`) -> validates contract -> returns.
  - `RegisterSduiComponentUseCase`: Registers reusable UI components with schema definitions for admin/CMS control.
  - `UpdateSduiScreenLayoutUseCase`: Publishes dynamic layout JSON overrides for target apps.
- **API Controllers & Routes**:
  - Customer API: `GET /api/v1/sdui/registry/:screenId`
  - Admin API: `POST /api/v1/admin/sdui/components`, `PUT /api/v1/admin/sdui/screens`
- **DI Registration**: Registered `sduiRegistryRepository`, `screenFactory`, and all SDUI Use Cases in Awilix container.

## Verification & Testing
- `pnpm prisma validate` & `pnpm prisma generate`: PASS
- `pnpm lint`: PASS (0 errors, 271 warnings)
- `pnpm build`: PASS (All workspace projects compiled successfully)
- `pnpm test`: PASS (19 test files, 74/74 tests passing)
