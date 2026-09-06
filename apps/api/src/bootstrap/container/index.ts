import { NotificationService } from '@carbroz/domain-communications';
import { PartnerRatingCalculator, CouponDiscountCalculator } from '@carbroz/domain-engagement';
import { AuditLogService } from '@carbroz/domain-audit';
import { DisputeSettlementCalculator } from '@carbroz/domain-dispute';
import { InjectionMode, asClass, AwilixContainer } from 'awilix';
import { diContainer } from '@fastify/awilix';
import { PrismaProvider, PrismaDatabaseProvider, PrismaTransactionProvider } from '@carbroz/platform-database';
import { registerIdentityModule } from '@carbroz/domain-identity';

import { GuestLoginUseCase } from '@carbroz/domain-identity';
import { SendOtpUseCase } from '@carbroz/domain-identity';
import { VerifyOtpUseCase } from '@carbroz/domain-identity';
import { RefreshTokenUseCase } from '@carbroz/domain-identity';
import { LogoutUseCase } from '@carbroz/domain-identity';

import { registerBookingModule } from '@carbroz/domain-booking';
import { registerCatalogPricingModule } from '@carbroz/domain-catalog-pricing';
import { ArchiveVehicleUseCase, CreateVehicleUseCase, ListCustomerVehiclesUseCase, SetDefaultVehicleUseCase, registerCustomerModule } from '@carbroz/domain-customer';
import { registerPartnerModule } from '@carbroz/domain-partner';
import { registerTrackingModule } from '@carbroz/domain-operations';
import { registerPaymentModule, registerInvoiceModule, registerPayoutModule } from '@carbroz/domain-financials';
import { registerNotificationModule } from '@carbroz/domain-communications';
import { registerReviewModule, registerCouponModule } from '@carbroz/domain-engagement';
import { registerDisputeModule } from '@carbroz/domain-dispute';
import { registerSduiRegistryModule } from '@carbroz/sdui-registry';
import { registerAuditModule } from '@carbroz/domain-audit';
import { ConfigProvider, FeatureFlagProvider, registerConfigModule } from '@carbroz/domain-configuration';
import { RegisterCorporateAccountUseCase, ApproveCorporateAccountUseCase, AdjustCreditLimitUseCase, AddCorporateMemberUseCase, RemoveCorporateMemberUseCase, EnrollFleetVehicleUseCase, RemoveFleetVehicleUseCase, ValidateCorporateBookingUseCase, GenerateCorporateInvoiceUseCase, ReconcileCorporatePaymentUseCase, registerEnterpriseModule } from '@carbroz/domain-enterprise';

import { RegisterIndividualPartnerUseCase } from '@carbroz/domain-partner';
import { RegisterOrganizationPartnerUseCase } from '@carbroz/domain-partner';
import { GetPartnerProfileUseCase } from '@carbroz/domain-partner';
import { VerifyPartnerUseCase } from '@carbroz/domain-partner';
import { PartnerController } from '../../surfaces/partner/controllers/partner.partner.controller.js';
import { AdminPartnerController } from '../../surfaces/admin/controllers/admin-partner.controller.js';
import { GoogleMapsProvider } from '@carbroz/platform-integrations';
import { GeocodeAddressUseCase } from '@carbroz/domain-operations';
import { ReverseGeocodeUseCase } from '@carbroz/domain-operations';
import { CalculateDistanceUseCase } from '@carbroz/domain-operations';
import { MinIOStorageProvider } from '@carbroz/platform-storage';
import { UploadKycDocumentUseCase } from '@carbroz/domain-partner';
import { GetPartnerKycStatusUseCase } from '@carbroz/domain-partner';
import { AdminReviewKycDocumentUseCase } from '@carbroz/domain-partner';
import { KycController } from '../../surfaces/partner/controllers/partner.kyc.controller.js';
import { AdminKycController } from '../../surfaces/admin/controllers/admin-kyc.controller.js';
import { LoggerProvider } from '@carbroz/platform-observability';
import { GetCustomerProfileUseCase } from '@carbroz/domain-customer';
import { UpdateCustomerProfileUseCase } from '@carbroz/domain-customer';
import { ManageAddressUseCase } from '@carbroz/domain-customer';
import { ExtractCustomerDataUseCase } from '@carbroz/domain-customer';
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
import { VehicleController } from '../../surfaces/customer/controllers/vehicle.vehicle.controller.js';
import { CreateBookingUseCase } from '@carbroz/domain-booking';
import { ConfirmBookingUseCase } from '@carbroz/domain-booking';

