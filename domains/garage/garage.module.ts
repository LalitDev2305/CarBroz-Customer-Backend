import { asFunction, type AwilixContainer } from 'awilix';
import type { VehiclePersistenceClient } from './infrastructure/persistence/VehiclePersistenceClient.js';
import { PrismaVehicleRepository } from './infrastructure/repositories/PrismaVehicleRepository.js';

interface PrismaProviderPort {
  getClient(): VehiclePersistenceClient;
}

interface GarageCradle {
  prismaProvider: PrismaProviderPort;
}

export function registerGarageModule(container: AwilixContainer): void {
  container.register({
    vehicleRepository: asFunction(
      (cradle: GarageCradle) => new PrismaVehicleRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
  });
}
