import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import type { ICacheProvider } from '@carbroz/platform-cache';
import { asFunction, type AwilixContainer } from 'awilix';
import { createCacheProvider } from '../cache/create-cache-provider.js';
import { getContainer, type Cradle } from '../container/index.js';

type CacheInfrastructureCradle = Cradle & {
  cacheProvider: ICacheProvider;
};

/**
 * Registers and owns startup/shutdown lifecycle for the single application-level
 * cache provider. Registration is idempotent because buildApp can be created more
 * than once in deterministic tests while the canonical Awilix root is process-wide.
 */
export default fp(async (app: FastifyInstance) => {
  const container = getContainer() as AwilixContainer<CacheInfrastructureCradle>;

  if (!container.hasRegistration('cacheProvider')) {
    container.register('cacheProvider', asFunction(createCacheProvider).singleton());
  }

  const cacheProvider = container.resolve('cacheProvider');
  await cacheProvider.initialize?.();

  app.addHook('onClose', async () => {
    await cacheProvider.shutdown?.();
  });
}, {
  name: 'redis-cache-plugin',
  dependencies: ['di-plugin'],
});
