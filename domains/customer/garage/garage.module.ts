import { asClass, asFunction, type AwilixContainer } from 'awilix';
import { ArchiveVehicleUseCase } from './application/use-cases/ArchiveVehicleUseCase.js';
import { CreateVehicleUseCase } from './application/use-cases/CreateVehicleUseCase.js';
import { ListCustomerVehiclesUseCase } from './application/use-cases/ListCustomerVehiclesUseCase.js';
import { SetDefaultVehicleUseCase } from './application/use-cases/SetDefaultVehicleUseCase.js';
import { type VehiclePersistenceClient } from './infrastructure/persistence/VehiclePersistenceClient.js';
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
    createVehicleUseCase: asClass(CreateVehicleUseCase).classic().scoped(),
    listCustomerVehiclesUseCase: asClass(ListCustomerVehiclesUseCase).classic().scoped(),
    setDefaultVehicleUseCase: asClass(SetDefaultVehicleUseCase).classic().scoped(),
    archiveVehicleUseCase: asClass(ArchiveVehicleUseCase).classic().scoped(),
  });
}
