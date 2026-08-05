import { asClass, type AwilixContainer } from 'awilix';
import { PrismaVehicleRepository } from './infrastructure/repositories/PrismaVehicleRepository.js';

export function registerGarageModule(container: AwilixContainer): void {
  container.register({
    vehicleRepository: asClass(PrismaVehicleRepository).singleton(),
  });
}
