import { asClass, type AwilixContainer } from 'awilix';
import { PrismaCatalogRepository } from './infrastructure/repositories/PrismaCatalogRepository.js';

export function registerCatalogModule(container: AwilixContainer): void {
  container.register({
    catalogRepository: asClass(PrismaCatalogRepository).singleton(),
  });
}
