import { FastifyInstance } from 'fastify';
import { AdminCatalogController } from './admin-catalog.controller.js';
import { diContainer } from '@fastify/awilix';

export default async function adminCatalogRoutes(fastify: FastifyInstance) {
  const controller = new AdminCatalogController(
    diContainer.resolve('manageCatalogUseCase'),
    diContainer.resolve('managePricingTierUseCase')
  );

  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/categories', controller.createCategory.bind(controller));
  fastify.post('/services', controller.createService.bind(controller));
  fastify.post('/addons', controller.createAddon.bind(controller));
  fastify.post('/pricing-tiers', controller.createPricingTier.bind(controller));
  fastify.post('/vehicle-multipliers', controller.setVehicleMultiplier.bind(controller));
}
