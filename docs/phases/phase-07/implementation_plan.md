# Phase 7 Implementation Plan: Admin RBAC (Role-Based Access Control)

## Goal Description
Implement the complete Role-Based Access Control (RBAC) foundation for the Admin Platform. This phase establishes authorization across all protected APIs using Roles, Permissions, and Policy-based access while preserving Clean Architecture, Repository Pattern, Provider Pattern, and DI standards.

## User Review Required

> [!WARNING]
> Please confirm that the initial RBAC scope will include only platform administration (Admin Users, Roles, Permissions, and Role-Permission mapping). Customer and Partner authorization will continue using existing authentication and will be integrated with RBAC in later phases.

## Open Questions
- Is `packages/auth/src/providers/AuthorizationProvider.ts` supposed to be in a new `@carbroz/auth` package or inside `packages/common/src/providers/` or `apps/backend-api/src/`? The prompt mentions `packages/auth`, but we currently have `packages/common`, `packages/config`, `packages/database`, `packages/feature-flags` etc. I will assume we should create a new `packages/auth` or place it in the appropriate existing package. Please confirm if a new package `@carbroz/auth` should be initialized, or if it should reside elsewhere.

## Proposed Changes

### 1. Database Schema
#### [MODIFY] packages/database/prisma/schema.prisma
Add models for `Role`, `Permission`, `RolePermission`, and `AdminUserRole`. Update the `User` model to include `isAdmin` and a relation to `AdminUserRole`.

### 2. Common Domain Layer
#### [NEW] packages/common/src/domain/Role.ts
#### [NEW] packages/common/src/domain/Permission.ts
#### [NEW] packages/common/src/domain/RolePermission.ts
#### [NEW] packages/common/src/domain/AdminUserRole.ts
#### [NEW] packages/common/src/domain/repositories/IRoleRepository.ts
#### [NEW] packages/common/src/domain/repositories/IPermissionRepository.ts
#### [NEW] packages/common/src/domain/repositories/IAdminRoleRepository.ts
#### [NEW] packages/common/src/providers/IAuthorizationProvider.ts
#### [MODIFY] packages/common/src/index.ts
Export all new domain models, repository interfaces, and provider interfaces.

### 3. Database Layer
#### [NEW] packages/database/src/repositories/PrismaRoleRepository.ts
#### [NEW] packages/database/src/repositories/PrismaPermissionRepository.ts
#### [NEW] packages/database/src/repositories/PrismaAdminRoleRepository.ts
#### [MODIFY] packages/database/src/index.ts
Export the new repository implementations.

### 4. Provider Layer
#### [NEW] packages/auth/src/providers/AuthorizationProvider.ts
(Assuming a new `packages/auth` package or adjusting based on feedback). Implements `IAuthorizationProvider` with methods `hasPermission`, `hasAnyPermission`, `hasAllPermissions`, and `getRoles`. Includes internal caching.

### 5. Authorization Middleware & Helpers
#### [NEW] apps/backend-api/src/plugins/authorization.plugin.ts
Fastify plugin to resolve user permissions, attach authorization context, and reject unauthorized requests.
#### [NEW] apps/backend-api/src/modules/auth/api/auth.decorators.ts (or similar)
Fastify route decorators/helpers: `requirePermission()`, `requireAnyPermission()`, `requireAllPermissions()`.

### 6. Seed Data
#### [MODIFY] packages/database/prisma/seed.ts
Insert default system roles (Super Admin, Operations Admin, Support Admin) and default permissions. Assign all to Super Admin.

### 7. Dependency Injection
#### [MODIFY] apps/backend-api/src/container/index.ts
Register new repositories and `AuthorizationProvider` in Awilix.

### 8. Testing
#### [NEW] Unit and Integration Tests
Add tests for `AuthorizationProvider`, repositories, and protected endpoint access.

## Verification Plan
### Automated Tests
Run sequentially:
- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `pnpm prisma validate`
- `pnpm prisma generate`
- `pnpm prisma migrate dev` (or `migrate deploy` if a migration is pre-generated)

### Manual Verification
Ensure endpoints protected by `requirePermission()` correctly return `403 Forbidden` for unauthorized requests and `200 OK` for authorized ones.
