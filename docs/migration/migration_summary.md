# Milestone 4 — Engagement Domains Migration Summary

Summary of migration for the 7 Engagement Bounded Contexts.

## 1. Migrated Bounded Contexts

| Bounded Context | Package Name | Directory | Domain Artifacts |
|---|---|---|---|
| Notification | `@carbroz/domain-notification` | `domains/notification/` | `NotificationLog`, `DeviceToken`, `NotificationChannel`, `NotificationStatus`, `NotificationPayload`, `PrismaNotificationLogRepository`, `PrismaDeviceTokenRepository` |
| Review | `@carbroz/domain-review` | `domains/review/` | `Review`, `ReviewStatus`, `PrismaReviewRepository` |
| Coupon | `@carbroz/domain-coupon` | `domains/coupon/` | `Coupon`, `CouponUsage`, `DiscountType`, `PrismaCouponRepository`, `PrismaCouponUsageRepository` |
| Dispute | `@carbroz/domain-dispute` | `domains/dispute/` | `Dispute`, `DisputeReason`, `DisputeStatus`, `PrismaDisputeRepository` |
| SDUI Registry | `@carbroz/domain-sdui-registry` | `domains/sdui-registry/` | `SduiScreen`, `SduiTemplate`, `SduiComponent`, `SduiSubcomponent`, `SduiChild`, `SduiChildrenData`, `SduiNodeLevel`, `SduiNodeStatus`, `PrismaSduiRegistryRepository` |
| Audit | `@carbroz/domain-audit` | `domains/audit/` | `AuditLog`, `AuditAction`, `AuditActor`, `PrismaAuditLogRepository` |
| Config | `@carbroz/domain-config` | `domains/config/` | `SystemConfig`, `PrismaConfigRepository` |

---

## 2. Backward Compatibility & Monorepo Integration

- All 7 domain models remain exported via `@carbroz/common` for legacy consumers.
- Container registrations in `apps/backend-api/src/container/index.ts` invoke individual module registers: `registerNotificationModule`, `registerReviewModule`, `registerCouponModule`, `registerDisputeModule`, `registerSduiRegistryModule`, `registerAuditModule`, `registerConfigModule`.
