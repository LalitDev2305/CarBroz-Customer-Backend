import { asFunction, type AwilixContainer } from 'awilix';
import type { PrismaProvider } from '@carbroz/platform-database';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository.js';
import { PrismaUserSessionRepository } from './infrastructure/repositories/PrismaUserSessionRepository.js';
import { PrismaRoleRepository } from './infrastructure/repositories/PrismaRoleRepository.js';
import { PrismaPermissionRepository } from './infrastructure/repositories/PrismaPermissionRepository.js';
import { PrismaAdminRoleRepository } from './infrastructure/repositories/PrismaAdminRoleRepository.js';

interface IdentityCradle {
  prismaProvider: PrismaProvider;
}

export function registerIdentityModule(container: AwilixContainer): void {
  container.register({
    userRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaUserRepository(cradle.prismaProvider),
    ).singleton(),
    userSessionRepository: asFunction(
      (cradle: IdentityCradle) => new PrismaUserSessionRepository(cradle.prismaProvider),
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
