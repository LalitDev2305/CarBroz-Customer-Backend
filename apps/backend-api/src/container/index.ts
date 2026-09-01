import { InjectionMode, asClass, AwilixContainer } from 'awilix';
import { diContainer } from '@fastify/awilix';
import {
  PrismaProvider,
  PrismaDatabaseProvider,
  PrismaTransactionProvider,
  RepositoryFactory,
  PrismaConfigRepository,
  PrismaFeatureFlagRepository,
  PrismaUserRepository,
  PrismaUserSessionRepository,
  PrismaRoleRepository,
  PrismaPermissionRepository,
  PrismaAdminRoleRepository
} from '@carbroz/platform-database';
import { ConfigProvider } from '@carbroz/config';
import { FeatureFlagProvider } from '@carbroz/platform-feature-flags';
import { AuthorizationProvider } from '../providers/AuthorizationProvider.js';
import { GuestLoginUseCase } from '../modules/auth/use-cases/GuestLoginUseCase.js';
import { SendOtpUseCase } from '../modules/auth/use-cases/SendOtpUseCase.js';
import { VerifyOtpUseCase } from '../modules/auth/use-cases/VerifyOtpUseCase.js';
import { RefreshTokenUseCase } from '../modules/auth/use-cases/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../modules/auth/use-cases/LogoutUseCase.js';

import { registerBookingModule } from '@carbroz/domain-booking';
import { registerTrackingModule } from '@carbroz/domain-tracking';
import { registerPaymentModule } from '@carbroz/domain-payment';
import { registerInvoiceModule } from '@carbroz/domain-invoice';
import { registerPayoutModule } from '@carbroz/domain-payout';
import { registerNotificationModule } from '@carbroz/domain-notification';
import { registerReviewModule } from '@carbroz/domain-review';
import { registerCouponModule } from '@carbroz/domain-coupon';
import { registerDisputeModule } from '@carbroz/domain-dispute';
import { registerSduiRegistryModule } from '@carbroz/domain-sdui-registry';
import { registerAuditModule } from '@carbroz/domain-audit';
import { registerConfigModule } from '@carbroz/domain-config';

import { PrismaPartnerRepository, PrismaPartnerMemberRepository } from '@carbroz/platform-database';
import { RegisterIndividualPartnerUseCase } from '../modules/partner/use-cases/RegisterIndividualPartnerUseCase.js';
import { RegisterOrganizationPartnerUseCase } from '../modules/partner/use-cases/RegisterOrganizationPartnerUseCase.js';
import { GetPartnerProfileUseCase } from '../modules/partner/use-cases/GetPartnerProfileUseCase.js';
import { VerifyPartnerUseCase } from '../modules/partner/use-cases/VerifyPartnerUseCase.js';
import { PartnerController } from '../modules/partner/api/partner.controller.js';
import { AdminPartnerController } from '../modules/admin/api/admin-partner.controller.js';

import { GoogleMapsProvider } from '../providers/maps/GoogleMapsProvider.js';
import { GeocodeAddressUseCase } from '../modules/maps/use-cases/GeocodeAddressUseCase.js';
import { ReverseGeocodeUseCase } from '../modules/maps/use-cases/ReverseGeocodeUseCase.js';
import { CalculateDistanceUseCase } from '../modules/maps/use-cases/CalculateDistanceUseCase.js';

import { PrismaPartnerProfileRepository, PrismaKycDocumentRepository } from '@carbroz/platform-database';
import { MinIOStorageProvider } from '@carbroz/platform-storage';
import { UploadKycDocumentUseCase } from '../modules/partner/use-cases/UploadKycDocumentUseCase.js';
import { GetPartnerKycStatusUseCase } from '../modules/partner/use-cases/GetPartnerKycStatusUseCase.js';
import { AdminReviewKycDocumentUseCase } from '../modules/admin/use-cases/AdminReviewKycDocumentUseCase.js';
import { KycController } from '../modules/partner/api/kyc.controller.js';
import { AdminKycController } from '../modules/admin/api/admin-kyc.controller.js';
import { LoggerProvider } from '../providers/LoggerProvider.js';

