import type { AwilixContainer } from 'awilix';
import { registerCatalogModule } from './catalog/catalog.module.js';
import { registerPricingModule } from './pricing/pricing.module.js';

export function registerCatalogPricingModule(container: AwilixContainer): void {
  registerCatalogModule(container);
  registerPricingModule(container);
}
