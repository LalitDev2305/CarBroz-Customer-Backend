import { asClass } from 'awilix';
import { PrismaAddressRepository } from './infrastructure/repositories/PrismaAddressRepository.js';
export function registerAddressModule(container) {
    container.register({
        addressRepository: asClass(PrismaAddressRepository).singleton(),
    });
}
//# sourceMappingURL=address.module.js.map