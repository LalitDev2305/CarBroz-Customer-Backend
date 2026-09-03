import { InjectionMode, asClass, AwilixContainer } from 'awilix';
import { diContainer } from '@fastify/awilix';
import { PrismaProvider, PrismaDatabaseProvider, PrismaTransactionProvider } from '@carbroz/platform-database';
import { PrismaConfigRepository, PrismaFeatureFlagRepository } from '@carbroz/domain-configuration';
import { PrismaUserRepository, PrismaUserSessionRepository, PrismaRoleRepository, PrismaPermissionRepository, PrismaAdminRoleRepository } from '@carbroz/domain-identity';
import { ConfigProvider } from '../config/index.js';
import { FeatureFlagProvider } from '@carbroz/platform-integrations';
import { AuthorizationProvider } from '../providers/AuthorizationProvider.js';
import { GuestLoginUseCase } from '@carbroz/domain-identity';
import { SendOtpUseCase } from '@carbroz/domain-identity';
import { VerifyOtpUseCase } from '@carbroz/domain-identity';
import { RefreshTokenUseCase } from '@carbroz/domain-identity';
import { LogoutUseCase } from '@carbroz/domain-identity';

import { registerBookingModule } from '@carbroz/domain-booking';
import { ArchiveVehicleUseCase, CreateVehicleUseCase, ListCustomerVehiclesUseCase, SetDefaultVehicleUseCase, registerGarageModule } from '@carbroz/domain-customer';
import { registerTrackingModule } from '@carbroz/domain-operations';
import { registerPaymentModule } from '@carbroz/domain-financials';
import { registerInvoiceModule } from '@carbroz/domain-financials';
import { registerPayoutModule } from '@carbroz/domain-financials';
import { registerNotificationModule } from '@carbroz/domain-communications';
import { registerReviewModule } from '@carbroz/domain-engagement';
import { registerCouponModule } from '@carbroz/domain-engagement';
import { registerDisputeModule } from '@carbroz/domain-dispute';
import { registerSduiRegistryModule } from '@carbroz/sdui-registry';
import { registerAuditModule } from '@carbroz/domain-audit';
import { registerConfigModule } from '@carbroz/domain-configuration';

import { PrismaPartnerRepository, PrismaPartnerMemberRepository } from '@carbroz/domain-partner';
import { RegisterIndividualPartnerUseCase } from '@carbroz/domain-partner';
import { RegisterOrganizationPartnerUseCase } from '@carbroz/domain-partner';
import { GetPartnerProfileUseCase } from '@carbroz/domain-partner';
import { VerifyPartnerUseCase } from '@carbroz/domain-partner';

import { GoogleMapsProvider } from '../providers/maps/GoogleMapsProvider.js';
import { GeocodeAddressUseCase } from '@carbroz/domain-operations';
import { ReverseGeocodeUseCase } from '@carbroz/domain-operations';
import { CalculateDistanceUseCase } from '@carbroz/domain-operations';

import { PrismaPartnerProfileRepository, PrismaKycDocumentRepository } from '@carbroz/domain-partner';
import { MinIOStorageProvider } from '@carbroz/platform-storage';
import { UploadKycDocumentUseCase } from '@carbroz/domain-partner';
import { GetPartnerKycStatusUseCase } from '@carbroz/domain-partner';
import { AdminReviewKycDocumentUseCase } from '@carbroz/domain-partner';
import { KycController } from '../../surfaces/partner/kyc.controller.js';
import { AdminKycController } from '../../surfaces/admin/admin-kyc.controller.js';
import { LoggerProvider } from '../providers/LoggerProvider.js';

import { PrismaCustomerProfileRepository, PrismaAddressRepository } from '@carbroz/domain-customer';
import { GetCustomerProfileUseCase } from '@carbroz/domain-customer';
import { UpdateCustomerProfileUseCase } from '@carbroz/domain-customer';
import { ManageAddressUseCase } from '@carbroz/domain-customer';
import { ExtractCustomerDataUseCase } from '@carbroz/domain-customer';

import { PrismaCatalogRepository, PrismaPricingRepository } from '@carbroz/domain-catalog-pricing';
import { GetCatalogUseCase } from '@carbroz/domain-catalog-pricing';
import { CalculateServicePriceUseCase } from '@carbroz/domain-catalog-pricing';
import { ManageCatalogUseCase } from '@carbroz/domain-catalog-pricing';
import { ManagePricingTierUseCase } from '@carbroz/domain-catalog-pricing';

