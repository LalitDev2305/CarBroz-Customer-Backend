import { AppController } from './controllers/AppController.js';
export default async function appRoutes(fastify) {
    const appController = new AppController();
    // App initialization API (Splash Config)
    fastify.get('/init', appController.init);
}
//# sourceMappingURL=app.routes.js.map