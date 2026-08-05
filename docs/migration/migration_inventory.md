# Milestone 5 — Migration Inventory & File Disposition

Complete file-level inventory for Milestone 5 (Legacy Pruning & Final Stabilization).

## 1. Domain Model Dispositions (`packages/common/src/domain/`)

| Legacy Path | Authoritative Package Path | Action | Rationale |
|---|---|---|---|
| `packages/common/src/domain/Address.ts` | `domains/address/domain/Address.ts` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/CustomerProfile.ts` | `domains/customer-profile/domain/CustomerProfile.ts` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/KycDocument.ts` | `domains/partner-kyc/domain/KycDocument.ts` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/Partner.ts` | `domains/partner-profile/domain/Partner.ts` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/Service.ts` | `domains/catalog/domain/Service.ts` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/PricingTier.ts` | `domains/pricing/domain/PricingTier.ts` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/booking/*` | `domains/booking/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/tracking/*` | `domains/tracking/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/payment/*` | `domains/payment/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/invoice/*` | `domains/invoice/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/payout/*` | `domains/payout/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/notification/*` | `domains/notification/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/review/*` | `domains/review/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/coupon/*` | `domains/coupon/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/dispute/*` | `domains/dispute/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/sdui/*` | `domains/sdui-registry/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/audit/*` | `domains/audit/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |
| `packages/common/src/domain/config/*` | `domains/config/domain/*` | **REEXPORT** | Retained as backward compatibility export via `@carbroz/common` |

---

## 2. Platform Infrastructure Repositories (`packages/database/src/repositories/`)

| File Path | Authoritative Location | Action | Rationale |
|---|---|---|---|
| `packages/database/src/repositories/PrismaAddressRepository.ts` | `domains/address/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaBookingRepository.ts` | `domains/booking/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaCatalogRepository.ts` | `domains/catalog/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaCustomerProfileRepository.ts` | `domains/customer-profile/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaPartnerProfileRepository.ts` | `domains/partner-profile/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaKycDocumentRepository.ts` | `domains/partner-kyc/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaPricingRepository.ts` | `domains/pricing/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaVehicleRepository.ts` | `domains/garage/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaTrackingSessionRepository.ts` | `domains/tracking/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaPaymentRepository.ts` | `domains/payment/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaInvoiceRepository.ts` | `domains/invoice/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaPartnerPayoutRepository.ts` | `domains/payout/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaNotificationLogRepository.ts` | `domains/notification/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaDeviceTokenRepository.ts` | `domains/notification/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaReviewRepository.ts` | `domains/review/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaCouponRepository.ts` | `domains/coupon/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaCouponUsageRepository.ts` | `domains/coupon/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaDisputeRepository.ts` | `domains/dispute/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaSduiRegistryRepository.ts` | `domains/sdui-registry/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaAuditLogRepository.ts` | `domains/audit/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaConfigRepository.ts` | `domains/config/infrastructure/repositories/` | **REMOVE** | Replaced by domain package repository |
| `packages/database/src/repositories/PrismaUserRepository.ts` | `domains/identity/infrastructure/repositories/` | **KEEP** | Core platform database repository |
| `packages/database/src/repositories/PrismaRoleRepository.ts` | `domains/identity/infrastructure/repositories/` | **KEEP** | Core platform database repository |
| `packages/database/src/repositories/PrismaPermissionRepository.ts` | `domains/identity/infrastructure/repositories/` | **KEEP** | Core platform database repository |
| `packages/database/src/repositories/PrismaRepositoryBase.ts` | `platform/database/src/repositories/` | **KEEP** | Platform base repository class |

---

## 3. Authoritative Workspace Ownership Table

- **Platform Pillar**: `platform/database`, `platform/cache`, `platform/queue`, `platform/storage`, `platform/event-bus`.
- **Shared Pillar**: `shared/kernel`, `shared/ui-sdk`.
- **Domains Pillar**: All 20 domain packages in `domains/`.
- **Apps Pillar**: `apps/backend-api`, `apps/admin-api`.
