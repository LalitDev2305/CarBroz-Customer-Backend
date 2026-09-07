import { afterEach, describe, expect, it } from 'vitest';
import { asValue } from 'awilix';
import { buildApp } from '../app.js';
import { getContainer } from './index.js';

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
    app.get('/__test/di-scope', async (request) => {
      const scopedDatabaseProvider = request.diScope.resolve('databaseProvider');
      const scopedPartnerBootstrapUseCase = request.diScope.resolve('getPartnerBootstrapUseCase');

      return {
        sameDatabaseProvider: scopedDatabaseProvider === rootDatabaseProvider,
        samePartnerBootstrapUseCase: scopedPartnerBootstrapUseCase === rootPartnerBootstrapUseCase,
      };
    });

    const response = await app.inject({ method: 'GET', url: '/__test/di-scope' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      sameDatabaseProvider: true,
      samePartnerBootstrapUseCase: true,
    });
  });
});
