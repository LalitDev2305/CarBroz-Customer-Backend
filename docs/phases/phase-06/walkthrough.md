# Phase 6 Walkthrough: Refactor Auth Module

This walkthrough covers the implementation of Phase 6, which restructures the authentication system into a Clean Architecture setup, conforming strictly to the project's Engineering Standards and Architectural Blueprint.

## 1. Domain Models
We created domain entities in `packages/common/src/domain/`:
- `User.ts`: Represents the `User` aggregate root.
- `UserSession.ts`: Represents active and revoked sessions for a device.

We updated the generic `IRepository` interfaces to properly accommodate complex primary keys or varying ID types (e.g., `IReadRepository<TEntity, TId>`).

## 2. Database & Repositories
The Prisma schema (`packages/database/prisma/schema.prisma`) was updated to include the `User` and `UserSession` models. This included applying a new migration (`20260803001500_phase6`).

We created implementations for these repositories in `packages/database/src/repositories/`:
- `PrismaUserRepository.ts`
- `PrismaUserSessionRepository.ts`

These repositories implement `IUserRepository` and `IUserSessionRepository` from `@carbroz/common`, abstracting Prisma operations away from the application core.

## 3. Application Layer (Use Cases)
We migrated the inline logic from `auth.controller.ts` into isolated, single-responsibility Use Cases located in `apps/backend-api/src/modules/auth/use-cases/`:
- `GuestLoginUseCase.ts`: Handles anonymous user creation.
- `SendOtpUseCase.ts`: Validates phone numbers and orchestrates OTP delivery (mocked).
- `VerifyOtpUseCase.ts`: Validates OTPs and returns authentication tokens.
- `RefreshTokenUseCase.ts`: Generates a new token pair using a valid refresh token.
- `LogoutUseCase.ts`: Revokes active sessions either individually or globally across devices.

## 4. Dependency Injection
All new repositories and use cases were registered in the `awilix` DI container (`apps/backend-api/src/container/index.ts`). The repositories use the `singleton` scope, while the use cases use the `scoped` scope to ensure they are instantiated per request if necessary.

## 5. API Layer
The `AuthController` (`apps/backend-api/src/modules/auth/api/auth.controller.ts`) was completely refactored. It now acts solely as an orchestrator, delegating business logic to the injected use cases and formatting responses using the standard `ResponseHelper`.

## 6. Verification
The implementation was rigorously verified using the following commands:
- `pnpm lint`: Passed.
- `pnpm build`: Passed successfully.
- `pnpm test`: Passed (29 tests across 7 files).
- `pnpm prisma validate`: Schema is valid.
- `pnpm prisma generate`: Client generated successfully.
- `pnpm prisma migrate deploy`: Database successfully updated.
