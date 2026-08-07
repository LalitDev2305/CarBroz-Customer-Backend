import { asClass, asFunction } from 'awilix';
import { diContainer } from '@fastify/awilix';
import { PrismaProvider, PrismaDatabaseProvider, PrismaTransactionProvider, RepositoryFactory, PrismaConfigRepository, PrismaFeatureFlagRepository, PrismaUserRepository, PrismaUserSessionRepository, PrismaRoleRepository, PrismaPermissionRepository, PrismaAdminRoleRepository } from '@carbroz/platform-database';
import { ConfigProvider } from '@carbroz/config';
import { FeatureFlagProvider } from '@carbroz/platform-feature-flags';
import { AuthorizationProvider } from '../providers/AuthorizationProvider.js';
import { GuestLoginUseCase } from '../modules/auth/use-cases/GuestLoginUseCase.js';
import { SendOtpUseCase } from '../modules/auth/use-cases/SendOtpUseCase.js';
import { VerifyOtpUseCase } from '../modules/auth/use-cases/VerifyOtpUseCase.js';
import { RefreshTokenUseCase } from '../modules/auth/use-cases/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../modules/auth/use-cases/LogoutUseCase.js';
// Milestone 3 Transactional Domain Modules
import { registerBookingModule } from '@carbroz/domain-booking';
import { registerTrackingModule } from '@carbroz/domain-tracking';
import { registerPaymentModule } from '@carbroz/domain-payment';
import { registerInvoiceModule } from '@carbroz/domain-invoice';
import { registerPayoutModule } from '@carbroz/domain-payout';
// Milestone 4 Engagement Domain Modules
import { registerNotificationModule } from '@carbroz/domain-notification';
import { registerReviewModule } from '@carbroz/domain-review';
import { registerCouponModule } from '@carbroz/domain-coupon';
import { registerDisputeModule } from '@carbroz/domain-dispute';
import { registerSduiRegistryModule } from '@carbroz/domain-sdui-registry';
import { registerAuditModule } from '@carbroz/domain-audit';
import { registerConfigModule } from '@carbroz/domain-config';
// Phase 8
import { PrismaPartnerRepository, PrismaPartnerMemberRepository } from '@carbroz/platform-database';
import { RegisterIndividualPartnerUseCase } from '../modules/partner/use-cases/RegisterIndividualPartnerUseCase.js';
import { RegisterOrganizationPartnerUseCase } from '../modules/partner/use-cases/RegisterOrganizationPartnerUseCase.js';
import { GetPartnerProfileUseCase } from '../modules/partner/use-cases/GetPartnerProfileUseCase.js';
import { VerifyPartnerUseCase } from '../modules/partner/use-cases/VerifyPartnerUseCase.js';
import { PartnerController } from '../modules/partner/api/partner.controller.js';
import { AdminPartnerController } from '../modules/admin/api/admin-partner.controller.js';
// Phase 9
import { GoogleMapsProvider } from '../providers/maps/GoogleMapsProvider.js';
import { GeocodeAddressUseCase } from '../modules/maps/use-cases/GeocodeAddressUseCase.js';
import { ReverseGeocodeUseCase } from '../modules/maps/use-cases/ReverseGeocodeUseCase.js';
import { CalculateDistanceUseCase } from '../modules/maps/use-cases/CalculateDistanceUseCase.js';
// Phase 10
import { PrismaPartnerProfileRepository, PrismaKycDocumentRepository } from '@carbroz/platform-database';
import { MinIOStorageProvider } from '@carbroz/platform-storage';
import { UploadKycDocumentUseCase } from '../modules/partner/use-cases/UploadKycDocumentUseCase.js';
import { GetPartnerKycStatusUseCase } from '../modules/partner/use-cases/GetPartnerKycStatusUseCase.js';
import { AdminReviewKycDocumentUseCase } from '../modules/admin/use-cases/AdminReviewKycDocumentUseCase.js';
import { KycController } from '../modules/partner/api/kyc.controller.js';
import { AdminKycController } from '../modules/admin/api/admin-kyc.controller.js';
import { LoggerProvider } from '../providers/LoggerProvider.js';
// Phase 11
import { PrismaCustomerProfileRepository, PrismaAddressRepository } from '@carbroz/platform-database';
import { GetCustomerProfileUseCase } from '../modules/customer/use-cases/GetCustomerProfileUseCase.js';
import { UpdateCustomerProfileUseCase } from '../modules/customer/use-cases/UpdateCustomerProfileUseCase.js';
import { ManageAddressUseCase } from '../modules/customer/use-cases/ManageAddressUseCase.js';
import { ExtractCustomerDataUseCase } from '../modules/customer/use-cases/ExtractCustomerDataUseCase.js';
// Phase 12
import { PrismaCatalogRepository, PrismaPricingRepository } from '@carbroz/platform-database';
import { GetCatalogUseCase } from '../modules/catalog/use-cases/GetCatalogUseCase.js';
import { CalculateServicePriceUseCase } from '../modules/catalog/use-cases/CalculateServicePriceUseCase.js';
import { ManageCatalogUseCase } from '../modules/catalog/use-cases/ManageCatalogUseCase.js';
import { ManagePricingTierUseCase } from '../modules/catalog/use-cases/ManagePricingTierUseCase.js';
// Phase 13 & SDUI Bounded Context
import { PrismaSduiRegistryRepository } from '@carbroz/platform-database';
import { ScreenFactory } from '@carbroz/ui-sdk';
import { AuthLoginBuilder } from '../modules/auth/ui/AuthLoginBuilder.js';
import { AuthOtpBuilder } from '../modules/auth/ui/AuthOtpBuilder.js';
import { DashboardBuilder } from '../modules/config/ui/DashboardBuilder.js';
import { GetSduiScreenUseCase } from '../modules/sdui/use-cases/GetSduiScreenUseCase.js';
import { CreateSduiComponentUseCase } from '../modules/sdui/use-cases/CreateSduiComponentUseCase.js';
import { CreateSduiSubcomponentUseCase } from '../modules/sdui/use-cases/CreateSduiSubcomponentUseCase.js';
import { CreateSduiChildUseCase } from '../modules/sdui/use-cases/CreateSduiChildUseCase.js';
import { CreateSduiChildrenDataUseCase } from '../modules/sdui/use-cases/CreateSduiChildrenDataUseCase.js';
import { UpdateSduiScreenLayoutUseCase } from '../modules/sdui/use-cases/UpdateSduiScreenLayoutUseCase.js';
// Phase 14
import { CreateSduiDraftUseCase } from '../modules/sdui/use-cases/CreateSduiDraftUseCase.js';
import { UpdateSduiDraftUseCase } from '../modules/sdui/use-cases/UpdateSduiDraftUseCase.js';
import { PublishSduiVersionUseCase } from '../modules/sdui/use-cases/PublishSduiVersionUseCase.js';
import { ArchiveSduiVersionUseCase } from '../modules/sdui/use-cases/ArchiveSduiVersionUseCase.js';
import { RollbackSduiVersionUseCase } from '../modules/sdui/use-cases/RollbackSduiVersionUseCase.js';
import { GetSduiVersionHistoryUseCase } from '../modules/sdui/use-cases/GetSduiVersionHistoryUseCase.js';
import { GetSduiSpecificVersionUseCase } from '../modules/sdui/use-cases/GetSduiSpecificVersionUseCase.js';
import { CompareSduiVersionsUseCase } from '../modules/sdui/use-cases/CompareSduiVersionsUseCase.js';
// Phase 16 Vehicle & Booking Engine
import { PrismaVehicleRepository, PrismaBookingRepository } from '@carbroz/platform-database';
import { CreateVehicleUseCase } from '../modules/vehicle/use-cases/CreateVehicleUseCase.js';
import { ListCustomerVehiclesUseCase } from '../modules/vehicle/use-cases/ListCustomerVehiclesUseCase.js';
import { SetDefaultVehicleUseCase } from '../modules/vehicle/use-cases/SetDefaultVehicleUseCase.js';
import { ArchiveVehicleUseCase } from '../modules/vehicle/use-cases/ArchiveVehicleUseCase.js';
import { VehicleController } from '../modules/vehicle/api/vehicle.controller.js';
import { CreateBookingUseCase } from '../modules/booking/use-cases/CreateBookingUseCase.js';
import { ConfirmBookingUseCase } from '../modules/booking/use-cases/ConfirmBookingUseCase.js';
import { AssignPartnerToBookingUseCase } from '../modules/booking/use-cases/AssignPartnerToBookingUseCase.js';
import { TransitionBookingStatusUseCase } from '../modules/booking/use-cases/TransitionBookingStatusUseCase.js';
import { CancelBookingUseCase } from '../modules/booking/use-cases/CancelBookingUseCase.js';
import { ExpirePendingBookingsUseCase } from '../modules/booking/use-cases/ExpirePendingBookingsUseCase.js';
import { BookingController } from '../modules/booking/api/booking.controller.js';
// Phase 17 Payment, Invoice & Payout Engine
import { PrismaPaymentRepository, PrismaInvoiceRepository, PrismaPartnerPayoutRepository, } from '@carbroz/platform-database';
import { RazorpayPaymentGatewayProvider } from '../providers/payment/RazorpayPaymentGatewayProvider.js';
import { CreatePaymentOrderUseCase } from '../modules/payment/use-cases/CreatePaymentOrderUseCase.js';
import { GetPaymentUseCase } from '../modules/payment/use-cases/GetPaymentUseCase.js';
import { ProcessPaymentWebhookUseCase } from '../modules/payment/use-cases/ProcessPaymentWebhookUseCase.js';
import { GenerateInvoiceUseCase } from '../modules/invoice/use-cases/GenerateInvoiceUseCase.js';
import { GetInvoiceUseCase } from '../modules/invoice/use-cases/GetInvoiceUseCase.js';
import { CreatePayoutEligibilityUseCase } from '../modules/payout/use-cases/CreatePayoutEligibilityUseCase.js';
import { ListPartnerPayoutsUseCase } from '../modules/payout/use-cases/ListPartnerPayoutsUseCase.js';
import { ProcessPayoutBatchUseCase } from '../modules/payout/use-cases/ProcessPayoutBatchUseCase.js';
import { MarkPayoutPaidUseCase } from '../modules/payout/use-cases/MarkPayoutPaidUseCase.js';
import { PaymentController } from '../modules/payment/api/payment.controller.js';
import { PayoutController } from '../modules/payout/api/payout.controller.js';
import { PrismaTrackingSessionRepository } from '@carbroz/platform-database';
import { PrismaNotificationLogRepository } from '@carbroz/platform-database';
import { PrismaDeviceTokenRepository } from '@carbroz/platform-database';
import { FirebasePushProvider } from '../providers/notification/FirebasePushProvider.js';
import { Msg91SmsProvider } from '../providers/notification/Msg91SmsProvider.js';
import { ResendEmailProvider } from '../providers/notification/ResendEmailProvider.js';
import { MultiChannelNotificationProvider } from '@carbroz/platform-notification';
import { NotificationService } from '@carbroz/common';
import { StartTrackingSessionUseCase } from '../modules/tracking/use-cases/StartTrackingSessionUseCase.js';
import { UpdateLocationPingUseCase } from '../modules/tracking/use-cases/UpdateLocationPingUseCase.js';
import { GetCurrentTrackingUseCase } from '../modules/tracking/use-cases/GetCurrentTrackingUseCase.js';
import { EndTrackingSessionUseCase } from '../modules/tracking/use-cases/EndTrackingSessionUseCase.js';
import { RegisterDeviceTokenUseCase } from '../modules/notification/use-cases/RegisterDeviceTokenUseCase.js';
import { DeactivateDeviceTokenUseCase } from '../modules/notification/use-cases/DeactivateDeviceTokenUseCase.js';
import { SendNotificationUseCase } from '../modules/notification/use-cases/SendNotificationUseCase.js';
import { ListNotificationHistoryUseCase } from '../modules/notification/use-cases/ListNotificationHistoryUseCase.js';
// Phase 19 Customer Reviews, Partner Ratings & Promo Coupon Engine
import { PrismaReviewRepository, PrismaCouponRepository, PrismaCouponUsageRepository, } from '@carbroz/platform-database';
import { PartnerRatingCalculator, CouponDiscountCalculator } from '@carbroz/common';
import { SubmitReviewUseCase } from '../modules/review/use-cases/SubmitReviewUseCase.js';
import { ModerateReviewUseCase } from '../modules/review/use-cases/ModerateReviewUseCase.js';
import { GetPartnerReviewsUseCase } from '../modules/review/use-cases/GetPartnerReviewsUseCase.js';
import { CreateCouponUseCase } from '../modules/coupon/use-cases/CreateCouponUseCase.js';
import { UpdateCouponUseCase } from '../modules/coupon/use-cases/UpdateCouponUseCase.js';
import { ArchiveCouponUseCase } from '../modules/coupon/use-cases/ArchiveCouponUseCase.js';
import { ValidateCouponUseCase } from '../modules/coupon/use-cases/ValidateCouponUseCase.js';
import { ApplyCouponUseCase } from '../modules/coupon/use-cases/ApplyCouponUseCase.js';
import { ListCouponsUseCase } from '../modules/coupon/use-cases/ListCouponsUseCase.js';
// Phase 20 Production Hardening, Audit Logging & Error Codes
import { PrismaAuditLogRepository } from '@carbroz/platform-database';
import { AuditLogService } from '@carbroz/common';
// Phase 21 Booking Dispute Settlement & SLA Refund Engine
import { PrismaDisputeRepository } from '@carbroz/platform-database';
import { DisputeSettlementCalculator } from '@carbroz/common';
import { RaiseDisputeUseCase } from '../modules/dispute/use-cases/RaiseDisputeUseCase.js';
import { ResolveDisputeUseCase } from '../modules/dispute/use-cases/ResolveDisputeUseCase.js';
import { GetDisputeUseCase } from '../modules/dispute/use-cases/GetDisputeUseCase.js';
import { ListDisputesUseCase } from '../modules/dispute/use-cases/ListDisputesUseCase.js';
// Phase 22 Multi-Tenant Corporate Accounts, Fleet Management & B2B Billing Platform
import { PrismaCorporateAccountRepository, PrismaCorporateMemberRepository, PrismaCorporateFleetVehicleRepository, PrismaCorporateCreditLedgerRepository, PrismaCorporateInvoiceRepository, } from '@carbroz/platform-database';
import { RegisterCorporateAccountUseCase } from '../modules/corporate/use-cases/RegisterCorporateAccountUseCase.js';
import { ApproveCorporateAccountUseCase } from '../modules/corporate/use-cases/ApproveCorporateAccountUseCase.js';
import { AdjustCreditLimitUseCase } from '../modules/corporate/use-cases/AdjustCreditLimitUseCase.js';
import { AddCorporateMemberUseCase } from '../modules/corporate/use-cases/AddCorporateMemberUseCase.js';
import { RemoveCorporateMemberUseCase } from '../modules/corporate/use-cases/RemoveCorporateMemberUseCase.js';
import { EnrollFleetVehicleUseCase } from '../modules/corporate/use-cases/EnrollFleetVehicleUseCase.js';
import { RemoveFleetVehicleUseCase } from '../modules/corporate/use-cases/RemoveFleetVehicleUseCase.js';
import { ValidateCorporateBookingUseCase } from '../modules/corporate/use-cases/ValidateCorporateBookingUseCase.js';
import { GenerateCorporateInvoiceUseCase } from '../modules/corporate/use-cases/GenerateCorporateInvoiceUseCase.js';
import { ReconcileCorporatePaymentUseCase } from '../modules/corporate/use-cases/ReconcileCorporatePaymentUseCase.js';
import { CorporateController } from '../modules/corporate/controllers/CorporateController.js';
import { AdminCorporateController } from '../modules/corporate/controllers/AdminCorporateController.js';
let isRegistered = false;
export function getContainer() {
    if (!isRegistered) {
        diContainer.register({
            prismaProvider: asClass(PrismaProvider).classic().singleton(),
            databaseProvider: asClass(PrismaDatabaseProvider).classic().singleton(),
            transactionProvider: asClass(PrismaTransactionProvider).classic().singleton(),
            repositoryFactory: asClass(RepositoryFactory).classic().singleton(),
            // Phase 4
            configRepository: asClass(PrismaConfigRepository).classic().singleton(),
            featureFlagRepository: asClass(PrismaFeatureFlagRepository).classic().singleton(),
            configProvider: asClass(ConfigProvider).classic().singleton(),
            featureFlagProvider: asClass(FeatureFlagProvider).classic().singleton(),
            // Phase 6 & 7
            userRepository: asClass(PrismaUserRepository).classic().singleton(),
            userSessionRepository: asClass(PrismaUserSessionRepository).classic().singleton(),
            roleRepository: asClass(PrismaRoleRepository).classic().singleton(),
            permissionRepository: asClass(PrismaPermissionRepository).classic().singleton(),
            adminRoleRepository: asClass(PrismaAdminRoleRepository).classic().singleton(),
            authorizationProvider: asClass(AuthorizationProvider).classic().singleton(),
            guestLoginUseCase: asClass(GuestLoginUseCase).classic().scoped(),
            sendOtpUseCase: asClass(SendOtpUseCase).classic().scoped(),
            verifyOtpUseCase: asClass(VerifyOtpUseCase).classic().scoped(),
            refreshTokenUseCase: asClass(RefreshTokenUseCase).classic().scoped(),
            logoutUseCase: asClass(LogoutUseCase).classic().scoped(),
            // Phase 8
            partnerRepository: asClass(PrismaPartnerRepository).classic().singleton(),
            partnerMemberRepository: asClass(PrismaPartnerMemberRepository).classic().singleton(),
            registerIndividualPartnerUseCase: asClass(RegisterIndividualPartnerUseCase).classic().scoped(),
            registerOrganizationPartnerUseCase: asClass(RegisterOrganizationPartnerUseCase).classic().scoped(),
            getPartnerProfileUseCase: asClass(GetPartnerProfileUseCase).classic().scoped(),
            verifyPartnerUseCase: asClass(VerifyPartnerUseCase).classic().scoped(),
            partnerController: asClass(PartnerController).classic().scoped(),
            adminPartnerController: asClass(AdminPartnerController).classic().scoped(),
            // Phase 9
            mapsProvider: asClass(GoogleMapsProvider).classic().singleton(),
            geocodeAddressUseCase: asClass(GeocodeAddressUseCase).classic().scoped(),
            reverseGeocodeUseCase: asClass(ReverseGeocodeUseCase).classic().scoped(),
            calculateDistanceUseCase: asClass(CalculateDistanceUseCase).classic().scoped(),
            // Phase 10
            partnerProfileRepository: asClass(PrismaPartnerProfileRepository).classic().singleton(),
            kycDocumentRepository: asClass(PrismaKycDocumentRepository).classic().singleton(),
            storageProvider: asClass(MinIOStorageProvider).classic().singleton(),
            logger: asClass(LoggerProvider).classic().singleton(),
            uploadKycDocumentUseCase: asClass(UploadKycDocumentUseCase).classic().scoped(),
            getPartnerKycStatusUseCase: asClass(GetPartnerKycStatusUseCase).classic().scoped(),
            adminReviewKycDocumentUseCase: asClass(AdminReviewKycDocumentUseCase).classic().scoped(),
            kycController: asClass(KycController).classic().scoped(),
            adminKycController: asClass(AdminKycController).classic().scoped(),
            // Phase 11
            customerProfileRepository: asClass(PrismaCustomerProfileRepository).classic().singleton(),
            addressRepository: asClass(PrismaAddressRepository).classic().singleton(),
            getCustomerProfileUseCase: asClass(GetCustomerProfileUseCase).classic().scoped(),
            updateCustomerProfileUseCase: asClass(UpdateCustomerProfileUseCase).classic().scoped(),
            manageAddressUseCase: asClass(ManageAddressUseCase).classic().scoped(),
            extractCustomerDataUseCase: asClass(ExtractCustomerDataUseCase).classic().scoped(),
            // Phase 12
            catalogRepository: asClass(PrismaCatalogRepository).classic().singleton(),
            pricingRepository: asClass(PrismaPricingRepository).classic().singleton(),
            getCatalogUseCase: asClass(GetCatalogUseCase).classic().scoped(),
            calculateServicePriceUseCase: asClass(CalculateServicePriceUseCase).classic().scoped(),
            manageCatalogUseCase: asClass(ManageCatalogUseCase).classic().scoped(),
            managePricingTierUseCase: asClass(ManagePricingTierUseCase).classic().scoped(),
            // Phase 13 & SDUI Bounded Context
            sduiRegistryRepository: asClass(PrismaSduiRegistryRepository).classic().singleton(),
            screenFactory: asFunction(() => {
                const factory = new ScreenFactory();
                factory.registerBuilders([
                    new AuthLoginBuilder(),
                    new AuthOtpBuilder(),
                    new DashboardBuilder(),
                ]);
                return factory;
            }).singleton(),
            getSduiScreenUseCase: asClass(GetSduiScreenUseCase).classic().scoped(),
            createSduiComponentUseCase: asClass(CreateSduiComponentUseCase).classic().scoped(),
            createSduiSubcomponentUseCase: asClass(CreateSduiSubcomponentUseCase).classic().scoped(),
            createSduiChildUseCase: asClass(CreateSduiChildUseCase).classic().scoped(),
            createSduiChildrenDataUseCase: asClass(CreateSduiChildrenDataUseCase).classic().scoped(),
            registerSduiComponentUseCase: asClass(CreateSduiComponentUseCase).classic().scoped(),
            registerSduiSubcomponentUseCase: asClass(CreateSduiSubcomponentUseCase).classic().scoped(),
            registerSduiChildUseCase: asClass(CreateSduiChildUseCase).classic().scoped(),
            registerSduiChildrenDataUseCase: asClass(CreateSduiChildrenDataUseCase).classic().scoped(),
            updateSduiScreenLayoutUseCase: asClass(UpdateSduiScreenLayoutUseCase).classic().scoped(),
            // Phase 14
            createSduiDraftUseCase: asClass(CreateSduiDraftUseCase).classic().scoped(),
            updateSduiDraftUseCase: asClass(UpdateSduiDraftUseCase).classic().scoped(),
            publishSduiVersionUseCase: asClass(PublishSduiVersionUseCase).classic().scoped(),
            archiveSduiVersionUseCase: asClass(ArchiveSduiVersionUseCase).classic().scoped(),
            rollbackSduiVersionUseCase: asClass(RollbackSduiVersionUseCase).classic().scoped(),
            getSduiVersionHistoryUseCase: asClass(GetSduiVersionHistoryUseCase).classic().scoped(),
            getSduiSpecificVersionUseCase: asClass(GetSduiSpecificVersionUseCase).classic().scoped(),
            compareSduiVersionsUseCase: asClass(CompareSduiVersionsUseCase).classic().scoped(),
            // Phase 16
            vehicleRepository: asClass(PrismaVehicleRepository).classic().singleton(),
            bookingRepository: asClass(PrismaBookingRepository).classic().singleton(),
            createVehicleUseCase: asClass(CreateVehicleUseCase).classic().scoped(),
            listCustomerVehiclesUseCase: asClass(ListCustomerVehiclesUseCase).classic().scoped(),
            setDefaultVehicleUseCase: asClass(SetDefaultVehicleUseCase).classic().scoped(),
            archiveVehicleUseCase: asClass(ArchiveVehicleUseCase).classic().scoped(),
            vehicleController: asClass(VehicleController).classic().scoped(),
            createBookingUseCase: asClass(CreateBookingUseCase).classic().scoped(),
            confirmBookingUseCase: asClass(ConfirmBookingUseCase).classic().scoped(),
            assignPartnerToBookingUseCase: asClass(AssignPartnerToBookingUseCase).classic().scoped(),
            transitionBookingStatusUseCase: asClass(TransitionBookingStatusUseCase).classic().scoped(),
            cancelBookingUseCase: asClass(CancelBookingUseCase).classic().scoped(),
            expirePendingBookingsUseCase: asClass(ExpirePendingBookingsUseCase).classic().scoped(),
            bookingController: asClass(BookingController).classic().scoped(),
            // Phase 17
            paymentRepository: asClass(PrismaPaymentRepository).classic().singleton(),
            invoiceRepository: asClass(PrismaInvoiceRepository).classic().singleton(),
            partnerPayoutRepository: asClass(PrismaPartnerPayoutRepository).classic().singleton(),
            paymentGatewayProvider: asClass(RazorpayPaymentGatewayProvider).classic().singleton(),
            createPaymentOrderUseCase: asClass(CreatePaymentOrderUseCase).classic().scoped(),
            getPaymentUseCase: asClass(GetPaymentUseCase).classic().scoped(),
            processPaymentWebhookUseCase: asClass(ProcessPaymentWebhookUseCase).classic().scoped(),
            generateInvoiceUseCase: asClass(GenerateInvoiceUseCase).classic().scoped(),
            getInvoiceUseCase: asClass(GetInvoiceUseCase).classic().scoped(),
            createPayoutEligibilityUseCase: asClass(CreatePayoutEligibilityUseCase).classic().scoped(),
            listPartnerPayoutsUseCase: asClass(ListPartnerPayoutsUseCase).classic().scoped(),
            processPayoutBatchUseCase: asClass(ProcessPayoutBatchUseCase).classic().scoped(),
            markPayoutPaidUseCase: asClass(MarkPayoutPaidUseCase).classic().scoped(),
            paymentController: asClass(PaymentController).classic().scoped(),
            payoutController: asClass(PayoutController).classic().scoped(),
            // Phase 18
            trackingSessionRepository: asClass(PrismaTrackingSessionRepository).classic().singleton(),
            notificationLogRepository: asClass(PrismaNotificationLogRepository).classic().singleton(),
            deviceTokenRepository: asClass(PrismaDeviceTokenRepository).classic().singleton(),
            pushProvider: asClass(FirebasePushProvider).classic().singleton(),
            smsProvider: asClass(Msg91SmsProvider).classic().singleton(),
            emailProvider: asClass(ResendEmailProvider).classic().singleton(),
            notificationProvider: asClass(MultiChannelNotificationProvider).classic().singleton(),
            notificationService: asClass(NotificationService).classic().scoped(),
            startTrackingSessionUseCase: asClass(StartTrackingSessionUseCase).classic().scoped(),
            updateLocationPingUseCase: asClass(UpdateLocationPingUseCase).classic().scoped(),
            getCurrentTrackingUseCase: asClass(GetCurrentTrackingUseCase).classic().scoped(),
            endTrackingSessionUseCase: asClass(EndTrackingSessionUseCase).classic().scoped(),
            registerDeviceTokenUseCase: asClass(RegisterDeviceTokenUseCase).classic().scoped(),
            deactivateDeviceTokenUseCase: asClass(DeactivateDeviceTokenUseCase).classic().scoped(),
            sendNotificationUseCase: asClass(SendNotificationUseCase).classic().scoped(),
            listNotificationHistoryUseCase: asClass(ListNotificationHistoryUseCase).classic().scoped(),
            // Phase 19
            reviewRepository: asClass(PrismaReviewRepository).classic().singleton(),
            couponRepository: asClass(PrismaCouponRepository).classic().singleton(),
            couponUsageRepository: asClass(PrismaCouponUsageRepository).classic().singleton(),
            partnerRatingCalculator: asClass(PartnerRatingCalculator).classic().scoped(),
            couponDiscountCalculator: asClass(CouponDiscountCalculator).classic().scoped(),
            submitReviewUseCase: asClass(SubmitReviewUseCase).classic().scoped(),
            moderateReviewUseCase: asClass(ModerateReviewUseCase).classic().scoped(),
            getPartnerReviewsUseCase: asClass(GetPartnerReviewsUseCase).classic().scoped(),
            createCouponUseCase: asClass(CreateCouponUseCase).classic().scoped(),
            updateCouponUseCase: asClass(UpdateCouponUseCase).classic().scoped(),
            archiveCouponUseCase: asClass(ArchiveCouponUseCase).classic().scoped(),
            validateCouponUseCase: asClass(ValidateCouponUseCase).classic().scoped(),
            applyCouponUseCase: asClass(ApplyCouponUseCase).classic().scoped(),
            listCouponsUseCase: asClass(ListCouponsUseCase).classic().scoped(),
            // Phase 20
            auditLogRepository: asClass(PrismaAuditLogRepository).classic().singleton(),
            auditLogService: asClass(AuditLogService).classic().scoped(),
            // Phase 21
            disputeRepository: asClass(PrismaDisputeRepository).classic().singleton(),
            disputeSettlementCalculator: asClass(DisputeSettlementCalculator).classic().scoped(),
            raiseDisputeUseCase: asClass(RaiseDisputeUseCase).classic().scoped(),
            resolveDisputeUseCase: asClass(ResolveDisputeUseCase).classic().scoped(),
            getDisputeUseCase: asClass(GetDisputeUseCase).classic().scoped(),
            listDisputesUseCase: asClass(ListDisputesUseCase).classic().scoped(),
            // Phase 22
            corporateAccountRepo: asClass(PrismaCorporateAccountRepository).classic().singleton(),
            corporateMemberRepo: asClass(PrismaCorporateMemberRepository).classic().singleton(),
            fleetVehicleRepo: asClass(PrismaCorporateFleetVehicleRepository).classic().singleton(),
            creditLedgerRepo: asClass(PrismaCorporateCreditLedgerRepository).classic().singleton(),
            corporateInvoiceRepo: asClass(PrismaCorporateInvoiceRepository).classic().singleton(),
            registerAccountUseCase: asClass(RegisterCorporateAccountUseCase).classic().scoped(),
            approveAccountUseCase: asClass(ApproveCorporateAccountUseCase).classic().scoped(),
            adjustCreditLimitUseCase: asClass(AdjustCreditLimitUseCase).classic().scoped(),
            addMemberUseCase: asClass(AddCorporateMemberUseCase).classic().scoped(),
            removeMemberUseCase: asClass(RemoveCorporateMemberUseCase).classic().scoped(),
            enrollFleetVehicleUseCase: asClass(EnrollFleetVehicleUseCase).classic().scoped(),
            removeFleetVehicleUseCase: asClass(RemoveFleetVehicleUseCase).classic().scoped(),
            validateCorporateBookingUseCase: asClass(ValidateCorporateBookingUseCase).classic().scoped(),
            generateCorporateInvoiceUseCase: asClass(GenerateCorporateInvoiceUseCase).classic().scoped(),
            reconcilePaymentUseCase: asClass(ReconcileCorporatePaymentUseCase).classic().scoped(),
            corporateController: asClass(CorporateController).classic().scoped(),
            adminCorporateController: asClass(AdminCorporateController).classic().scoped(),
        });
        registerBookingModule(diContainer);
        registerTrackingModule(diContainer);
        registerPaymentModule(diContainer);
        registerInvoiceModule(diContainer);
        registerPayoutModule(diContainer);
        registerNotificationModule(diContainer);
        registerReviewModule(diContainer);
        registerCouponModule(diContainer);
        registerDisputeModule(diContainer);
        registerSduiRegistryModule(diContainer);
        registerAuditModule(diContainer);
        registerConfigModule(diContainer);
        isRegistered = true;
    }
    return diContainer;
}
//# sourceMappingURL=index.js.map