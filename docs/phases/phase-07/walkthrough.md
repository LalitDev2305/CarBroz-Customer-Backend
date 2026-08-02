# Phase 7: Admin RBAC Walkthrough

## What was Changed
- **Schema Additions**: Added `Role`, `Permission`, `RolePermission`, and `AdminUserRole` to `packages/database/prisma/schema.prisma`. Updated `User` model to include `isAdmin`.
- **Domain Models & Repositories**: Created `Role`, `Permission`, `RolePermission`, and `AdminUserRole` interfaces in `@carbroz/common`. Defined `IRoleRepository`, `IPermissionRepository`, and `IAdminRoleRepository`.
- **Database Repositories**: Implemented Prisma repositories for roles and permissions in `@carbroz/database`.
- **Authorization Provider**: Created `AuthorizationProvider` in `apps/backend-api/src/providers/` to manage permission resolution and roles checking. It fulfills `IAuthorizationProvider` from `@carbroz/common`.
- **Fastify Plugins**: Added `authorization.plugin.ts` providing decorators like `requirePermission`, `requireAnyPermission`, and `requireAllPermissions` for granular route-level access control.
- **Dependency Injection**: Registered new repositories and `AuthorizationProvider` in the central Awilix container.
- **Seed Data**: Populated default roles (SUPER_ADMIN, OPERATIONS_ADMIN, SUPPORT_ADMIN) and default system permissions in `packages/database/prisma/seed.ts`.

## How to Test
1. Make sure to authenticate and retrieve a valid JWT.
2. Use the fastify route decorators (`app.requirePermission('users.manage')`) on any endpoint.
3. Accessing the endpoint with a JWT belonging to an AdminUser linked to the `SUPER_ADMIN` role will grant access. Accessing it with a generic user will throw a `403 Forbidden`.