import { GetSduiScreenUseCase } from '@carbroz/sdui-registry';
import { CreateSduiComponentUseCase } from '@carbroz/sdui-registry';
import { CreateSduiSectionUseCase } from '@carbroz/sdui-registry';
import { CreateSduiGroupUseCase } from '@carbroz/sdui-registry';
import { CreateSduiElementUseCase } from '@carbroz/sdui-registry';
import { CreateSduiDraftUseCase } from '@carbroz/sdui-registry';
import { UpdateSduiDraftUseCase } from '@carbroz/sdui-registry';
import { PublishSduiVersionUseCase } from '@carbroz/sdui-registry';
import { ArchiveSduiVersionUseCase } from '@carbroz/sdui-registry';
import { RollbackSduiVersionUseCase } from '@carbroz/sdui-registry';
import { GetSduiVersionHistoryUseCase } from '@carbroz/sdui-registry';
import { GetSduiSpecificVersionUseCase } from '@carbroz/sdui-registry';
import { CompareSduiVersionsUseCase } from '@carbroz/sdui-registry';

import { VehicleController } from '../../surfaces/customer/vehicle/vehicle.controller.js';
import { CreateBookingUseCase } from '@carbroz/domain-booking';
import { ConfirmBookingUseCase } from '@carbroz/domain-booking';
import { AssignPartnerToBookingUseCase } from '@carbroz/domain-booking';
import { TransitionBookingStatusUseCase } from '@carbroz/domain-booking';
import { CancelBookingUseCase } from '@carbroz/domain-booking';
import { ExpirePendingBookingsUseCase } from '@carbroz/domain-booking';
import { BookingController } from '../../surfaces/customer/booking/booking.controller.js';

import { PrismaPaymentRepository, PrismaInvoiceRepository, PrismaPartnerPayoutRepository } from '@carbroz/domain-financials';
import { RazorpayPaymentGatewayProvider } from '../providers/payment/RazorpayPaymentGatewayProvider.js';
import { CreatePaymentOrderUseCase } from '@carbroz/domain-financials';
import { GetPaymentUseCase } from '@carbroz/domain-financials';
import { ProcessPaymentWebhookUseCase } from '@carbroz/domain-financials';
import { GenerateInvoiceUseCase } from '@carbroz/domain-financials';
import { GetInvoiceUseCase } from '@carbroz/domain-financials';
import { CreatePayoutEligibilityUseCase } from '@carbroz/domain-financials';
import { ListPartnerPayoutsUseCase } from '@carbroz/domain-financials';
import { ProcessPayoutBatchUseCase } from '@carbroz/domain-financials';
import { MarkPayoutPaidUseCase } from '@carbroz/domain-financials';
import { PaymentController } from '../../surfaces/customer/payment/payment.controller.js';
import { PayoutController } from '../../surfaces/partner/payout/payout.controller.js';
import { PrismaTrackingSessionRepository } from '@carbroz/domain-operations';
import { PrismaNotificationLogRepository } from '@carbroz/domain-communications';
import { PrismaDeviceTokenRepository } from '@carbroz/domain-communications';
import { FirebasePushProvider } from '../providers/notification/FirebasePushProvider.js';
import { Msg91SmsProvider } from '../providers/notification/Msg91SmsProvider.js';
import { ResendEmailProvider } from '../providers/notification/ResendEmailProvider.js';
import { MultiChannelNotificationProvider } from '@carbroz/platform-integrations';
import { NotificationService } from '@carbroz/domain-communications';
import { StartTrackingSessionUseCase } from '@carbroz/domain-operations';
import { UpdateLocationPingUseCase } from '@carbroz/domain-operations';
import { GetCurrentTrackingUseCase } from '@carbroz/domain-operations';
import { EndTrackingSessionUseCase } from '@carbroz/domain-operations';
import { RegisterDeviceTokenUseCase } from '@carbroz/domain-communications';
import { DeactivateDeviceTokenUseCase } from '@carbroz/domain-communications';
import { SendNotificationUseCase } from '@carbroz/domain-communications';
import { ListNotificationHistoryUseCase } from '@carbroz/domain-communications';

import { PrismaReviewRepository, PrismaCouponRepository, PrismaCouponUsageRepository } from '@carbroz/domain-engagement';
import { PartnerRatingCalculator, CouponDiscountCalculator } from '@carbroz/domain-engagement';
import { SubmitReviewUseCase } from '@carbroz/domain-engagement';
import { ModerateReviewUseCase } from '@carbroz/domain-engagement';
import { GetPartnerReviewsUseCase } from '@carbroz/domain-engagement';
import { CreateCouponUseCase } from '@carbroz/domain-engagement';
import { UpdateCouponUseCase } from '@carbroz/domain-engagement';
import { ArchiveCouponUseCase } from '@carbroz/domain-engagement';
import { ValidateCouponUseCase } from '@carbroz/domain-engagement';
import { ApplyCouponUseCase } from '@carbroz/domain-engagement';
import { ListCouponsUseCase } from '@carbroz/domain-engagement';

