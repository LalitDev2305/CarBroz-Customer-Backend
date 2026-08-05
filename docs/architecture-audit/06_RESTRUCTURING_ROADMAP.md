# 06 — Safe Restructuring Roadmap

## Phased Refactoring Strategy

To maintain continuous buildability, test pass rate, and zero downtime, the restructuring is divided into 4 safe, independent milestones:

### Milestone 1: Domain Internal Folder Alignment (`packages/common/src/domain/`)
- **Goal**: Group root entity files (`Address.ts`, `CustomerProfile.ts`, `Partner.ts`, `Service.ts`, etc.) and repository interfaces into bounded context subdirectories (`domain/customer/`, `domain/partner/`, `domain/catalog/`).
- **Safety**: Update barrel exports in `packages/common/src/index.ts` so all external consumers in `apps/backend-api` and `packages/database` continue importing from `@carbroz/common` without breaking changes.

### Milestone 2: Backend Feature Module Folder Standardization (`apps/backend-api/src/modules/`)
- **Goal**: Ensure every module in `apps/backend-api/src/modules/` follows the canonical 5-layer layout (`dtos/`, `use-cases/`, `controllers/`, `routes/`, `ui/`).
- **Safety**: Move controller and route files cleanly inside their respective feature module directories.

### Milestone 3: Modular Awilix DI Container Split
- **Goal**: Split monolithic `apps/backend-api/src/container/index.ts` into modular registrators (`auth.container.ts`, `booking.container.ts`, `catalog.container.ts`, `corporate.container.ts`).
- **Safety**: Re-export combined Cradle in `container/index.ts` to maintain Awilix type safety.

### Milestone 4: Verification & Automated Rule Enforcement
- **Goal**: Execute `pnpm build`, `pnpm test`, and `pnpm exec eslint --quiet .` after each milestone. Add optional ESLint boundary rules to prevent direct cross-module internal imports.
