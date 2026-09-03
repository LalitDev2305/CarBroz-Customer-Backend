import { asFunction, type AwilixContainer } from 'awilix';
import { type SduiPersistenceClient } from './infrastructure/persistence/SduiPersistenceClient.js';
import { PrismaSduiRegistryRepository } from './infrastructure/repositories/PrismaSduiRegistryRepository.js';

interface PrismaProviderPort {
  getClient(): SduiPersistenceClient;
}

interface SduiRegistryCradle {
  prismaProvider: PrismaProviderPort;
}

export function registerSduiRegistryModule(container: AwilixContainer): void {
  container.register({
    sduiRegistryRepository: asFunction(
      (cradle: SduiRegistryCradle) => new PrismaSduiRegistryRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
  });
}
