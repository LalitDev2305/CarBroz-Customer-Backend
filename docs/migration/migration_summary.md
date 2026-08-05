# Milestone 2 — Core Domains Migration Summary

## Executive Overview
Milestone 2 has completed the extraction, structural co-location, and DDD encapsulation of the 8 Core Business Domains into `domains/`:

1. **Identity** (`domains/identity/`): `User`, `UserSession`, `Role`, `Permission`, `RolePermission`, `AdminUserRole`, `PrismaUserRepository`, `PrismaUserSessionRepository`, `PrismaRoleRepository`, `PrismaPermissionRepository`, `PrismaAdminRoleRepository`, `AuthLoginBuilder`, `identity.module.ts`.
2. **Customer Profile** (`domains/customer-profile/`): `CustomerProfile`, `PrismaCustomerProfileRepository`, `customer-profile.module.ts`.
3. **Address** (`domains/address/`): `Address`, `PrismaAddressRepository`, `address.module.ts`.
4. **Partner Profile** (`domains/partner-profile/`): `Partner`, `PartnerMember`, `PartnerProfile`, `PrismaPartnerRepository`, `PrismaPartnerMemberRepository`, `PrismaPartnerProfileRepository`, `partner-profile.module.ts`.
5. **Partner KYC** (`domains/partner-kyc/`): `KycDocument`, `KycDocumentStatus`, `KycDocumentType`, `PrismaKycDocumentRepository`, `partner-kyc.module.ts`.
6. **Catalog** (`domains/catalog/`): `ServiceCategory`, `Service`, `ServiceAddon`, `PrismaCatalogRepository`, `catalog.module.ts`.
7. **Pricing** (`domains/pricing/`): `PricingTier`, `PrismaPricingRepository`, `pricing.module.ts`.
8. **Garage** (`domains/garage/`): `Vehicle`, `VehicleStatus`, `PrismaVehicleRepository`, `garage.module.ts`.

---

## Encapsulation & Boundary Guarantees
- Each domain module exports strictly from `domains/<domain>/public/index.ts`.
- All internal folders (`domain/`, `application/`, `infrastructure/`, `ui/`) remain private within each domain context.
- Full backwards compatibility maintained via `@carbroz/common` and `@carbroz/database`.
