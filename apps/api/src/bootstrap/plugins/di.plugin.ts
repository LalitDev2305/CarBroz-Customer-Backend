import fp from 'fastify-plugin';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import { FastifyInstance } from 'fastify';
import { getContainer } from '../container/index.js';

export default fp(async (app: FastifyInstance) => {
  // Initialize the one canonical application container. The Fastify plugin must use this exact
  // container so request.diScope inherits every app-level registration from the composition root.
  const container = getContainer();

  await app.register(fastifyAwilixPlugin, {
    container,
    disposeOnClose: true,
    disposeOnResponse: true,
    strictBooleanEnforced: true,
  });

  // fastify-awilix decorates app.diContainer when a container is supplied. Keep this guard only as
  // a compatibility fallback for environments where that decorator is not present.
  if (!app.hasDecorator('diContainer')) {
    app.decorate('diContainer', container);
  }
}, {
  name: 'di-plugin',
});
