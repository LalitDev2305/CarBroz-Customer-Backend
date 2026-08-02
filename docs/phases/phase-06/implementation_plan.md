# Phase 6 Implementation Plan

## Goal Description
Refactor the MVP `auth.controller.ts` into a Clean Architecture structure. Implement the "Guest User / Skip Login" flow, allowing users to browse the SDUI without authenticating, by mapping their `deviceId` to a guest session.

## User Review Required
> [!WARNING]
> The current `schema.prisma` contains an infrastructural `User` and `RefreshToken` model. To support guest flows and the existing MVP logic, we need to add `phoneNumber`, `isGuest`, and a `UserSession` model to track devices. Please confirm if modifying the Prisma schema to accommodate these business fields is approved for this phase.

## Proposed Changes

### 1. Database Schema
#### [MODIFY] [schema.prisma](file:///d:/Backend/CarBroz/backend/packages/database/prisma/schema.prisma)
- **User Model**: Add `phoneNumber String? @unique` and `isGuest Boolean @default(false)`.
- **UserSession Model**: Create new model mapping `userId`, `deviceId`, `deviceModel`, `osVersion`, `fcmToken`, `isRevoked`, `lastActiveAt`, and relations to `RefreshToken`.

### 2. Common Domain & Interfaces (`@carbroz/common`)
#### [NEW] [User.ts](file:///d:/Backend/CarBroz/backend/packages/common/src/domain/User.ts)
#### [NEW] [UserSession.ts](file:///d:/Backend/CarBroz/backend/packages/common/src/domain/UserSession.ts)
#### [NEW] [IUserRepository.ts](file:///d:/Backend/CarBroz/backend/packages/common/src/domain/repositories/IUserRepository.ts)
#### [NEW] [IUserSessionRepository.ts](file:///d:/Backend/CarBroz/backend/packages/common/src/domain/repositories/IUserSessionRepository.ts)

### 3. Data Persistence (`@carbroz/database`)
#### [NEW] [PrismaUserRepository.ts](file:///d:/Backend/CarBroz/backend/packages/database/src/repositories/PrismaUserRepository.ts)
#### [NEW] [PrismaUserSessionRepository.ts](file:///d:/Backend/CarBroz/backend/packages/database/src/repositories/PrismaUserSessionRepository.ts)
- Bind these to Awilix DI in the database factory.

### 4. Application Layer: Use Cases
#### [NEW] [SendOtpUseCase.ts](file:///d:/Backend/CarBroz/backend/apps/backend-api/src/modules/auth/use-cases/SendOtpUseCase.ts)
#### [NEW] [VerifyOtpUseCase.ts](file:///d:/Backend/CarBroz/backend/apps/backend-api/src/modules/auth/use-cases/VerifyOtpUseCase.ts)
#### [NEW] [GuestLoginUseCase.ts](file:///d:/Backend/CarBroz/backend/apps/backend-api/src/modules/auth/use-cases/GuestLoginUseCase.ts)
#### [NEW] [RefreshTokenUseCase.ts](file:///d:/Backend/CarBroz/backend/apps/backend-api/src/modules/auth/use-cases/RefreshTokenUseCase.ts)
#### [NEW] [LogoutUseCase.ts](file:///d:/Backend/CarBroz/backend/apps/backend-api/src/modules/auth/use-cases/LogoutUseCase.ts)

### 5. API Delivery Layer
#### [MODIFY] [auth.controller.ts](file:///d:/Backend/CarBroz/backend/apps/backend-api/src/modules/auth/api/auth.controller.ts)
- Strip all direct Prisma access.
- Inject UseCases from the Awilix container.
#### [NEW] [auth.dto.ts](file:///d:/Backend/CarBroz/backend/apps/backend-api/src/modules/auth/dtos/auth.dto.ts)
- Zod schemas for `GuestLogin`, `SendOtp`, `VerifyOtp`, `RefreshToken`.
#### [MODIFY] [auth.routes.ts](file:///d:/Backend/CarBroz/backend/apps/backend-api/src/modules/auth/api/auth.routes.ts)
- Register new `/guest` route.

## Verification Plan

### Automated Tests
- Unit tests for all UseCases using mocked repositories.
- Integration test for `POST /api/v1/auth/guest` returning a valid JWT for an unauthenticated device.

### Manual Verification
- Re-run `pnpm prisma validate` and `pnpm prisma generate` after modifying `schema.prisma`.
- Verify the server starts and the MVP hack in `auth.controller.ts` is fully eradicated.
