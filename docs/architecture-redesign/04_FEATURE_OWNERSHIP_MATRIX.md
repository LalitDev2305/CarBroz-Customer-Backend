# 04 — Feature Ownership Matrix & Bounded Context Map

## Executive Summary
This document maps every business capability in CarBroz to its single, authoritative feature owner directory.

---

## Complete Feature Matrix

| Business Capability | Feature Folder | Owned Domain Models | Owned Use Cases | Owned Delivery Controllers | Owned SDUI Builders |
|---|---|---|---|---|---|
| **Identity & Auth** | `features/auth/` | `User`, `UserSession`, `Role`, `Permission` | `SendOtp`, `VerifyOtp`, `RefreshJwt`, `Logout` | `AuthController`, `AdminRbacController` | `AuthLoginBuilder`, `AuthOtpBuilder`, `GuestLoginBuilder` |
| **Customer Profile** | `features/customer/` | `CustomerProfile`, `Address` | `GetProfile`, `UpdateProfile`, `ManageAddress` | `CustomerController`, `AddressController` | `ProfileBuilder`, `AddressBuilder` |
| **Partner Onboarding**| `features/partner/` | `Partner`, `PartnerProfile`, `KycDocument` | `RegisterPartner`, `UploadKyc`, `VerifyPartner` | `PartnerController`, `AdminPartnerController` | `PartnerDashboardBuilder` |
| **Service Catalog** | `features/catalog/` | `Service`, `ServiceCategory`, `ServiceAddon`, `PricingTier` | `BrowseCatalog`, `CalculatePricing`, `ManageService` | `CatalogController`, `AdminCatalogController` | `SearchBuilder`, `CategoryBuilder`, `ServiceDetailBuilder` |
| **Garage & Vehicles** | `features/vehicle/` | `Vehicle`, `CustomerVehicle` | `AddVehicle`, `ListVehicles`, `SetDefaultVehicle` | `VehicleController` | `GarageBuilder`, `VehicleBuilder` |
| **Booking Engine** | `features/booking/` | `Booking`, `BookingStatus`, `Slot` | `CreateBooking`, `ConfirmBooking`, `AssignPartner`, `CancelBooking` | `BookingController`, `PartnerBookingController`, `AdminBookingController` | `SlotSelectionBuilder`, `BookingConfirmationBuilder`, `ActiveBookingBuilder`, `BookingHistoryBuilder` |
| **Live Tracking** | `features/tracking/` | `TrackingSession`, `Coordinates` | `StartTrackingSession`, `PingLocation`, `GetSession` | `TrackingController` | `BookingTrackingBuilder` |
| **Payment Gateway** | `features/payment/` | `Payment`, `Transaction` | `CreatePaymentOrder`, `ProcessRazorpayWebhook` | `PaymentController` | `PaymentOptionBuilder` |
| **GST Tax Invoicing** | `features/invoice/` | `Invoice`, `InvoiceLine` | `GenerateInvoice`, `GetInvoice` | `InvoiceController` | `InvoiceBuilder` |
| **Partner Payouts** | `features/payout/` | `PartnerPayout` | `BatchPartnerPayouts`, `MarkPayoutCompleted` | `PartnerPayoutController`, `AdminPayoutController` | `PayoutSummaryBuilder` |
| **Notifications** | `features/notification/` | `NotificationLog`, `DeviceToken` | `SendPushNotification`, `RegisterDeviceToken` | `NotificationController` | `NotificationInboxBuilder` |
| **Reviews & Ratings**| `features/review/` | `Review`, `PartnerRating` | `SubmitReview`, `ListPartnerReviews` | `ReviewController` | `ReviewBuilder` |
| **Promo Coupons** | `features/coupon/` | `Coupon`, `CouponUsage` | `ValidateCoupon`, `ApplyCoupon` | `CouponController` | `CouponBuilder` |
| **Disputes & SLA** | `features/dispute/` | `Dispute`, `Refund` | `RaiseDispute`, `ResolveDispute` | `DisputeController`, `AdminDisputeController` | `DisputeDetailBuilder` |
| **Corporate B2B** | `features/corporate/` | `CorporateAccount`, `CorporateMember`, `CorporateFleetVehicle`, `CorporateCreditLedger`, `CorporateInvoice` | `RegisterCorporate`, `EnrollFleet`, `IssueMonthlyInvoice`, `ReconcilePayment` | `CorporateController`, `AdminCorporateController` | `CorporateBookingBuilder` |
| **SDUI Engine** | `features/sdui/` | `SduiScreen`, `SduiComponent` | `GetSduiScreen`, `PublishScreenVersion` | `CustomerSduiController`, `AdminSduiController` | Orchestrator & Registry |
| **Audit Logging** | `features/audit/` | `AuditLog` | `LogAuditEvent`, `ListAuditLogs` | `AdminAuditController` | N/A |
| **App Configuration**| `features/config/` | `SystemConfig` | `GetInitConfig` | `ConfigController` | `SplashBuilder`, `SettingsBuilder` |
