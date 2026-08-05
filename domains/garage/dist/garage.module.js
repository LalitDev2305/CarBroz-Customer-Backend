import { asClass } from 'awilix';
import { PrismaVehicleRepository } from './infrastructure/repositories/PrismaVehicleRepository.js';
export function registerGarageModule(container) {
    container.register({
        vehicleRepository: asClass(PrismaVehicleRepository).singleton(),
    });
}
//# sourceMappingURL=garage.module.js.map