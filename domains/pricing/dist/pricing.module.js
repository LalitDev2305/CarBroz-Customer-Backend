import { asClass } from 'awilix';
import { PrismaPricingRepository } from './infrastructure/repositories/PrismaPricingRepository.js';
export function registerPricingModule(container) {
    container.register({
        pricingRepository: asClass(PrismaPricingRepository).singleton(),
    });
}
//# sourceMappingURL=pricing.module.js.map