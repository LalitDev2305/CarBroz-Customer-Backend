import { asFunction, type AwilixContainer } from 'awilix';
import { type AddressPersistenceClient } from './infrastructure/persistence/AddressPersistenceClient.js';
import { PrismaAddressRepository } from './infrastructure/repositories/PrismaAddressRepository.js';

interface PrismaProviderPort {
  getClient(): AddressPersistenceClient;
}

interface AddressCradle {
  prismaProvider: PrismaProviderPort;
}

export function registerAddressModule(container: AwilixContainer): void {
  container.register({
    addressRepository: asFunction(
      (cradle: AddressCradle) => new PrismaAddressRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
  });
}
