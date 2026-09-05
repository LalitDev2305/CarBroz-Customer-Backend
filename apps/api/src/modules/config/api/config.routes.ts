import type { FastifyPluginAsync } from 'fastify';
import type { GetInitConfigUseCase } from '@carbroz/domain-configuration';
import { ConfigController } from './config.controller.js';

/** Configuration HTTP transport; application orchestration is resolved from the domain-owned module. */
export const configRoutes: FastifyPluginAsync = async (app) => {
  const getInitConfigUseCase = app.diContainer.resolve<GetInitConfigUseCase>('getInitConfigUseCase');
  const controller = new ConfigController(getInitConfigUseCase);
  app.get('/init', controller.getInitConfig.bind(controller));
};
