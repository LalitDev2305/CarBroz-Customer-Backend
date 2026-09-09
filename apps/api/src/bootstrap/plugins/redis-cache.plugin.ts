import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import type { ICacheProvider, IRedisClient } from '@carbroz/platform-cache';
import { AUTH_SECURITY_POLICY, type IOtpChallengeRepository } from '@carbroz/domain-identity';
import { RedisOtpChallengeRepository } from '@carbroz/platform-integrations';
import { asFunction, type AwilixContainer } from 'awilix';
import { createCacheProvider, createRedisClient } from '../cache/create-cache-provider.js';
import { AppConfig } from '../config/runtime-config.js';
import { getContainer, type Cradle } from '../container/index.js';
import { InMemoryOtpChallengeRepository } from '../testing/InMemoryOtpChallengeRepository.js';

type CacheInfrastructureCradle = Cradle & {
  cacheProvider: ICacheProvider;
  redisClient: IRedisClient;
  otpChallengeRepository: IOtpChallengeRepository;
};

/**
 * Owns the single application Redis client and cache lifecycle.
 * Development/production bind Identity OTP persistence to that same Redis client.
 * Tests bind an explicit process-local repository at the executable boundary only.
 */
export default fp(async (app: FastifyInstance) => {
  const container = getContainer() as AwilixContainer<CacheInfrastructureCradle>;

  if (AppConfig.env === 'test') {
    if (!container.hasRegistration('cacheProvider')) {
      container.register('cacheProvider', asFunction(() => createCacheProvider()).singleton());
    }
    container.register(
      'otpChallengeRepository',
      asFunction(() => new InMemoryOtpChallengeRepository()).singleton(),
    );
  } else {
    if (!container.hasRegistration('redisClient')) {
      container.register('redisClient', asFunction(createRedisClient).singleton());
    }
    if (!container.hasRegistration('cacheProvider')) {
      container.register(
        'cacheProvider',
        asFunction((cradle: CacheInfrastructureCradle) => createCacheProvider(cradle.redisClient)).singleton(),
      );
    }

    container.register(
      'otpChallengeRepository',
      asFunction(
        (cradle: CacheInfrastructureCradle) => new RedisOtpChallengeRepository(
          cradle.redisClient,
          { rateLimitWindowMs: AUTH_SECURITY_POLICY.otp.rateLimitWindowMs },
        ),
      ).singleton(),
    );
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
