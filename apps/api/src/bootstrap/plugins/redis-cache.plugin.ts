import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import type { ICacheProvider } from '@carbroz/platform-cache';
import type { AwilixContainer } from 'awilix';
import { getContainer, type Cradle } from '../container/index.js';

type CacheInfrastructureCradle = Cradle & {
  cacheProvider: ICacheProvider;
};

/** Owns startup/shutdown lifecycle for the singleton cache infrastructure. */
export default fp(async (app: FastifyInstance) => {
  const container = getContainer() as AwilixContainer<CacheInfrastructureCradle>;
  const cacheProvider = container.resolve('cacheProvider');

  await cacheProvider.initialize?.();

  app.addHook('onClose', async () => {
    await cacheProvider.shutdown?.();
  });
}, {
  name: 'redis-cache-plugin',
  dependencies: ['di-plugin'],
});
