import fp from 'fastify-plugin';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import { getContainer } from '../container/index.js';
export default fp(async (app) => {
    // Initialize and register the global container
    const container = getContainer();
    // Register fastify-awilix to handle request-scoped containers
    // This automatically binds request.diScope
    await app.register(fastifyAwilixPlugin, {
        disposeOnClose: true,
        disposeOnResponse: true,
        strictBooleanEnforced: true,
        injectionMode: 'CLASSIC',
    });
    // Attach the root container for global access (optional, mainly for background jobs)
    if (!app.hasDecorator('diContainer')) {
        app.decorate('diContainer', container);
    }
}, {
    name: 'di-plugin'
});
//# sourceMappingURL=di.plugin.js.map