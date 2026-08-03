import { FastifyInstance } from 'fastify';
import { diContainer } from '@fastify/awilix';
import { AdminSduiController } from './admin-sdui.controller.js';

export async function adminSduiRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/components', async (request, reply) => {
    const registerUseCase = diContainer.resolve('registerSduiComponentUseCase') as any;
    const updateUseCase = diContainer.resolve('updateSduiScreenLayoutUseCase') as any;
    const controller = new AdminSduiController(registerUseCase, updateUseCase);
    return controller.registerComponent(request, reply);
  });

  fastify.post('/screens', async (request, reply) => {
    const registerUseCase = diContainer.resolve('registerSduiComponentUseCase') as any;
    const updateUseCase = diContainer.resolve('updateSduiScreenLayoutUseCase') as any;
    const controller = new AdminSduiController(registerUseCase, updateUseCase);
    return controller.updateScreenLayout(request, reply);
  });
}

export default adminSduiRoutes;
