import { asFunction, type AwilixContainer } from 'awilix';
import type { CustomerProfilePersistenceClient } from './infrastructure/persistence/CustomerProfilePersistenceClient.js';
import { PrismaCustomerProfileRepository } from './infrastructure/repositories/PrismaCustomerProfileRepository.js';

interface PrismaProviderPort {
  getClient(): CustomerProfilePersistenceClient;
}

interface CustomerProfileCradle {
  prismaProvider: PrismaProviderPort;
}

export function registerCustomerProfileModule(container: AwilixContainer): void {
  container.register({
    customerProfileRepository: asFunction(
      (cradle: CustomerProfileCradle) => new PrismaCustomerProfileRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
  });
}
