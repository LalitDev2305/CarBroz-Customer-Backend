export * from './providers/PrismaProvider.js';
export * from './providers/PrismaDatabaseProvider.js';
export * from './providers/PrismaTransactionProvider.js';
export * from './repositories/PrismaRepositoryBase.js';
export * from './repositories/RepositoryFactory.js';

// Core Identity Platform Repositories
export * from './repositories/PrismaUserRepository.js';
export * from './repositories/PrismaUserSessionRepository.js';
export * from './repositories/PrismaRoleRepository.js';
export * from './repositories/PrismaPermissionRepository.js';
export * from './repositories/PrismaAdminRoleRepository.js';
export * from './repositories/PrismaFeatureFlagRepository.js';
export * from './repositories/PrismaPartnerRepository.js';
export * from './repositories/PrismaPartnerMemberRepository.js';

// Corporate Bounded Context Repositories
export * from './repositories/PrismaCorporateAccountRepository.js';
export * from './repositories/PrismaCorporateMemberRepository.js';
export * from './repositories/PrismaCorporateFleetVehicleRepository.js';
export * from './repositories/PrismaCorporateCreditLedgerRepository.js';
export * from './repositories/PrismaCorporateInvoiceRepository.js';

// Domain Re-exports (Backward Compatibility Facades)
export { PrismaAddressRepository } from '@carbroz/domain-address';
export { PrismaCustomerProfileRepository } from '@carbroz/domain-customer-profile';
export { PrismaPartnerProfileRepository } from '@carbroz/domain-partner-profile';
export { PrismaKycDocumentRepository } from '@carbroz/domain-partner-kyc';
export { PrismaCatalogRepository } from '@carbroz/domain-catalog';
export { PrismaPricingRepository } from '@carbroz/domain-pricing';
export { PrismaVehicleRepository } from '@carbroz/domain-garage';
export { PrismaBookingRepository } from '@carbroz/domain-booking';
export { PrismaTrackingSessionRepository } from '@carbroz/domain-tracking';
export { PrismaPaymentRepository } from '@carbroz/domain-payment';
export { PrismaInvoiceRepository } from '@carbroz/domain-invoice';
export { PrismaPartnerPayoutRepository } from '@carbroz/domain-payout';
export { PrismaNotificationLogRepository, PrismaDeviceTokenRepository } from '@carbroz/domain-notification';
export { PrismaReviewRepository } from '@carbroz/domain-review';
export { PrismaCouponRepository, PrismaCouponUsageRepository } from '@carbroz/domain-coupon';
export { PrismaDisputeRepository } from '@carbroz/domain-dispute';
export { PrismaSduiRegistryRepository } from '@carbroz/domain-sdui-registry';
export { PrismaAuditLogRepository } from '@carbroz/domain-audit';
export { PrismaConfigRepository } from '@carbroz/domain-config';