import { asClass, type AwilixContainer } from 'awilix';
import { PrismaSduiRegistryRepository } from './infrastructure/repositories/PrismaSduiRegistryRepository.js';

export function registerSduiRegistryModule(container: AwilixContainer): void {
  container.register({
    sduiRegistryRepository: asClass(PrismaSduiRegistryRepository).singleton(),
  });
}