import { PrismaAuditLogRepository } from '@carbroz/domain-audit';
import { AuditLogService } from '@carbroz/domain-audit';

import { PrismaDisputeRepository } from '@carbroz/domain-dispute';
import { DisputeSettlementCalculator } from '@carbroz/domain-dispute';
import { RaiseDisputeUseCase } from '@carbroz/domain-dispute';
import { ResolveDisputeUseCase } from '@carbroz/domain-dispute';
import { GetDisputeUseCase } from '@carbroz/domain-dispute';
import { ListDisputesUseCase } from '@carbroz/domain-dispute';

import { PrismaCorporateAccountRepository, PrismaCorporateMemberRepository, PrismaCorporateFleetVehicleRepository, PrismaCorporateCreditLedgerRepository, PrismaCorporateInvoiceRepository } from '@carbroz/domain-enterprise';
import { RegisterCorporateAccountUseCase } from '@carbroz/domain-enterprise';
import { ApproveCorporateAccountUseCase } from '@carbroz/domain-enterprise';
import { AdjustCreditLimitUseCase } from '@carbroz/domain-enterprise';
import { AddCorporateMemberUseCase } from '@carbroz/domain-enterprise';
import { RemoveCorporateMemberUseCase } from '@carbroz/domain-enterprise';
import { EnrollFleetVehicleUseCase } from '@carbroz/domain-enterprise';
import { RemoveFleetVehicleUseCase } from '@carbroz/domain-enterprise';
import { ValidateCorporateBookingUseCase } from '@carbroz/domain-enterprise';
import { GenerateCorporateInvoiceUseCase } from '@carbroz/domain-enterprise';
import { ReconcileCorporatePaymentUseCase } from '@carbroz/domain-enterprise';

export interface Cradle {
  prismaProvider: PrismaProvider;
  databaseProvider: PrismaDatabaseProvider;
  transactionProvider: PrismaTransactionProvider;
  configRepository: import('@carbroz/domain-configuration').IConfigRepository;
  featureFlagRepository: import('@carbroz/domain-configuration').IFeatureFlagRepository;
  configProvider: ConfigProvider;
  featureFlagProvider: FeatureFlagProvider;
  authorizationProvider: AuthorizationProvider;
  userRepository: import('@carbroz/domain-identity').IUserRepository;
  userSessionRepository: import('@carbroz/domain-identity').IUserSessionRepository;
  roleRepository: import('@carbroz/domain-identity').IRoleRepository;
  permissionRepository: import('@carbroz/domain-identity').IPermissionRepository;
  adminRoleRepository: import('@carbroz/domain-identity').IAdminRoleRepository;
  guestLoginUseCase: GuestLoginUseCase;
  sendOtpUseCase: SendOtpUseCase;
  verifyOtpUseCase: VerifyOtpUseCase;
  refreshTokenUseCase: RefreshTokenUseCase;
  logoutUseCase: LogoutUseCase;

  partnerRepository: import('@carbroz/domain-partner').IPartnerRepository;
  partnerMemberRepository: import('@carbroz/domain-partner').IPartnerMemberRepository;
  registerIndividualPartnerUseCase: RegisterIndividualPartnerUseCase;
  registerOrganizationPartnerUseCase: RegisterOrganizationPartnerUseCase;
  getPartnerProfileUseCase: GetPartnerProfileUseCase;
  verifyPartnerUseCase: VerifyPartnerUseCase;

  mapsProvider: import('@carbroz/domain-operations').IMapsProvider;
  geocodeAddressUseCase: GeocodeAddressUseCase;
  reverseGeocodeUseCase: ReverseGeocodeUseCase;
  calculateDistanceUseCase: CalculateDistanceUseCase;

  partnerProfileRepository: import('@carbroz/domain-partner').IPartnerProfileRepository;
  kycDocumentRepository: import('@carbroz/domain-partner').IKycDocumentRepository;
  storageProvider: import('@carbroz/platform-storage').IStorageProvider;
  uploadKycDocumentUseCase: UploadKycDocumentUseCase;
  getPartnerKycStatusUseCase: GetPartnerKycStatusUseCase;
  adminReviewKycDocumentUseCase: AdminReviewKycDocumentUseCase;
  kycController: KycController;
  adminKycController: AdminKycController;
  logger: import('@carbroz/foundation-kernel').ILoggerProvider;

