import { asClass, type AwilixContainer } from 'awilix';
import { PrismaCatalogRepository } from './infrastructure/repositories/PrismaCatalogRepository.js';

/** registerCatalogModule is an exported domains/catalog-pricing contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerCatalogModule(container: AwilixContainer): void {
  container.register({
    catalogRepository: asClass(PrismaCatalogRepository).singleton(),
  });
}