import { PrismaCustomerProfileRepository, PrismaAddressRepository } from '@carbroz/platform-database';
import { GetCustomerProfileUseCase } from '../modules/customer/use-cases/GetCustomerProfileUseCase.js';
import { UpdateCustomerProfileUseCase } from '../modules/customer/use-cases/UpdateCustomerProfileUseCase.js';
import { ManageAddressUseCase } from '../modules/customer/use-cases/ManageAddressUseCase.js';
import { ExtractCustomerDataUseCase } from '../modules/customer/use-cases/ExtractCustomerDataUseCase.js';

import { PrismaCatalogRepository, PrismaPricingRepository } from '@carbroz/platform-database';
import { GetCatalogUseCase } from '../modules/catalog/use-cases/GetCatalogUseCase.js';
import { CalculateServicePriceUseCase } from '../modules/catalog/use-cases/CalculateServicePriceUseCase.js';
import { ManageCatalogUseCase } from '../modules/catalog/use-cases/ManageCatalogUseCase.js';
import { ManagePricingTierUseCase } from '../modules/catalog/use-cases/ManagePricingTierUseCase.js';

import { GetSduiScreenUseCase } from '../modules/sdui/use-cases/GetSduiScreenUseCase.js';
import { CreateSduiComponentUseCase } from '../modules/sdui/use-cases/CreateSduiComponentUseCase.js';
import { CreateSduiSectionUseCase } from '../modules/sdui/use-cases/CreateSduiSectionUseCase.js';
import { CreateSduiGroupUseCase } from '../modules/sdui/use-cases/CreateSduiGroupUseCase.js';
import { CreateSduiElementUseCase } from '../modules/sdui/use-cases/CreateSduiElementUseCase.js';
import { CreateSduiDraftUseCase } from '../modules/sdui/use-cases/CreateSduiDraftUseCase.js';
import { UpdateSduiDraftUseCase } from '../modules/sdui/use-cases/UpdateSduiDraftUseCase.js';
import { PublishSduiVersionUseCase } from '../modules/sdui/use-cases/PublishSduiVersionUseCase.js';
import { ArchiveSduiVersionUseCase } from '../modules/sdui/use-cases/ArchiveSduiVersionUseCase.js';
import { RollbackSduiVersionUseCase } from '../modules/sdui/use-cases/RollbackSduiVersionUseCase.js';
import { GetSduiVersionHistoryUseCase } from '../modules/sdui/use-cases/GetSduiVersionHistoryUseCase.js';
import { GetSduiSpecificVersionUseCase } from '../modules/sdui/use-cases/GetSduiSpecificVersionUseCase.js';
import { CompareSduiVersionsUseCase } from '../modules/sdui/use-cases/CompareSduiVersionsUseCase.js';

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

import {
  PrismaPaymentRepository,
  PrismaInvoiceRepository,
  PrismaPartnerPayoutRepository,
} from '@carbroz/platform-database';
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

import {
  PrismaReviewRepository,
  PrismaCouponRepository,
  PrismaCouponUsageRepository,
} from '@carbroz/platform-database';
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

import { PrismaAuditLogRepository } from '@carbroz/platform-database';
import { AuditLogService } from '@carbroz/common';

import { PrismaDisputeRepository } from '@carbroz/platform-database';
import { DisputeSettlementCalculator } from '@carbroz/common';
import { RaiseDisputeUseCase } from '../modules/dispute/use-cases/RaiseDisputeUseCase.js';
import { ResolveDisputeUseCase } from '../modules/dispute/use-cases/ResolveDisputeUseCase.js';
import { GetDisputeUseCase } from '../modules/dispute/use-cases/GetDisputeUseCase.js';
import { ListDisputesUseCase } from '../modules/dispute/use-cases/ListDisputesUseCase.js';

import {
  PrismaCorporateAccountRepository,
  PrismaCorporateMemberRepository,
  PrismaCorporateFleetVehicleRepository,
  PrismaCorporateCreditLedgerRepository,
  PrismaCorporateInvoiceRepository,
} from '@carbroz/platform-database';
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

