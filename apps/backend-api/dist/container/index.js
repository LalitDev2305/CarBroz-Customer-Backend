import { createContainer, asClass } from 'awilix';
import { PrismaProvider, PrismaDatabaseProvider, PrismaTransactionProvider, RepositoryFactory, PrismaUserRepository, PrismaUserSessionRepository } from '@carbroz/database';
import { GuestLoginUseCase } from '../modules/auth/use-cases/GuestLoginUseCase.js';
import { SendOtpUseCase } from '../modules/auth/use-cases/SendOtpUseCase.js';
import { VerifyOtpUseCase } from '../modules/auth/use-cases/VerifyOtpUseCase.js';
import { RefreshTokenUseCase } from '../modules/auth/use-cases/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../modules/auth/use-cases/LogoutUseCase.js';
let container;
export function getContainer() {
    if (!container) {
        container = createContainer({
            strict: true,
        });
        container.register({
            prismaProvider: asClass(PrismaProvider).classic().singleton(),
            databaseProvider: asClass(PrismaDatabaseProvider).classic().singleton(),
            transactionProvider: asClass(PrismaTransactionProvider).classic().singleton(),
            repositoryFactory: asClass(RepositoryFactory).classic().singleton(),
            // Repositories
            userRepository: asClass(PrismaUserRepository).classic().singleton(),
            userSessionRepository: asClass(PrismaUserSessionRepository).classic().singleton(),
            // Use Cases
            guestLoginUseCase: asClass(GuestLoginUseCase).classic().scoped(),
            sendOtpUseCase: asClass(SendOtpUseCase).classic().scoped(),
            verifyOtpUseCase: asClass(VerifyOtpUseCase).classic().scoped(),
            refreshTokenUseCase: asClass(RefreshTokenUseCase).classic().scoped(),
            logoutUseCase: asClass(LogoutUseCase).classic().scoped(),
        });
    }
    return container;
}
//# sourceMappingURL=index.js.map