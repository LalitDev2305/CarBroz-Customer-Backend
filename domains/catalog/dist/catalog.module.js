import { asClass } from 'awilix';
import { PrismaCatalogRepository } from './infrastructure/repositories/PrismaCatalogRepository.js';
export function registerCatalogModule(container) {
    container.register({
        catalogRepository: asClass(PrismaCatalogRepository).singleton(),
    });
}
//# sourceMappingURL=catalog.module.js.map