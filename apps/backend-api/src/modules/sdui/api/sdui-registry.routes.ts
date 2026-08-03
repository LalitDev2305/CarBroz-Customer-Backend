import { FastifyInstance } from 'fastify';
import { diContainer } from '@fastify/awilix';
import { SduiRegistryController } from './sdui-registry.controller.js';

export async function sduiRegistryRoutes(fastify: FastifyInstance) {
  fastify.get('/registry/:screenId', async (request, reply) => {
    const useCase = diContainer.resolve('getSduiScreenUseCase') as any;
    const controller = new SduiRegistryController(useCase);
    return controller.getScreen(request, reply);
  });
}

export default sduiRegistryRoutes;
