import { asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import { PrismaSduiRegistryRepository } from './infrastructure/repositories/PrismaSduiRegistryRepository.js';

interface PrismaProviderPort {
  getClient(): PrismaClient;
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
