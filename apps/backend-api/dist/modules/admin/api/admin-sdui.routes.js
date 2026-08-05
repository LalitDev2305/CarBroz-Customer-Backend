import { diContainer } from '@fastify/awilix';
import { AdminSduiController } from './admin-sdui.controller.js';
function getController() {
    return new AdminSduiController(diContainer.resolve('registerSduiComponentUseCase'), diContainer.resolve('updateSduiScreenLayoutUseCase'), diContainer.resolve('createSduiDraftUseCase'), diContainer.resolve('updateSduiDraftUseCase'), diContainer.resolve('publishSduiVersionUseCase'), diContainer.resolve('archiveSduiVersionUseCase'), diContainer.resolve('rollbackSduiVersionUseCase'), diContainer.resolve('getSduiVersionHistoryUseCase'), diContainer.resolve('getSduiSpecificVersionUseCase'), diContainer.resolve('compareSduiVersionsUseCase'), diContainer.resolve('registerSduiSubcomponentUseCase'), diContainer.resolve('registerSduiChildUseCase'), diContainer.resolve('registerSduiChildrenDataUseCase'));
}
export async function adminSduiRoutes(fastify) {
    fastify.addHook('onRequest', fastify.authenticate);
    fastify.post('/components', async (request, reply) => {
        return getController().registerComponent(request, reply);
    });
    fastify.post('/subcomponents', async (request, reply) => {
        return getController().registerSubcomponent(request, reply);
    });
    fastify.post('/children', async (request, reply) => {
        return getController().registerChild(request, reply);
    });
    fastify.post('/children-data', async (request, reply) => {
        return getController().registerChildrenData(request, reply);
    });
    fastify.post('/screens', async (request, reply) => {
        return getController().updateScreenLayout(request, reply);
    });
    fastify.post('/screens/draft', async (request, reply) => {
        return getController().createDraft(request, reply);
    });
    fastify.put('/screens/draft', async (request, reply) => {
        return getController().updateDraft(request, reply);
    });
    fastify.post('/screens/publish', async (request, reply) => {
        return getController().publishVersion(request, reply);
    });
    fastify.post('/screens/archive', async (request, reply) => {
        return getController().archiveVersion(request, reply);
    });
    fastify.post('/screens/rollback', async (request, reply) => {
        return getController().rollbackVersion(request, reply);
    });
    fastify.get('/screens/:screenId/history', async (request, reply) => {
        return getController().getVersionHistory(request, reply);
    });
    fastify.get('/screens/:screenId/versions/:versionNumber', async (request, reply) => {
        return getController().getSpecificVersion(request, reply);
    });
    fastify.get('/screens/:screenId/compare', async (request, reply) => {
        return getController().compareVersions(request, reply);
    });
}
export default adminSduiRoutes;
//# sourceMappingURL=admin-sdui.routes.js.map