import { TransitionBookingStatusUseCase } from '@carbroz/domain-booking';
import { CancelBookingUseCase } from '@carbroz/domain-booking';
import { ExpirePendingBookingsUseCase } from '@carbroz/domain-booking';

import { RazorpayPaymentGatewayProvider } from '@carbroz/platform-integrations';
import { CreatePaymentOrderUseCase } from '@carbroz/domain-financials';
import { GetPaymentUseCase } from '@carbroz/domain-financials';
import { ProcessPaymentWebhookUseCase } from '@carbroz/domain-financials';
import { GenerateInvoiceUseCase } from '@carbroz/domain-financials';
import { GetInvoiceUseCase } from '@carbroz/domain-financials';
import { CreatePayoutEligibilityUseCase } from '@carbroz/domain-financials';
import { ListPartnerPayoutsUseCase } from '@carbroz/domain-financials';
import { ProcessPayoutBatchUseCase } from '@carbroz/domain-financials';
import { MarkPayoutPaidUseCase } from '@carbroz/domain-financials';


import { FirebasePushProvider } from '@carbroz/platform-integrations';
import { Msg91SmsProvider } from '@carbroz/platform-integrations';
import { ResendEmailProvider } from '@carbroz/platform-integrations';
import { MultiChannelNotificationProvider } from '@carbroz/platform-integrations';

import { StartTrackingSessionUseCase, UpdateLiveGpsLocationUseCase as UpdateLocationPingUseCase, GetLiveTrackingTimelineUseCase as GetCurrentTrackingUseCase, CompleteTrackingSessionUseCase as EndTrackingSessionUseCase } from '@carbroz/domain-operations';



import { RegisterDeviceTokenUseCase } from '@carbroz/domain-communications';
import { DeactivateDeviceTokenUseCase } from '@carbroz/domain-communications';
import { SendNotificationUseCase } from '@carbroz/domain-communications';
import { ListNotificationHistoryUseCase } from '@carbroz/domain-communications';
import { SubmitReviewUseCase } from '@carbroz/domain-engagement';
import { ModerateReviewUseCase } from '@carbroz/domain-engagement';
import { GetPartnerReviewsUseCase } from '@carbroz/domain-engagement';
import { CreateCouponUseCase } from '@carbroz/domain-engagement';
import { UpdateCouponUseCase } from '@carbroz/domain-engagement';
import { ArchiveCouponUseCase } from '@carbroz/domain-engagement';
import { ValidateCouponUseCase } from '@carbroz/domain-engagement';
import { ApplyCouponUseCase } from '@carbroz/domain-engagement';
import { ListCouponsUseCase } from '@carbroz/domain-engagement';
import { RaiseDisputeUseCase } from '@carbroz/domain-dispute';
import { ResolveDisputeUseCase } from '@carbroz/domain-dispute';
import { GetDisputeUseCase } from '@carbroz/domain-dispute';
import { ListDisputesUseCase } from '@carbroz/domain-dispute';
import { CorporateController } from '../../transport/corporate/controllers/CorporateController.js';
import { AdminCorporateController } from '../../transport/corporate/controllers/AdminCorporateController.js';

