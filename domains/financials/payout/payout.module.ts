import { asClass, type AwilixContainer } from 'awilix';
import { PrismaPartnerPayoutRepository } from './infrastructure/repositories/PrismaPartnerPayoutRepository.js';

export function registerPayoutModule(container: AwilixContainer): void {
  container.register({
    partnerPayoutRepository: asClass(PrismaPartnerPayoutRepository).singleton(),
  });
}
