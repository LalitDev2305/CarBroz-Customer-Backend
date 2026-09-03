import { asClass, type AwilixContainer } from 'awilix';
import { PrismaPricingRepository } from './infrastructure/repositories/PrismaPricingRepository.js';

export function registerPricingModule(container: AwilixContainer): void {
  container.register({
    pricingRepository: asClass(PrismaPricingRepository).singleton(),
  });
}
