# Milestone 5 — Batch Execution Plan

Sequential batch execution plan for Milestone 5 (Legacy Pruning & Final Stabilization).

## Batch 5.1 — Legacy Database Repositories Pruning
- **Scope**: Remove obsolete duplicate repository implementations from `packages/database/src/repositories/` that have been fully migrated into domain packages (`domains/*/infrastructure/repositories/`).
- **Files**: Delete `PrismaAddressRepository.ts`, `PrismaBookingRepository.ts`, `PrismaCatalogRepository.ts`, `PrismaCustomerProfileRepository.ts`, `PrismaPartnerProfileRepository.ts`, `PrismaKycDocumentRepository.ts`, `PrismaPricingRepository.ts`, `PrismaVehicleRepository.ts`, `PrismaTrackingSessionRepository.ts`, `PrismaPaymentRepository.ts`, `PrismaInvoiceRepository.ts`, `PrismaPartnerPayoutRepository.ts`, `PrismaNotificationLogRepository.ts`, `PrismaDeviceTokenRepository.ts`, `PrismaReviewRepository.ts`, `PrismaCouponRepository.ts`, `PrismaCouponUsageRepository.ts`, `PrismaDisputeRepository.ts`, `PrismaSduiRegistryRepository.ts`, `PrismaAuditLogRepository.ts`, `PrismaConfigRepository.ts`.
- **Validation**: `pnpm -r build; pnpm test; pnpm lint`

---

## Batch 5.2 — Final Compatibility & Import Verification
- **Scope**: Audit all imports across `apps/backend-api` to ensure all domain models and repositories reference `@carbroz/domain-*` public barrels or re-exports in `@carbroz/common`.
- **Validation**: `pnpm -r build; pnpm test; pnpm lint`

---

## Batch 5.3 — Final Workspace Stabilization & Documentation
- **Scope**: Update `docs/PROJECT_STATUS.md`, `walkthrough.md`, `validation_report.md`, and `migration_summary.md` to reflect complete enterprise migration.
- **Validation**: `pnpm -r build; pnpm test; pnpm lint`
