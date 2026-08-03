import { CatalogController } from './catalog.controller.js';
import { diContainer } from '@fastify/awilix';
export default async function catalogRoutes(fastify) {
    const catalogController = new CatalogController(diContainer.resolve('getCatalogUseCase'), diContainer.resolve('calculateServicePriceUseCase'));
    fastify.get('/', catalogController.getCatalog.bind(catalogController));
    fastify.post('/calculate-price', catalogController.calculatePrice.bind(catalogController));
}
//# sourceMappingURL=catalog.routes.js.map