/** Cradle is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export interface Cradle {
  prismaProvider: PrismaProvider;
  databaseProvider: PrismaDatabaseProvider;
  transactionProvider: PrismaTransactionProvider;
  configRepository: import('@carbroz/domain-configuration').IConfigRepository;
  featureFlagRepository: import('@carbroz/domain-configuration').IFeatureFlagRepository;
  configProvider: ConfigProvider;
  featureFlagProvider: FeatureFlagProvider;
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
  partnerController: PartnerController;
  adminPartnerController: AdminPartnerController;
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
  logger: import('@carbroz/platform-observability').ILoggerProvider;
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

  transitionBookingStatusUseCase: TransitionBookingStatusUseCase;
  cancelBookingUseCase: CancelBookingUseCase;
  expirePendingBookingsUseCase: ExpirePendingBookingsUseCase;

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
  corporateController: CorporateController;
  adminCorporateController: AdminCorporateController;
}

let isRegistered = false;

/** getContainer is an exported apps/api contract/implementation; see the owning README for lifecycle and extension rules. */
export function getContainer(): AwilixContainer<Cradle> {
  if (!isRegistered) {
    diContainer.register({
      prismaProvider: asClass(PrismaProvider).classic().singleton(),
      databaseProvider: asClass(PrismaDatabaseProvider).classic().singleton(),
      transactionProvider: asClass(PrismaTransactionProvider).classic().singleton(),
      guestLoginUseCase: asClass(GuestLoginUseCase).classic().scoped(),
      sendOtpUseCase: asClass(SendOtpUseCase).classic().scoped(),
      verifyOtpUseCase: asClass(VerifyOtpUseCase).classic().scoped(),
      refreshTokenUseCase: asClass(RefreshTokenUseCase).classic().scoped(),
      logoutUseCase: asClass(LogoutUseCase).classic().scoped(),
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
      storageProvider: asClass(MinIOStorageProvider).classic().singleton(),
      logger: asClass(LoggerProvider).classic().singleton(),
      uploadKycDocumentUseCase: asClass(UploadKycDocumentUseCase).classic().scoped(),
      getPartnerKycStatusUseCase: asClass(GetPartnerKycStatusUseCase).classic().scoped(),
      adminReviewKycDocumentUseCase: asClass(AdminReviewKycDocumentUseCase).classic().scoped(),
      kycController: asClass(KycController).classic().scoped(),
      adminKycController: asClass(AdminKycController).classic().scoped(),
      getCustomerProfileUseCase: asClass(GetCustomerProfileUseCase).classic().scoped(),
      updateCustomerProfileUseCase: asClass(UpdateCustomerProfileUseCase).classic().scoped(),
      manageAddressUseCase: asClass(ManageAddressUseCase).classic().scoped(),
      extractCustomerDataUseCase: asClass(ExtractCustomerDataUseCase).classic().scoped(),
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

      transitionBookingStatusUseCase: asClass(TransitionBookingStatusUseCase).classic().scoped(),
      cancelBookingUseCase: asClass(CancelBookingUseCase).classic().scoped(),
      expirePendingBookingsUseCase: asClass(ExpirePendingBookingsUseCase).classic().scoped(),

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
      auditLogService: asClass(AuditLogService).classic().scoped(),
      disputeSettlementCalculator: asClass(DisputeSettlementCalculator).classic().scoped(),
      raiseDisputeUseCase: asClass(RaiseDisputeUseCase).classic().scoped(),
      resolveDisputeUseCase: asClass(ResolveDisputeUseCase).classic().scoped(),
      getDisputeUseCase: asClass(GetDisputeUseCase).classic().scoped(),
      listDisputesUseCase: asClass(ListDisputesUseCase).classic().scoped(),
      corporateController: asClass(CorporateController).classic().scoped(),
      adminCorporateController: asClass(AdminCorporateController).classic().scoped(),
    });

    registerIdentityModule(diContainer);
    registerCustomerModule(diContainer);
    registerPartnerModule(diContainer);
    registerCatalogPricingModule(diContainer);
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
    registerEnterpriseModule(diContainer);
    isRegistered = true;
  }

  return diContainer as unknown as AwilixContainer<Cradle>;
}
