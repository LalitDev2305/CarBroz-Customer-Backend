import { FastifyInstance } from 'fastify';
import { diContainer } from '@fastify/awilix';
import { AdminSduiController } from './admin-sdui.controller.js';

function getController(): AdminSduiController {
  return new AdminSduiController(
    diContainer.resolve('createSduiComponentUseCase'),
    diContainer.resolve('updateSduiScreenLayoutUseCase'),
    diContainer.resolve('createSduiDraftUseCase'),
    diContainer.resolve('updateSduiDraftUseCase'),
    diContainer.resolve('publishSduiVersionUseCase'),
    diContainer.resolve('archiveSduiVersionUseCase'),
    diContainer.resolve('rollbackSduiVersionUseCase'),
    diContainer.resolve('getSduiVersionHistoryUseCase'),
    diContainer.resolve('getSduiSpecificVersionUseCase'),
    diContainer.resolve('compareSduiVersionsUseCase'),
    diContainer.resolve('createSduiSectionUseCase'),
    diContainer.resolve('createSduiGroupUseCase'),
    diContainer.resolve('createSduiElementUseCase'),
  );
}

export async function adminSduiRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/components', async (request, reply) => getController().registerComponent(request, reply));
  fastify.post('/sections', async (request, reply) => getController().registerSection(request, reply));
  fastify.post('/groups', async (request, reply) => getController().registerGroup(request, reply));
  fastify.post('/elements', async (request, reply) => getController().registerElement(request, reply));

  fastify.post('/screens', async (request, reply) => getController().updateScreenLayout(request, reply));
  fastify.post('/screens/draft', async (request, reply) => getController().createDraft(request, reply));
  fastify.put('/screens/draft', async (request, reply) => getController().updateDraft(request, reply));
  fastify.post('/screens/publish', async (request, reply) => getController().publishVersion(request, reply));
  fastify.post('/screens/archive', async (request, reply) => getController().archiveVersion(request, reply));
  fastify.post('/screens/rollback', async (request, reply) => getController().rollbackVersion(request, reply));
  fastify.get('/screens/:screenId/history', async (request, reply) => getController().getVersionHistory(request, reply));
  fastify.get('/screens/:screenId/versions/:versionNumber', async (request, reply) => getController().getSpecificVersion(request, reply));
  fastify.get('/screens/:screenId/compare', async (request, reply) => getController().compareVersions(request, reply));
}

export default adminSduiRoutes;