  customerProfileRepository: import('@carbroz/domain-customer').ICustomerProfileRepository;
  addressRepository: import('@carbroz/domain-customer').IAddressRepository;
  getCustomerProfileUseCase: GetCustomerProfileUseCase;
  updateCustomerProfileUseCase: UpdateCustomerProfileUseCase;
  manageAddressUseCase: ManageAddressUseCase;
  extractCustomerDataUseCase: ExtractCustomerDataUseCase;

  catalogRepository: import('@carbroz/domain-catalog-pricing').ICatalogRepository;
  pricingRepository: import('@carbroz/domain-catalog-pricing').IPricingRepository;
  getCatalogUseCase: GetCatalogUseCase;
  calculateServicePriceUseCase: CalculateServicePriceUseCase;
  manageCatalogUseCase: ManageCatalogUseCase;
  managePricingTierUseCase: ManagePricingTierUseCase;

  sduiRegistryRepository: import('@carbroz/sdui-registry').ISduiRegistryRepository;
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

  vehicleRepository: import('@carbroz/domain-customer').IVehicleRepository;
  bookingRepository: import('@carbroz/domain-booking').IBookingRepository;
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

  paymentRepository: import('@carbroz/domain-financials').IPaymentRepository;
  invoiceRepository: import('@carbroz/domain-financials').IInvoiceRepository;
  partnerPayoutRepository: import('@carbroz/domain-financials').IPartnerPayoutRepository;
  paymentGatewayProvider: import('@carbroz/domain-financials').IPaymentGatewayProvider;
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

  trackingSessionRepository: import('@carbroz/domain-operations').ITrackingSessionRepository;
  notificationLogRepository: import('@carbroz/domain-communications').INotificationLogRepository;
  deviceTokenRepository: import('@carbroz/domain-communications').IDeviceTokenRepository;
  pushProvider: import('@carbroz/domain-communications').IPushProvider;
  smsProvider: import('@carbroz/domain-communications').ISmsProvider;
  emailProvider: import('@carbroz/domain-communications').IEmailProvider;
  notificationProvider: import('@carbroz/domain-communications').INotificationProvider;
  notificationService: NotificationService;
  startTrackingSessionUseCase: StartTrackingSessionUseCase;
  updateLocationPingUseCase: UpdateLocationPingUseCase;
  getCurrentTrackingUseCase: GetCurrentTrackingUseCase;
  endTrackingSessionUseCase: EndTrackingSessionUseCase;
  registerDeviceTokenUseCase: RegisterDeviceTokenUseCase;
  deactivateDeviceTokenUseCase: DeactivateDeviceTokenUseCase;
  sendNotificationUseCase: SendNotificationUseCase;
  listNotificationHistoryUseCase: ListNotificationHistoryUseCase;

  reviewRepository: import('@carbroz/domain-engagement').IReviewRepository;
  couponRepository: import('@carbroz/domain-engagement').ICouponRepository;
  couponUsageRepository: import('@carbroz/domain-engagement').ICouponUsageRepository;
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

  auditLogRepository: import('@carbroz/domain-audit').IAuditLogRepository;
  auditLogService: AuditLogService;

  disputeRepository: import('@carbroz/domain-dispute').IDisputeRepository;
  disputeSettlementCalculator: DisputeSettlementCalculator;
  raiseDisputeUseCase: RaiseDisputeUseCase;
  resolveDisputeUseCase: ResolveDisputeUseCase;
  getDisputeUseCase: GetDisputeUseCase;
  listDisputesUseCase: ListDisputesUseCase;

  corporateAccountRepo: import('@carbroz/domain-enterprise').ICorporateAccountRepository;
  corporateMemberRepo: import('@carbroz/domain-enterprise').ICorporateMemberRepository;
  fleetVehicleRepo: import('@carbroz/domain-enterprise').ICorporateFleetVehicleRepository;
  creditLedgerRepo: import('@carbroz/domain-enterprise').ICorporateCreditLedgerRepository;
  corporateInvoiceRepo: import('@carbroz/domain-enterprise').ICorporateInvoiceRepository;
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
}

let isRegistered = false;

export function getContainer(): AwilixContainer<Cradle> {
  if (!isRegistered) {
    diContainer.register({
      prismaProvider: asClass(PrismaProvider).classic().singleton(),
      databaseProvider: asClass(PrismaDatabaseProvider).classic().singleton(),
      transactionProvider: asClass(PrismaTransactionProvider).classic().singleton(),
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
    });

    registerGarageModule(diContainer);
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
