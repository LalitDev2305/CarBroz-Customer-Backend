import type { AwilixContainer } from 'awilix';
import { registerCatalogModule } from './catalog/catalog.module.js';
import { registerPricingModule } from './pricing/pricing.module.js';

/** registerCatalogPricingModule is an exported domains/catalog-pricing contract/implementation; see the owning README for lifecycle and extension rules. */
export function registerCatalogPricingModule(container: AwilixContainer): void {
  registerCatalogModule(container);
  registerPricingModule(container);
}
