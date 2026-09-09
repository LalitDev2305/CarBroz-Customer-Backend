import { asClass, asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import { AuthorizationProvider } from './infrastructure/authorization/AuthorizationProvider.js';
import { NodeAuthSecurityProvider } from './infrastructure/security/NodeAuthSecurityProvider.js';
import { PrismaAdminRoleRepository } from './infrastructure/repositories/PrismaAdminRoleRepository.js';
import { PrismaPermissionRepository } from './infrastructure/repositories/PrismaPermissionRepository.js';
import { PrismaRefreshTokenRepository } from './infrastructure/repositories/PrismaRefreshTokenRepository.js';
import { PrismaRoleRepository } from './infrastructure/repositories/PrismaRoleRepository.js';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository.js';
import { PrismaUserSessionRepository } from './infrastructure/repositories/PrismaUserSessionRepository.js';

interface IdentityCradle {
  prismaProvider: {
    getClient(): PrismaClient;
  };
}

/** Registers Identity-owned repositories and security primitives in the application composition container. */
export function registerIdentityModule(container: AwilixContainer): void {
  container.register({
    authorizationProvider: asClass(AuthorizationProvider).singleton(),
    authSecurityProvider: asClass(NodeAuthSecurityProvider).singleton(),
    userRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaUserRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    userSessionRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaUserSessionRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    refreshTokenRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaRefreshTokenRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    roleRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaRoleRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    permissionRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaPermissionRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    adminRoleRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaAdminRoleRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
  });
}
