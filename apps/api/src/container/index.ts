import { diContainer } from '@fastify/awilix';
import { asClass, InjectionMode } from 'awilix';
import { PrismaProvider, PrismaDatabaseProvider } from '@carbroz/platform-database';
import { ConfigProvider } from '@carbroz/config';

export function getContainer() {
  try {
    diContainer.register({
      prismaProvider: asClass(PrismaProvider, { lifetime: 'SINGLETON' }),
      databaseProvider: asClass(PrismaDatabaseProvider, { lifetime: 'SINGLETON' }),
      configProvider: asClass(ConfigProvider, { lifetime: 'SINGLETON' }),
    });
  } catch (e) {
    // Already registered
  }
  return diContainer;
}

