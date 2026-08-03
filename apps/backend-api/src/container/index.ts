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
} from '@carbroz/database';
import { ConfigProvider } from '@carbroz/config';
import { FeatureFlagProvider } from '@carbroz/feature-flags';
import { AuthorizationProvider } from '../providers/AuthorizationProvider.js';
import { GuestLoginUseCase } from '../modules/auth/use-cases/GuestLoginUseCase.js';
import { SendOtpUseCase } from '../modules/auth/use-cases/SendOtpUseCase.js';
import { VerifyOtpUseCase } from '../modules/auth/use-cases/VerifyOtpUseCase.js';
import { RefreshTokenUseCase } from '../modules/auth/use-cases/RefreshTokenUseCase.js';
import { LogoutUseCase } from '../modules/auth/use-cases/LogoutUseCase.js';

export interface Cradle {
  prismaProvider: import('@carbroz/database').PrismaProvider;
  databaseProvider: import('@carbroz/common').IDatabaseProvider;
  transactionProvider: import('@carbroz/common').ITransactionProvider;
  repositoryFactory: import('@carbroz/database').RepositoryFactory;
  
  // Phase 4
  configRepository: import('@carbroz/common').IConfigRepository;
  featureFlagRepository: import('@carbroz/common').IFeatureFlagRepository;
  configProvider: import('@carbroz/common').IConfigProvider;
  featureFlagProvider: import('@carbroz/common').IFeatureFlagProvider;
  
  // Phase 6 & 7
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
}

let isRegistered = false;

export function getContainer(): AwilixContainer<Cradle> {
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
    });
    isRegistered = true;
  }
  return diContainer as unknown as AwilixContainer<Cradle>;
}
