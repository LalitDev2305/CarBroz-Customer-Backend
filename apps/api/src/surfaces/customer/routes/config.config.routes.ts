import type { FastifyPluginAsync } from 'fastify';
import type { GetInitConfigUseCase } from '@carbroz/domain-configuration';
import { getContainer } from '../../../bootstrap/container/index.js';
import { ConfigController } from '../controllers/config.config.controller.js';

/** Configuration HTTP transport; application orchestration is resolved from the canonical composition root. */
export const configRoutes: FastifyPluginAsync = async (app) => {
  const getInitConfigUseCase = getContainer().resolve<GetInitConfigUseCase>('getInitConfigUseCase');
  const controller = new ConfigController(getInitConfigUseCase);
  app.get('/init', controller.getInitConfig.bind(controller));
};
