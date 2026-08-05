# Milestone 4 — Source-to-Target Migration Inventory Matrix

Detailed migration matrix for the 7 Engagement Bounded Contexts.

| Domain | Source Model File | Target Location | Target Package | Repositories / DI Registrations |
|---|---|---|---|---|
| Notification | `packages/common/src/domain/notification/*` | `domains/notification/domain/` | `@carbroz/domain-notification` | `PrismaNotificationLogRepository`, `PrismaDeviceTokenRepository`, `registerNotificationModule` |
| Review | `packages/common/src/domain/review/*` | `domains/review/domain/` | `@carbroz/domain-review` | `PrismaReviewRepository`, `registerReviewModule` |
| Coupon | `packages/common/src/domain/coupon/*` | `domains/coupon/domain/` | `@carbroz/domain-coupon` | `PrismaCouponRepository`, `PrismaCouponUsageRepository`, `registerCouponModule` |
| Dispute | `packages/common/src/domain/dispute/*` | `domains/dispute/domain/` | `@carbroz/domain-dispute` | `PrismaDisputeRepository`, `registerDisputeModule` |
| SDUI Registry | `packages/common/src/domain/sdui/*` | `domains/sdui-registry/domain/` | `@carbroz/domain-sdui-registry` | `PrismaSduiRegistryRepository`, `registerSduiRegistryModule` |
| Audit | `packages/common/src/domain/audit/*` | `domains/audit/domain/` | `@carbroz/domain-audit` | `PrismaAuditLogRepository`, `registerAuditModule` |
| Config | `packages/common/src/domain/config/*` | `domains/config/domain/` | `@carbroz/domain-config` | `PrismaConfigRepository`, `registerConfigModule` |

---

## Backward Compatibility Facades

1. Export facades in `@carbroz/common` will remain unchanged to prevent breaking legacy application use cases.
2. Applications (`apps/backend-api`) will resolve domain modules via Awilix container registrations.
