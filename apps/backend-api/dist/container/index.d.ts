import { AwilixContainer } from 'awilix';
export interface Cradle {
    prismaProvider: import('@carbroz/database').PrismaProvider;
    databaseProvider: import('@carbroz/common').IDatabaseProvider;
    transactionProvider: import('@carbroz/common').ITransactionProvider;
    repositoryFactory: import('@carbroz/database').RepositoryFactory;
    userRepository: import('@carbroz/common').IUserRepository;
    userSessionRepository: import('@carbroz/common').IUserSessionRepository;
    guestLoginUseCase: import('../modules/auth/use-cases/GuestLoginUseCase.js').GuestLoginUseCase;
    sendOtpUseCase: import('../modules/auth/use-cases/SendOtpUseCase.js').SendOtpUseCase;
    verifyOtpUseCase: import('../modules/auth/use-cases/VerifyOtpUseCase.js').VerifyOtpUseCase;
    refreshTokenUseCase: import('../modules/auth/use-cases/RefreshTokenUseCase.js').RefreshTokenUseCase;
    logoutUseCase: import('../modules/auth/use-cases/LogoutUseCase.js').LogoutUseCase;
}
export declare function getContainer(): AwilixContainer<Cradle>;