export interface Cradle {
  prismaProvider: PrismaProvider;
  databaseProvider: PrismaDatabaseProvider;
  transactionProvider: PrismaTransactionProvider;
  repositoryFactory: RepositoryFactory;
  configRepository: import('@carbroz/common').IConfigRepository;
  featureFlagRepository: import('@carbroz/common').IFeatureFlagRepository;
  configProvider: ConfigProvider;
  featureFlagProvider: FeatureFlagProvider;
  authorizationProvider: AuthorizationProvider;
  userRepository: import('@carbroz/common').IUserRepository;
  userSessionRepository: import('@carbroz/common').IUserSessionRepository;
  roleRepository: import('@carbroz/common').IRoleRepository;
  permissionRepository: import('@carbroz/common').IPermissionRepository;
  adminRoleRepository: import('@carbroz/common').IAdminRoleRepository;
  guestLoginUseCase: GuestLoginUseCase;
  sendOtpUseCase: SendOtpUseCase;
  verifyOtpUseCase: VerifyOtpUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  logoutUseCase: LogoutUseCase;

  partnerRepository: import('@carbroz/common').IPartnerRepository;
  partnerMemberRepository: import('@carbroz/common').IPartnerMemberRepository;
  registerIndividualPartnerUseCase: RegisterIndividualPartnerUseCase;
  registerOrganizationPartnerUseCase: RegisterOrganizationPartnerUseCase;
  getPartnerProfileUseCase: GetPartnerProfileUseCase;
  verifyPartnerUseCase: VerifyPartnerUseCase;
  partnerController: PartnerController;
  adminPartnerController: AdminPartnerController;

  mapsProvider: import('@carbroz/common').IMapsProvider;
  geocodeAddressUseCase: GeocodeAddressUseCase;
  reverseGeocodeUseCase: ReverseGeocodeUseCase;
  calculateDistanceUseCase: CalculateDistanceUseCase;

  partnerProfileRepository: import('@carbroz/common').IPartnerProfileRepository;
  kycDocumentRepository: import('@carbroz/common').IKycDocumentRepository;
  storageProvider: import('@carbroz/common').IStorageProvider;
  uploadKycDocumentUseCase: UploadKycDocumentUseCase;
  getPartnerKycStatusUseCase: GetPartnerKycStatusUseCase;
  adminReviewKycDocumentUseCase: AdminReviewKycDocumentUseCase;
  kycController: KycController;
  adminKycController: AdminKycController;
  logger: import('@carbroz/common').ILoggerProvider;

  customerProfileRepository: import('@carbroz/common').ICustomerProfileRepository;
  addressRepository: import('@carbroz/common').IAddressRepository;
  getCustomerProfileUseCase: GetCustomerProfileUseCase;
  updateCustomerProfileUseCase: UpdateCustomerProfileUseCase;
  manageAddressUseCase: ManageAddressUseCase;
  extractCustomerDataUseCase: ExtractCustomerDataUseCase;

  catalogRepository: import('@carbroz/common').ICatalogRepository;
  pricingRepository: import('@carbroz/common').IPricingRepository;
  getCatalogUseCase: GetCatalogUseCase;
  calculateServicePriceUseCase: CalculateServicePriceUseCase;
  manageCatalogUseCase: ManageCatalogUseCase;
  managePricingTierUseCase: ManagePricingTierUseCase;

  sduiRegistryRepository: import('@carbroz/domain-sdui-registry').ISduiRegistryRepository;
  getSduiScreenUseCase: GetSduiScreenUseCase;
  createSduiComponentUseCase: CreateSduiComponentUseCase;
  createSduiSectionUseCase: CreateSduiSectionUseCase;
  createSduiGroupUseCase: CreateSduiGroupUseCase;
  createSduiElementUseCase: CreateSduiElementUseCase;
  createSduiDraftUseCase: CreateSduiDraftUseCase;
  updateSduiDraftUseCase: UpdateSduiDraftUseCase;
  publishSduiVersionUseCase: PublishSduiVersionUseCase;
  archiveSduiVersionUseCase: ArchiveSduiVersionUseCase;
  rollbackSduiVersionUseCase: RollbackSduiVersionUseCase;
  getSduiVersionHistoryUseCase: GetSduiVersionHistoryUseCase;
  getSduiSpecificVersionUseCase: GetSduiSpecificVersionUseCase;
  compareSduiVersionsUseCase: CompareSduiVersionsUseCase;

