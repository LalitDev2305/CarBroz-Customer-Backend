# Bounded Context Domain Ownership Matrix

Detailed ownership table for all 20 domain packages in `domains/`.

| Bounded Context | Package Name | Path | Key Models | Primary Repository |
|---|---|---|---|---|
| Identity | `@carbroz/domain-identity` | `domains/identity/` | `User`, `UserSession`, `Role`, `Permission`, `AdminUserRole` | `PrismaUserRepository`, `PrismaRoleRepository`, `PrismaPermissionRepository` |
| Customer Profile | `@carbroz/domain-customer-profile` | `domains/customer-profile/` | `CustomerProfile` | `PrismaCustomerProfileRepository` |
| Address | `@carbroz/domain-address` | `domains/address/` | `Address` | `PrismaAddressRepository` |
| Partner Profile | `@carbroz/domain-partner-profile` | `domains/partner-profile/` | `Partner`, `PartnerMember`, `PartnerProfile` | `PrismaPartnerProfileRepository`, `PrismaPartnerMemberRepository` |
| Partner KYC | `@carbroz/domain-partner-kyc` | `domains/partner-kyc/` | `KycDocument` | `PrismaKycDocumentRepository` |
| Catalog | `@carbroz/domain-catalog` | `domains/catalog/` | `Service`, `ServiceCategory`, `ServiceAddon` | `PrismaCatalogRepository` |
| Pricing | `@carbroz/domain-pricing` | `domains/pricing/` | `PricingTier` | `PrismaPricingRepository` |
| Garage | `@carbroz/domain-garage` | `domains/garage/` | `Vehicle` | `PrismaVehicleRepository` |
| Booking | `@carbroz/domain-booking` | `domains/booking/` | `Booking` | `PrismaBookingRepository` |
| Tracking | `@carbroz/domain-tracking` | `domains/tracking/` | `TrackingSession` | `PrismaTrackingSessionRepository` |
| Payment | `@carbroz/domain-payment` | `domains/payment/` | `Payment`, `PaymentMethod`, `PaymentWebhook` | `PrismaPaymentRepository` |
| Invoice | `@carbroz/domain-invoice` | `domains/invoice/` | `Invoice`, `InvoiceLineItem` | `PrismaInvoiceRepository` |
| Payout | `@carbroz/domain-payout` | `domains/payout/` | `PartnerPayout`, `PayoutBatch` | `PrismaPartnerPayoutRepository` |
| Notification | `@carbroz/domain-notification` | `domains/notification/` | `NotificationLog`, `DeviceToken` | `PrismaNotificationLogRepository`, `PrismaDeviceTokenRepository` |
| Review | `@carbroz/domain-review` | `domains/review/` | `Review` | `PrismaReviewRepository` |
| Coupon | `@carbroz/domain-coupon` | `domains/coupon/` | `Coupon`, `CouponUsage` | `PrismaCouponRepository`, `PrismaCouponUsageRepository` |
| Dispute | `@carbroz/domain-dispute` | `domains/dispute/` | `Dispute` | `PrismaDisputeRepository` |
| SDUI Registry | `@carbroz/domain-sdui-registry` | `domains/sdui-registry/` | `SduiScreen`, `SduiTemplate`, `SduiComponent` | `PrismaSduiRegistryRepository` |
| Audit | `@carbroz/domain-audit` | `domains/audit/` | `AuditLog` | `PrismaAuditLogRepository` |
| Config | `@carbroz/domain-config` | `domains/config/` | `SystemConfig` | `PrismaConfigRepository` |
