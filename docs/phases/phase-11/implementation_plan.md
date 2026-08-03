# Phase 11 Implementation Plan: Customer Profile

## Goal
Implement Customer Profile management, customer addresses, and GDPR data extraction.

## Scope
- Prisma models: `CustomerProfile`, `Address`
- Repository Interfaces: `ICustomerProfileRepository`, `IAddressRepository`
- Prisma Repositories implementation
- Use Cases: `GetCustomerProfileUseCase`, `UpdateCustomerProfileUseCase`, `ManageAddressUseCase`, `ExtractCustomerDataUseCase` (GDPR compliance)
- Fastify Controllers: `customer.controller.ts`
- DTOs and Zod Validation: `customer.dto.ts`
- Routes: `/customers/profile`, `/customers/addresses`, `/customers/gdpr`
- Unit Tests
- Swagger/OpenAPI annotations (if applicable)

## Out of Scope
- Order history and Bookings (handled in later phases)
- Payments integration
- SDUI integration

## Files to Create
- `packages/common/src/domain/CustomerProfile.ts`
- `packages/common/src/domain/Address.ts`
- `packages/common/src/domain/repositories/ICustomerProfileRepository.ts`
- `packages/common/src/domain/repositories/IAddressRepository.ts`
- `packages/database/src/repositories/PrismaCustomerProfileRepository.ts`
- `packages/database/src/repositories/PrismaAddressRepository.ts`
- `apps/backend-api/src/modules/customer/use-cases/GetCustomerProfileUseCase.ts`
- `apps/backend-api/src/modules/customer/use-cases/UpdateCustomerProfileUseCase.ts`
- `apps/backend-api/src/modules/customer/use-cases/ManageAddressUseCase.ts`
- `apps/backend-api/src/modules/customer/use-cases/ExtractCustomerDataUseCase.ts`
- `apps/backend-api/src/modules/customer/api/customer.controller.ts`
- `apps/backend-api/src/modules/customer/api/customer.routes.ts`
- `apps/backend-api/src/modules/customer/dtos/customer.dto.ts`
- Tests corresponding to the above.

## Files to Modify
- `packages/database/prisma/schema.prisma` (Add CustomerProfile and Address)
- `packages/database/src/index.ts`
- `packages/common/src/index.ts`
- `apps/backend-api/src/container/index.ts` (Register dependencies)
- `apps/backend-api/src/app.ts` (Register routes)

## Verification Plan
1. Validate Prisma schema (`pnpm prisma validate`).
2. Verify Database migrations successfully apply.
3. Ensure no regression in existing `pnpm test`.
4. Validate Fastify endpoints perform correctly with valid and invalid Zod inputs.

## Risks
- Data modeling for Address may need to account for geocoding logic linking to `GoogleMapsProvider`. We will keep Address flexible enough.
