import { diContainer } from '@fastify/awilix';
import { AdminSduiController } from './admin-sdui.controller.js';
export async function adminSduiRoutes(fastify) {
    fastify.addHook('onRequest', fastify.authenticate);
    fastify.post('/components', async (request, reply) => {
        const registerUseCase = diContainer.resolve('registerSduiComponentUseCase');
        const updateUseCase = diContainer.resolve('updateSduiScreenLayoutUseCase');
        const controller = new AdminSduiController(registerUseCase, updateUseCase);
        return controller.registerComponent(request, reply);
    });
    fastify.post('/screens', async (request, reply) => {
        const registerUseCase = diContainer.resolve('registerSduiComponentUseCase');
        const updateUseCase = diContainer.resolve('updateSduiScreenLayoutUseCase');
        const controller = new AdminSduiController(registerUseCase, updateUseCase);
        return controller.updateScreenLayout(request, reply);
    });
}
export default adminSduiRoutes;
//# sourceMappingURL=admin-sdui.routes.js.map