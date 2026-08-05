import { asClass } from 'awilix';
import { PrismaConfigRepository } from './infrastructure/repositories/PrismaConfigRepository.js';
export function registerConfigModule(container) {
    container.register({
        configRepository: asClass(PrismaConfigRepository).singleton(),
    });
}
//# sourceMappingURL=config.module.js.map