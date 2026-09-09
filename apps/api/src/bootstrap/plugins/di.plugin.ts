import fp from 'fastify-plugin';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import type { FastifyInstance } from 'fastify';
import { asFunction, type AwilixContainer } from 'awilix';
import type { ICacheProvider } from '@carbroz/platform-cache';
import { getContainer, type Cradle } from '../container/index.js';
import { createCacheProvider } from '../cache/create-cache-provider.js';

type CacheInfrastructureCradle = Cradle & {
  cacheProvider: ICacheProvider;
};

export default fp(async (app: FastifyInstance) => {
  // Initialize the one canonical application container. The Fastify plugin must use this exact
  // container so request.diScope inherits every app-level registration from the composition root.
  const container = getContainer();
  const cacheContainer = container as AwilixContainer<CacheInfrastructureCradle>;
  cacheContainer.register({
    cacheProvider: asFunction(createCacheProvider).singleton(),
  });

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
