# Core Business Domains Migration Inventory — Milestone 2

Complete file-by-file inventory and target placement mapping for the 8 Core Business Domains.

## 1. Identity Domain (`domains/identity/`)

| File / Component | Current Source Location | Target Location | Migration Action |
|---|---|---|---|
| Domain Model: User | `packages/common/src/domain/User.ts` | `domains/identity/domain/User.ts` | Relocate & re-export |
| Domain Model: UserSession | `packages/common/src/domain/UserSession.ts` | `domains/identity/domain/UserSession.ts` | Relocate & re-export |
| Domain Model: Role | `packages/common/src/domain/Role.ts` | `domains/identity/domain/Role.ts` | Relocate & re-export |
| Domain Model: Permission | `packages/common/src/domain/Permission.ts` | `domains/identity/domain/Permission.ts` | Relocate & re-export |
| Repository: PrismaUserRepository | `packages/database/src/repositories/PrismaUserRepository.ts` | `domains/identity/infrastructure/repositories/PrismaUserRepository.ts` | Relocate |
| Repository: PrismaUserSessionRepository | `packages/database/src/repositories/PrismaUserSessionRepository.ts` | `domains/identity/infrastructure/repositories/PrismaUserSessionRepository.ts` | Relocate |
| Use Cases: Auth & Guest Login | `apps/backend-api/src/modules/auth/use-cases/` | `domains/identity/application/use-cases/` | Relocate |
| SDUI Builder: AuthLoginBuilder | `apps/backend-api/src/modules/auth/ui/AuthLoginBuilder.ts` | `domains/identity/ui/AuthLoginBuilder.ts` | Relocate |
| Module Registration | New | `domains/identity/identity.module.ts` | Create Awilix DI module |
| Public Barrel Export | New | `domains/identity/public/index.ts` | Create Public API export |

---

## 2. Customer Profile Domain (`domains/customer-profile/`)

| File / Component | Current Source Location | Target Location | Migration Action |
|---|---|---|---|
| Domain Model: CustomerProfile | `packages/common/src/domain/CustomerProfile.ts` | `domains/customer-profile/domain/CustomerProfile.ts` | Relocate & re-export |
| Repository: PrismaCustomerProfileRepository | `packages/database/src/repositories/PrismaCustomerProfileRepository.ts` | `domains/customer-profile/infrastructure/repositories/PrismaCustomerProfileRepository.ts` | Relocate |
| Use Cases: CustomerProfileUseCases | `apps/backend-api/src/modules/customer/use-cases/` | `domains/customer-profile/application/use-cases/` | Relocate |
| Module Registration | New | `domains/customer-profile/customer-profile.module.ts` | Create Awilix DI module |
| Public Barrel Export | New | `domains/customer-profile/public/index.ts` | Create Public API export |

---

## 3. Address Domain (`domains/address/`)

| File / Component | Current Source Location | Target Location | Migration Action |
|---|---|---|---|
| Domain Model: Address | `packages/common/src/domain/Address.ts` | `domains/address/domain/Address.ts` | Relocate & re-export |
| Repository: PrismaAddressRepository | `packages/database/src/repositories/PrismaAddressRepository.ts` | `domains/address/infrastructure/repositories/PrismaAddressRepository.ts` | Relocate |
| Module Registration | New | `domains/address/address.module.ts` | Create Awilix DI module |
| Public Barrel Export | New | `domains/address/public/index.ts` | Create Public API export |

---

## 4. Partner Profile & KYC Domains (`domains/partner-profile/`, `domains/partner-kyc/`)

| File / Component | Current Source Location | Target Location | Migration Action |
|---|---|---|---|
| Domain Model: Partner | `packages/common/src/domain/Partner.ts` | `domains/partner-profile/domain/Partner.ts` | Relocate & re-export |
| Domain Model: PartnerMember | `packages/common/src/domain/PartnerMember.ts` | `domains/partner-profile/domain/PartnerMember.ts` | Relocate & re-export |
| Domain Model: PartnerProfile | `packages/common/src/domain/PartnerProfile.ts` | `domains/partner-profile/domain/PartnerProfile.ts` | Relocate & re-export |
| Repository: PrismaPartnerRepository | `packages/database/src/repositories/PrismaPartnerRepository.ts` | `domains/partner-profile/infrastructure/repositories/PrismaPartnerRepository.ts` | Relocate |
| Domain Model: KycDocument | `packages/common/src/domain/KycDocument.ts` | `domains/partner-kyc/domain/KycDocument.ts` | Relocate & re-export |
| Repository: PrismaKycDocumentRepository | `packages/database/src/repositories/PrismaKycDocumentRepository.ts` | `domains/partner-kyc/infrastructure/repositories/PrismaKycDocumentRepository.ts` | Relocate |
| Use Case: UploadKycDocumentUseCase | `apps/backend-api/src/modules/partner/use-cases/UploadKycDocumentUseCase.ts` | `domains/partner-kyc/application/use-cases/UploadKycDocumentUseCase.ts` | Relocate |

---

## 5. Catalog & Pricing Domains (`domains/catalog/`, `domains/pricing/`)

| File / Component | Current Source Location | Target Location | Migration Action |
|---|---|---|---|
| Domain Model: ServiceCategory | `packages/common/src/domain/ServiceCategory.ts` | `domains/catalog/domain/ServiceCategory.ts` | Relocate & re-export |
| Domain Model: Service | `packages/common/src/domain/Service.ts` | `domains/catalog/domain/Service.ts` | Relocate & re-export |
| Domain Model: ServiceAddon | `packages/common/src/domain/ServiceAddon.ts` | `domains/catalog/domain/ServiceAddon.ts` | Relocate & re-export |
| Repository: PrismaCatalogRepository | `packages/database/src/repositories/PrismaCatalogRepository.ts` | `domains/catalog/infrastructure/repositories/PrismaCatalogRepository.ts` | Relocate |
| Domain Model: PricingTier | `packages/common/src/domain/PricingTier.ts` | `domains/pricing/domain/PricingTier.ts` | Relocate & re-export |
| Repository: PrismaPricingRepository | `packages/database/src/repositories/PrismaPricingRepository.ts` | `domains/pricing/infrastructure/repositories/PrismaPricingRepository.ts` | Relocate |

---

## 6. Garage (Vehicle) Domain (`domains/garage/`)

| File / Component | Current Source Location | Target Location | Migration Action |
|---|---|---|---|
| Domain Model: Vehicle | `packages/common/src/domain/vehicle/Vehicle.ts` | `domains/garage/domain/Vehicle.ts` | Relocate & re-export |
| Enum: VehicleStatus | `packages/common/src/domain/vehicle/VehicleStatus.ts` | `domains/garage/domain/VehicleStatus.ts` | Relocate & re-export |
| Repository: PrismaVehicleRepository | `packages/database/src/repositories/PrismaVehicleRepository.ts` | `domains/garage/infrastructure/repositories/PrismaVehicleRepository.ts` | Relocate |
| Use Cases: VehicleUseCases | `apps/backend-api/src/modules/vehicle/use-cases/` | `domains/garage/application/use-cases/` | Relocate |
