import { asClass, type AwilixContainer } from 'awilix';
import { PrismaPricingRepository } from './infrastructure/repositories/PrismaPricingRepository.js';

/** registerPricingModule is an exported domains/catalog-pricing contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerPricingModule(container: AwilixContainer): void {
  container.register({
    pricingRepository: asClass(PrismaPricingRepository).singleton(),
  });
}
