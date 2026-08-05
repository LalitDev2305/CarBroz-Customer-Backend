import { asClass } from 'awilix';
import { PrismaSduiRegistryRepository } from './infrastructure/repositories/PrismaSduiRegistryRepository.js';
export function registerSduiRegistryModule(container) {
    container.register({
        sduiRegistryRepository: asClass(PrismaSduiRegistryRepository).singleton(),
    });
}
//# sourceMappingURL=sdui-registry.module.js.map