  vehicleRepository: import('@carbroz/common').IVehicleRepository;
  bookingRepository: import('@carbroz/common').IBookingRepository;
  createVehicleUseCase: CreateVehicleUseCase;
  listCustomerVehiclesUseCase: ListCustomerVehiclesUseCase;
  setDefaultVehicleUseCase: SetDefaultVehicleUseCase;
  archiveVehicleUseCase: ArchiveVehicleUseCase;
  vehicleController: VehicleController;
  createBookingUseCase: CreateBookingUseCase;
  confirmBookingUseCase: ConfirmBookingUseCase;
  assignPartnerToBookingUseCase: AssignPartnerToBookingUseCase;
  transitionBookingStatusUseCase: TransitionBookingStatusUseCase;
  cancelBookingUseCase: CancelBookingUseCase;
  expirePendingBookingsUseCase: ExpirePendingBookingsUseCase;
  bookingController: BookingController;

  paymentRepository: import('@carbroz/common').IPaymentRepository;
  invoiceRepository: import('@carbroz/common').IInvoiceRepository;
  partnerPayoutRepository: import('@carbroz/common').IPartnerPayoutRepository;
  paymentGatewayProvider: import('@carbroz/common').IPaymentGatewayProvider;
  createPaymentOrderUseCase: CreatePaymentOrderUseCase;
  getPaymentUseCase: GetPaymentUseCase;
  processPaymentWebhookUseCase: ProcessPaymentWebhookUseCase;
  generateInvoiceUseCase: GenerateInvoiceUseCase;
  getInvoiceUseCase: GetInvoiceUseCase;
  createPayoutEligibilityUseCase: CreatePayoutEligibilityUseCase;
  listPartnerPayoutsUseCase: ListPartnerPayoutsUseCase;
  processPayoutBatchUseCase: ProcessPayoutBatchUseCase;
  markPayoutPaidUseCase: MarkPayoutPaidUseCase;
  paymentController: PaymentController;
  payoutController: PayoutController;

  trackingSessionRepository: import('@carbroz/common').ITrackingSessionRepository;
  notificationLogRepository: import('@carbroz/common').INotificationLogRepository;
  deviceTokenRepository: import('@carbroz/common').IDeviceTokenRepository;
  pushProvider: import('@carbroz/common').IPushProvider;
  smsProvider: import('@carbroz/common').ISmsProvider;
  emailProvider: import('@carbroz/common').IEmailProvider;
  notificationProvider: import('@carbroz/common').INotificationProvider;
  notificationService: NotificationService;
  startTrackingSessionUseCase: StartTrackingSessionUseCase;
  updateLocationPingUseCase: UpdateLocationPingUseCase;
  getCurrentTrackingUseCase: GetCurrentTrackingUseCase;
  endTrackingSessionUseCase: EndTrackingSessionUseCase;
  registerDeviceTokenUseCase: RegisterDeviceTokenUseCase;
  deactivateDeviceTokenUseCase: DeactivateDeviceTokenUseCase;
  sendNotificationUseCase: SendNotificationUseCase;
  listNotificationHistoryUseCase: ListNotificationHistoryUseCase;

  reviewRepository: import('@carbroz/common').IReviewRepository;
  couponRepository: import('@carbroz/common').ICouponRepository;
  couponUsageRepository: import('@carbroz/common').ICouponUsageRepository;
  partnerRatingCalculator: PartnerRatingCalculator;
  couponDiscountCalculator: CouponDiscountCalculator;
  submitReviewUseCase: SubmitReviewUseCase;
  moderateReviewUseCase: ModerateReviewUseCase;
  getPartnerReviewsUseCase: GetPartnerReviewsUseCase;
  createCouponUseCase: CreateCouponUseCase;
  updateCouponUseCase: UpdateCouponUseCase;
  archiveCouponUseCase: ArchiveCouponUseCase;
  validateCouponUseCase: ValidateCouponUseCase;
  applyCouponUseCase: ApplyCouponUseCase;
  listCouponsUseCase: ListCouponsUseCase;

