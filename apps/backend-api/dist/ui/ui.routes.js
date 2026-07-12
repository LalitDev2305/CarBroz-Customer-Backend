import { UIController } from './controller/UIController.js';
import { ScreenFactory } from './factory/ScreenFactory.js';
export default async function uiRoutes(fastify) {
    const factory = new ScreenFactory();
    // Dynamically load all builders from the filesystem
    await factory.initialize();
    const uiController = new UIController(factory);
    // Expose endpoint dynamically for screens
    fastify.get('/*', async (request, reply) => {
        // The wildcard match is available in request.params['*']
        const screenPath = request.params['*'];
        console.log(`[UI Routes] Wildcard route hit. screenPath: "${screenPath}"`);
        // We can map the path to screenId (e.g., 'auth/auth_login' -> 'auth_login')
        const screenId = screenPath ? screenPath.split('/').pop() : '';
        console.log(`[UI Routes] Resolved screenId: "${screenId}"`);
        request.params = { screenId };
        return uiController.getScreen(request, reply);
    });
}
//# sourceMappingURL=ui.routes.js.map