import { asFunction, type AwilixContainer } from 'awilix';
import { PrismaKycDocumentRepository } from './infrastructure/repositories/PrismaKycDocumentRepository.js';
import type { KycPersistenceClient } from './infrastructure/persistence/KycPersistenceClient.js';

interface PartnerKycCradle {
  prismaProvider: {
    getClient(): KycPersistenceClient;
  };
}

export function registerPartnerKycModule(container: AwilixContainer): void {
  container.register({
    kycDocumentRepository: asFunction(
      (cradle: PartnerKycCradle) => new PrismaKycDocumentRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
  });
}
