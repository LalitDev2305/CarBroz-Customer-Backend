# Phase 8: Partner Management Implementation Plan

## Goal
Implement the foundation for Partner Management using a future-proof architecture. This phase establishes the core `Partner` and `PartnerMember` entities, enabling individuals and organizations to register as partners, while admins verify and manage partner statuses.

## Scope
1. **Partner & Member Entities**: Introduce the core `Partner` and `PartnerMember` domain models and database schemas.
2. **Registration Flow**: Allow authenticated users to register as an `INDIVIDUAL` or `ORGANIZATION` partner, automatically assigning them the `OWNER` role as a `PartnerMember`.
3. **Profile APIs**: Allow users to fetch their associated partner profile details.
4. **Admin Verification**: Enable administrators with the `partners.manage` permission to verify, suspend, or reject partners.
*(Note: Adding, removing, or inviting employees will be handled in a future phase).*

## Files to Create

### Domain Models
- `packages/common/src/domain/Partner.ts`
- `packages/common/src/domain/PartnerMember.ts`
- `packages/common/src/domain/PartnerType.ts` (Enum: INDIVIDUAL, ORGANIZATION)
- `packages/common/src/domain/PartnerStatus.ts` (Enum: PENDING, ACTIVE, SUSPENDED, REJECTED)
- `packages/common/src/domain/PartnerMemberRole.ts` (Enum: OWNER, MANAGER, SUPERVISOR, EMPLOYEE)
- `packages/common/src/domain/PartnerMemberStatus.ts` (Enum: ACTIVE, INVITED, SUSPENDED)

### Repository Interfaces
- `packages/common/src/domain/repositories/IPartnerRepository.ts`
- `packages/common/src/domain/repositories/IPartnerMemberRepository.ts`

### Repository Implementations
- `packages/database/src/repositories/PrismaPartnerRepository.ts`
- `packages/database/src/repositories/PrismaPartnerMemberRepository.ts`

### Use Cases
- `apps/backend-api/src/modules/partner/use-cases/RegisterIndividualPartnerUseCase.ts`
- `apps/backend-api/src/modules/partner/use-cases/RegisterOrganizationPartnerUseCase.ts`
- `apps/backend-api/src/modules/partner/use-cases/GetPartnerProfileUseCase.ts`
- `apps/backend-api/src/modules/partner/use-cases/VerifyPartnerUseCase.ts`

### API & Validation
- `apps/backend-api/src/modules/partner/dtos/partner.dto.ts`
- `apps/backend-api/src/modules/partner/api/partner.controller.ts`
- `apps/backend-api/src/modules/partner/api/partner.routes.ts`
- `apps/backend-api/src/modules/admin/api/admin-partner.controller.ts`
- `apps/backend-api/src/modules/admin/api/admin-partner.routes.ts`

### Tests
- Use Case unit tests in `apps/backend-api/src/modules/partner/use-cases/`
- Repository tests in `packages/database/tests/`

## Files to Modify

### Database Changes (`packages/database/prisma/schema.prisma`)
- Add `Partner` model:
  - `id` (Int, @id)
  - `publicId` (String, @unique)
  - `businessName` (String)
  - `type` (String) // INDIVIDUAL, ORGANIZATION
  - `status` (String, default: "PENDING")
  - `createdAt`, `updatedAt`, `deletedAt`
- Add `PartnerMember` model:
  - `id` (Int, @id)
  - `publicId` (String, @unique)
  - `userId` (Int)
  - `partnerId` (Int)
  - `role` (String) // OWNER, MANAGER, SUPERVISOR, EMPLOYEE
  - `status` (String, default: "ACTIVE") // ACTIVE, INVITED, SUSPENDED
  - `createdAt`, `updatedAt`
  - Relations to `User` and `Partner`.
  - Unique constraint on `[userId, partnerId]`.
- Update `User` model to include a 1-to-N relation with `PartnerMember`.

### DI Registration (`apps/backend-api/src/container/index.ts`)
- Register `partnerRepository` and `partnerMemberRepository`
- Register the registration, profile fetching, and admin verification Use Cases.

### Database Exports (`packages/database/src/index.ts`)
- Export `PrismaPartnerRepository` and `PrismaPartnerMemberRepository`.

### API Router (`apps/backend-api/src/app.routes.ts` & `app.ts`)
- Mount `/api/v1/partners` and `/api/v1/admin/partners` routes.

### Documentation Updates
- `docs/PROJECT_STATUS.md` (Update Phase 8 to IN_PROGRESS when started)

## API Endpoints

**Partner Endpoints (Requires User Auth)**
- `POST /api/v1/partners/register/individual` - Register as an individual partner.
- `POST /api/v1/partners/register/organization` - Register as an organization partner.
- `GET /api/v1/partners/me` - Get the current user's partner profile.

**Admin Endpoints (Requires Admin Auth & `partners.manage` permission)**
- `POST /api/v1/admin/partners/:id/verify` - Update partner status.

## Verification Plan
1. **Linting & Compilation**: Run `pnpm lint` and `pnpm build`.
2. **Database Integrity**: Run `pnpm prisma validate` and `pnpm prisma generate`. Create and deploy `phase8` migrations manually via SQL diff if non-interactive CLI is blocked.
3. **Automated Testing**: Run `pnpm test` ensuring all Use Case unit tests pass.
4. **Architecture Validation**: Verify that the authentication flow has NOT been altered and employee-specific endpoints (like inviting employees) have NOT been implemented in this phase.

## Risks
- Transactional integrity when registering a partner must be maintained so that the `Partner` and `PartnerMember` (OWNER) are created in a single database transaction.
