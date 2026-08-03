import { AwilixContainer } from 'awilix';
export interface Cradle {
    prismaProvider: import('@carbroz/database').PrismaProvider;
    databaseProvider: import('@carbroz/common').IDatabaseProvider;
    transactionProvider: import('@carbroz/common').ITransactionProvider;
    repositoryFactory: import('@carbroz/database').RepositoryFactory;
    configRepository: import('@carbroz/common').IConfigRepository;
    featureFlagRepository: import('@carbroz/common').IFeatureFlagRepository;
    configProvider: import('@carbroz/common').IConfigProvider;
    featureFlagProvider: import('@carbroz/common').IFeatureFlagProvider;
    userRepository: import('@carbroz/common').IUserRepository;
    userSessionRepository: import('@carbroz/common').IUserSessionRepository;
    roleRepository: import('@carbroz/common').IRoleRepository;
    permissionRepository: import('@carbroz/common').IPermissionRepository;
    adminRoleRepository: import('@carbroz/common').IAdminRoleRepository;
    authorizationProvider: import('@carbroz/common').IAuthorizationProvider;
    guestLoginUseCase: import('../modules/auth/use-cases/GuestLoginUseCase.js').GuestLoginUseCase;
    sendOtpUseCase: import('../modules/auth/use-cases/SendOtpUseCase.js').SendOtpUseCase;
    verifyOtpUseCase: import('../modules/auth/use-cases/VerifyOtpUseCase.js').VerifyOtpUseCase;
    refreshTokenUseCase: import('../modules/auth/use-cases/RefreshTokenUseCase.js').RefreshTokenUseCase;
    logoutUseCase: import('../modules/auth/use-cases/LogoutUseCase.js').LogoutUseCase;
    partnerRepository: import('@carbroz/common').IPartnerRepository;
    partnerMemberRepository: import('@carbroz/common').IPartnerMemberRepository;
    registerIndividualPartnerUseCase: import('../modules/partner/use-cases/RegisterIndividualPartnerUseCase.js').RegisterIndividualPartnerUseCase;
    registerOrganizationPartnerUseCase: import('../modules/partner/use-cases/RegisterOrganizationPartnerUseCase.js').RegisterOrganizationPartnerUseCase;
    getPartnerProfileUseCase: import('../modules/partner/use-cases/GetPartnerProfileUseCase.js').GetPartnerProfileUseCase;
    verifyPartnerUseCase: import('../modules/partner/use-cases/VerifyPartnerUseCase.js').VerifyPartnerUseCase;
}
export declare function getContainer(): AwilixContainer<Cradle>;