  auditLogRepository: import('@carbroz/common').IAuditLogRepository;
  auditLogService: AuditLogService;

  disputeRepository: import('@carbroz/common').IDisputeRepository;
  disputeSettlementCalculator: DisputeSettlementCalculator;
  raiseDisputeUseCase: RaiseDisputeUseCase;
  resolveDisputeUseCase: ResolveDisputeUseCase;
  getDisputeUseCase: GetDisputeUseCase;
  listDisputesUseCase: ListDisputesUseCase;

  corporateAccountRepo: import('@carbroz/common').ICorporateAccountRepository;
  corporateMemberRepo: import('@carbroz/common').ICorporateMemberRepository;
  fleetVehicleRepo: import('@carbroz/common').ICorporateFleetVehicleRepository;
  creditLedgerRepo: import('@carbroz/common').ICorporateCreditLedgerRepository;
  corporateInvoiceRepo: import('@carbroz/common').ICorporateInvoiceRepository;
  registerAccountUseCase: RegisterCorporateAccountUseCase;
  approveAccountUseCase: ApproveCorporateAccountUseCase;
  adjustCreditLimitUseCase: AdjustCreditLimitUseCase;
  addMemberUseCase: AddCorporateMemberUseCase;
  removeMemberUseCase: RemoveCorporateMemberUseCase;
  enrollFleetVehicleUseCase: EnrollFleetVehicleUseCase;
  removeFleetVehicleUseCase: RemoveFleetVehicleUseCase;
  validateCorporateBookingUseCase: ValidateCorporateBookingUseCase;
  generateCorporateInvoiceUseCase: GenerateCorporateInvoiceUseCase;
  reconcilePaymentUseCase: ReconcileCorporatePaymentUseCase;
  corporateController: CorporateController;
  adminCorporateController: AdminCorporateController;
}

let isRegistered = false;

