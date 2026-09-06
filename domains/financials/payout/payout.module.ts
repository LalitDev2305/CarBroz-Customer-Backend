import { asClass, type AwilixContainer } from 'awilix';
import { PrismaPartnerPayoutRepository } from './infrastructure/repositories/PrismaPartnerPayoutRepository.js';

/** registerPayoutModule is an exported domains/financials contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerPayoutModule(container: AwilixContainer): void {
  container.register({
    partnerPayoutRepository: asClass(PrismaPartnerPayoutRepository).singleton(),
  });
}
