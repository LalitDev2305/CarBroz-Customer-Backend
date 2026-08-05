import { asClass } from 'awilix';
import { PrismaUserRepository } from './infrastructure/repositories/PrismaUserRepository.js';
import { PrismaUserSessionRepository } from './infrastructure/repositories/PrismaUserSessionRepository.js';
import { PrismaRoleRepository } from './infrastructure/repositories/PrismaRoleRepository.js';
import { PrismaPermissionRepository } from './infrastructure/repositories/PrismaPermissionRepository.js';
import { PrismaAdminRoleRepository } from './infrastructure/repositories/PrismaAdminRoleRepository.js';
export function registerIdentityModule(container) {
    container.register({
        userRepository: asClass(PrismaUserRepository).singleton(),
        userSessionRepository: asClass(PrismaUserSessionRepository).singleton(),
        roleRepository: asClass(PrismaRoleRepository).singleton(),
        permissionRepository: asClass(PrismaPermissionRepository).singleton(),
        adminRoleRepository: asClass(PrismaAdminRoleRepository).singleton(),
    });
}
//# sourceMappingURL=identity.module.js.map