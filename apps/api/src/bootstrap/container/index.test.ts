import { afterEach, describe, expect, it } from 'vitest';
import { asValue, type AwilixContainer } from 'awilix';
import type { ICacheProvider } from '@carbroz/platform-cache';
import { buildApp } from '../app.js';
import { getContainer, type Cradle } from './index.js';

type TestCradle = Cradle & {
  cacheProvider: ICacheProvider;
};

let app: Awaited<ReturnType<typeof buildApp>> | undefined;

afterEach(async () => {
  if (app) await app.close();
  app = undefined;
});

describe('DI Container', () => {
  it('should initialize strictly and resolve dependencies', () => {
    const container = getContainer();

    // Temporary registration for test
    container.register('dummyValue', asValue('test'));

    const resolved = container.resolve('dummyValue');
    expect(resolved).toBe('test');
  });

  it('uses the canonical root container as the parent of every request DI scope', async () => {
    const container = getContainer();
    const rootDatabaseProvider = container.resolve('databaseProvider');
    const rootPartnerBootstrapUseCase = container.resolve('getPartnerBootstrapUseCase');

    app = await buildApp();

    const cacheContainer = container as AwilixContainer<TestCradle>;
    const rootCacheProvider = cacheContainer.resolve('cacheProvider');

    app.get('/__test/di-scope', async (request) => {
      const scopedDatabaseProvider = request.diScope.resolve('databaseProvider');
      const scopedPartnerBootstrapUseCase = request.diScope.resolve('getPartnerBootstrapUseCase');
      const scopedCacheProvider = (request.diScope as AwilixContainer<TestCradle>).resolve('cacheProvider');

      return {
        sameDatabaseProvider: scopedDatabaseProvider === rootDatabaseProvider,
        samePartnerBootstrapUseCase: scopedPartnerBootstrapUseCase === rootPartnerBootstrapUseCase,
        sameCacheProvider: scopedCacheProvider === rootCacheProvider,
      };
    });

    const response = await app.inject({ method: 'GET', url: '/__test/di-scope' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      sameDatabaseProvider: true,
      samePartnerBootstrapUseCase: true,
      sameCacheProvider: true,
    });
  });
});
