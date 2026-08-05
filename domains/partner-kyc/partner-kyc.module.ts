import { asClass, type AwilixContainer } from 'awilix';
import { PrismaKycDocumentRepository } from './infrastructure/repositories/PrismaKycDocumentRepository.js';

export function registerPartnerKycModule(container: AwilixContainer): void {
  container.register({
    kycDocumentRepository: asClass(PrismaKycDocumentRepository).singleton(),
  });
}
