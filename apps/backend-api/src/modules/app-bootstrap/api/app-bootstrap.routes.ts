import { FastifyPluginAsync } from 'fastify';
import { getContainer } from '../../../container/index.js';
import { AppBootstrapController } from './app-bootstrap.controller.js';
import { GetAppBootstrapUseCase } from '../use-cases/GetAppBootstrapUseCase.js';

export const appBootstrapRoutes: FastifyPluginAsync = async (app) => {
  const container = getContainer();

  const useCase = new GetAppBootstrapUseCase(
    container.resolve('configProvider'),
    container.resolve('featureFlagProvider'),
    container.resolve('userRepository'),
    container.resolve('userSessionRepository'),
    container.resolve('partnerMemberRepository'),
    container.resolve('partnerRepository'),
  );
  const controller = new AppBootstrapController(useCase);

  app.get('/', controller.getBootstrap);
};
