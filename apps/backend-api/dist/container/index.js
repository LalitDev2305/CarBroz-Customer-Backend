import { asClass } from 'awilix';
import { diContainer } from '@fastify/awilix';
import { PrismaProvider, PrismaDatabaseProvider, PrismaTransactionProvider, RepositoryFactory, PrismaConfigRepository, PrismaFeatureFlagRepository, PrismaUserRepository, PrismaUserSessionRepository, PrismaRoleRepository, PrismaPermissionRepository, PrismaAdminRoleRepository } from '@carbroz/database';
import { ConfigProvider } from '@carbroz/config';
import { FeatureFlagProvider } from '@carbroz/feature-flags';
import { AuthorizationProvider } from '../providers/AuthorizationProvider.js';
import { GuestLoginUseCase } from '../modules/auth/use-cases/GuestLoginUseCase.js';
import { SendOtpUseCase } from '../modules/auth/use-cases/SendOtpUseCase.js';
import { VerifyOtpUseCase } from '../modules/auth/use-cases/VerifyOtpUseCase.js';
import { RefreshTokenUseCase } from '../modules/auth/use-cases/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../modules/auth/use-cases/LogoutUseCase.js';
// Phase 8
import { PrismaPartnerRepository, PrismaPartnerMemberRepository } from '@carbroz/database';
import { RegisterIndividualPartnerUseCase } from '../modules/partner/use-cases/RegisterIndividualPartnerUseCase.js';
import { RegisterOrganizationPartnerUseCase } from '../modules/partner/use-cases/RegisterOrganizationPartnerUseCase.js';
import { GetPartnerProfileUseCase } from '../modules/partner/use-cases/GetPartnerProfileUseCase.js';
import { VerifyPartnerUseCase } from '../modules/partner/use-cases/VerifyPartnerUseCase.js';
// Phase 9
import { GoogleMapsProvider } from '../providers/maps/GoogleMapsProvider.js';
import { GeocodeAddressUseCase } from '../modules/maps/use-cases/GeocodeAddressUseCase.js';
import { ReverseGeocodeUseCase } from '../modules/maps/use-cases/ReverseGeocodeUseCase.js';
import { CalculateDistanceUseCase } from '../modules/maps/use-cases/CalculateDistanceUseCase.js';
// Phase 10
import { PrismaPartnerProfileRepository, PrismaKycDocumentRepository } from '@carbroz/database';
import { MinIOStorageProvider } from '../providers/storage/MinIOStorageProvider.js';
import { UploadKycDocumentUseCase } from '../modules/partner/use-cases/UploadKycDocumentUseCase.js';
import { GetPartnerKycStatusUseCase } from '../modules/partner/use-cases/GetPartnerKycStatusUseCase.js';
import { AdminReviewKycDocumentUseCase } from '../modules/admin/use-cases/AdminReviewKycDocumentUseCase.js';
import { KycController } from '../modules/partner/api/kyc.controller.js';
import { AdminKycController } from '../modules/admin/api/admin-kyc.controller.js';
import { LoggerProvider } from '../providers/LoggerProvider.js';
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
            // Phase 6 & 7 Repositories
            userRepository: asClass(PrismaUserRepository).classic().singleton(),
            userSessionRepository: asClass(PrismaUserSessionRepository).classic().singleton(),
            roleRepository: asClass(PrismaRoleRepository).classic().singleton(),
            permissionRepository: asClass(PrismaPermissionRepository).classic().singleton(),
            adminRoleRepository: asClass(PrismaAdminRoleRepository).classic().singleton(),
            // Phase 7 Providers
            authorizationProvider: asClass(AuthorizationProvider).classic().singleton(),
            // Phase 6 Use Cases
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
        });
        isRegistered = true;
    }
    return diContainer;
}
//# sourceMappingURL=index.js.map