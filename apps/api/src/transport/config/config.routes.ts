import { FastifyPluginAsync } from 'fastify';
import { ConfigController } from './config.controller.js';
import { GetInitConfigUseCase } from '@carbroz/domain-configuration';
import { getContainer } from '../../bootstrap/container/index.js';

export const configRoutes: FastifyPluginAsync = async (app) => {
  const container = getContainer();
  const configProvider = container.resolve('configProvider') as any;
  const featureFlagProvider = container.resolve('featureFlagProvider') as any;

  const getInitConfigUseCase = new GetInitConfigUseCase(configProvider, featureFlagProvider);
  const controller = new ConfigController(getInitConfigUseCase);

  app.get('/init', controller.getInitConfig.bind(controller));
};
