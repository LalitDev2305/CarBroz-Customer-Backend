# Release Notes: Phase 7 - Admin RBAC

## New Features
- **Admin Roles and Permissions**: The platform now supports assigning multiple Roles to Admin users.
- **Granular Permissions**: System operations are mapped to individual permissions (e.g. `users.manage`, `bookings.manage`).
- **Route-level Security**: Secure endpoints effortlessly using `requirePermission(key)` decorators on Fastify routes.

## Architectural Improvements
- Completely decouples Authorization from Authentication.
- Clean Architecture boundaries preserved: Repositories map data back to abstract Domain models.
- Centralized `AuthorizationProvider` coordinates repository access and executes security checks.

## Bug Fixes
- Addressed CLI limitation with Prisma Dev environment migrations.

## Known Limitations
- The system currently assigns all seeded permissions to `SUPER_ADMIN`. An admin UI must be built to manage other roles natively.