export function getContainer(): AwilixContainer<Cradle> {
  if (!isRegistered) {
    diContainer.register({
      prismaProvider: asClass(PrismaProvider).classic().singleton(),
      databaseProvider: asClass(PrismaDatabaseProvider).classic().singleton(),
      transactionProvider: asClass(PrismaTransactionProvider).classic().singleton(),
      repositoryFactory: asClass(RepositoryFactory).classic().singleton(),
      configRepository: asClass(PrismaConfigRepository).classic().singleton(),
      featureFlagRepository: asClass(PrismaFeatureFlagRepository).classic().singleton(),
      configProvider: asClass(ConfigProvider).classic().singleton(),
      featureFlagProvider: asClass(FeatureFlagProvider).classic().singleton(),
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
      partnerRepository: asClass(PrismaPartnerRepository).classic().singleton(),
      partnerMemberRepository: asClass(PrismaPartnerMemberRepository).classic().singleton(),
      registerIndividualPartnerUseCase: asClass(RegisterIndividualPartnerUseCase).classic().scoped(),
      registerOrganizationPartnerUseCase: asClass(RegisterOrganizationPartnerUseCase).classic().scoped(),
      getPartnerProfileUseCase: asClass(GetPartnerProfileUseCase).classic().scoped(),
      verifyPartnerUseCase: asClass(VerifyPartnerUseCase).classic().scoped(),
      partnerController: asClass(PartnerController).classic().scoped(),
      adminPartnerController: asClass(AdminPartnerController).classic().scoped(),
      mapsProvider: asClass(GoogleMapsProvider).classic().singleton(),
      geocodeAddressUseCase: asClass(GeocodeAddressUseCase).classic().scoped(),
      reverseGeocodeUseCase: asClass(ReverseGeocodeUseCase).classic().scoped(),
      calculateDistanceUseCase: asClass(CalculateDistanceUseCase).classic().scoped(),
      partnerProfileRepository: asClass(PrismaPartnerProfileRepository).classic().singleton(),
      kycDocumentRepository: asClass(PrismaKycDocumentRepository).classic().singleton(),
      storageProvider: asClass(MinIOStorageProvider).classic().singleton(),
      logger: asClass(LoggerProvider).classic().singleton(),
      uploadKycDocumentUseCase: asClass(UploadKycDocumentUseCase).classic().scoped(),
      getPartnerKycStatusUseCase: asClass(GetPartnerKycStatusUseCase).classic().scoped(),
      adminReviewKycDocumentUseCase: asClass(AdminReviewKycDocumentUseCase).classic().scoped(),
      kycController: asClass(KycController).classic().scoped(),
      adminKycController: asClass(AdminKycController).classic().scoped(),
      customerProfileRepository: asClass(PrismaCustomerProfileRepository).classic().singleton(),
      addressRepository: asClass(PrismaAddressRepository).classic().singleton(),
      getCustomerProfileUseCase: asClass(GetCustomerProfileUseCase).classic().scoped(),
      updateCustomerProfileUseCase: asClass(UpdateCustomerProfileUseCase).classic().scoped(),
      manageAddressUseCase: asClass(ManageAddressUseCase).classic().scoped(),
      extractCustomerDataUseCase: asClass(ExtractCustomerDataUseCase).classic().scoped(),
      catalogRepository: asClass(PrismaCatalogRepository).classic().singleton(),
      pricingRepository: asClass(PrismaPricingRepository).classic().singleton(),
      getCatalogUseCase: asClass(GetCatalogUseCase).classic().scoped(),
      calculateServicePriceUseCase: asClass(CalculateServicePriceUseCase).classic().scoped(),
      manageCatalogUseCase: asClass(ManageCatalogUseCase).classic().scoped(),
      managePricingTierUseCase: asClass(ManagePricingTierUseCase).classic().scoped(),

      getSduiScreenUseCase: asClass(GetSduiScreenUseCase).classic().scoped(),
      createSduiComponentUseCase: asClass(CreateSduiComponentUseCase).classic().scoped(),
      createSduiSectionUseCase: asClass(CreateSduiSectionUseCase).classic().scoped(),
      createSduiGroupUseCase: asClass(CreateSduiGroupUseCase).classic().scoped(),
      createSduiElementUseCase: asClass(CreateSduiElementUseCase).classic().scoped(),
      createSduiDraftUseCase: asClass(CreateSduiDraftUseCase).classic().scoped(),
      updateSduiDraftUseCase: asClass(UpdateSduiDraftUseCase).classic().scoped(),
      publishSduiVersionUseCase: asClass(PublishSduiVersionUseCase).classic().scoped(),
      archiveSduiVersionUseCase: asClass(ArchiveSduiVersionUseCase).classic().scoped(),
      rollbackSduiVersionUseCase: asClass(RollbackSduiVersionUseCase).classic().scoped(),
      getSduiVersionHistoryUseCase: asClass(GetSduiVersionHistoryUseCase).classic().scoped(),
      getSduiSpecificVersionUseCase: asClass(GetSduiSpecificVersionUseCase).classic().scoped(),
      compareSduiVersionsUseCase: asClass(CompareSduiVersionsUseCase).classic().scoped(),

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
      auditLogRepository: asClass(PrismaAuditLogRepository).classic().singleton(),
      auditLogService: asClass(AuditLogService).classic().scoped(),
      disputeRepository: asClass(PrismaDisputeRepository).classic().singleton(),
      disputeSettlementCalculator: asClass(DisputeSettlementCalculator).classic().scoped(),
      raiseDisputeUseCase: asClass(RaiseDisputeUseCase).classic().scoped(),
      resolveDisputeUseCase: asClass(ResolveDisputeUseCase).classic().scoped(),
      getDisputeUseCase: asClass(GetDisputeUseCase).classic().scoped(),
      listDisputesUseCase: asClass(ListDisputesUseCase).classic().scoped(),
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

  return diContainer as unknown as AwilixContainer<Cradle>;
}
