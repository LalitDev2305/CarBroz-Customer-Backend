import { asClass, asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository.js';
import { PrismaUserSessionRepository } from './infrastructure/repositories/PrismaUserSessionRepository.js';
import { PrismaRoleRepository } from './infrastructure/repositories/PrismaRoleRepository.js';
import { PrismaPermissionRepository } from './infrastructure/repositories/PrismaPermissionRepository.js';
import { PrismaAdminRoleRepository } from './infrastructure/repositories/PrismaAdminRoleRepository.js';
import { AuthorizationProvider } from './infrastructure/authorization/AuthorizationProvider.js';

interface IdentityCradle {
  prismaProvider: {
    getClient(): PrismaClient;
  };
}

/** registerIdentityModule is an exported domains/identity contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerIdentityModule(container: AwilixContainer): void {
  container.register({
    authorizationProvider: asClass(AuthorizationProvider).singleton(),
    userRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaUserRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    userSessionRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaUserSessionRepository(cradle.prismaProvider.getClient()),
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
