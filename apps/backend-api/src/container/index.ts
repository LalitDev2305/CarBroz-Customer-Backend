import { createContainer, AwilixContainer, asClass } from 'awilix';
import { 
  PrismaProvider, 
  PrismaDatabaseProvider, 
  PrismaTransactionProvider, 
  RepositoryFactory,
  PrismaUserRepository,
  PrismaUserSessionRepository
} from '@carbroz/database';
import { GuestLoginUseCase } from '../modules/auth/use-cases/GuestLoginUseCase.js';
import { SendOtpUseCase } from '../modules/auth/use-cases/SendOtpUseCase.js';
import { VerifyOtpUseCase } from '../modules/auth/use-cases/VerifyOtpUseCase.js';
import { RefreshTokenUseCase } from '../modules/auth/use-cases/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../modules/auth/use-cases/LogoutUseCase.js';

// Interface defining the dependencies available in the container
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

let container: AwilixContainer<Cradle>;

export function getContainer(): AwilixContainer<Cradle> {
  if (!container) {
    container = createContainer<Cradle>({
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
