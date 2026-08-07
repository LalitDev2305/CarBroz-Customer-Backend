import { asClass } from 'awilix';
import { PrismaCustomerProfileRepository } from './infrastructure/repositories/PrismaCustomerProfileRepository.js';
export function registerCustomerProfileModule(container) {
    container.register({
        customerProfileRepository: asClass(PrismaCustomerProfileRepository).singleton(),
    });
}
//# sourceMappingURL=customer-profile.module.js.map