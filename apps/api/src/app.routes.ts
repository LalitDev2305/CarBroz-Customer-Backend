import type { FastifyInstance } from 'fastify';
import type { GetInitConfigUseCase } from '@carbroz/domain-configuration';
import { getContainer } from './container/index.js';
import { AppController } from './controllers/AppController.js';

/** Legacy splash endpoint retained as a transport-only compatibility adapter. */
export default async function appRoutes(fastify: FastifyInstance): Promise<void> {
  const getInitConfigUseCase = getContainer().resolve<GetInitConfigUseCase>('getInitConfigUseCase');
  const appController = new AppController(getInitConfigUseCase);
  fastify.get('/init', appController.init);
}
