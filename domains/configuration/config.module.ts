import { asClass, asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import { FeatureFlagProvider } from './application/FeatureFlagProvider.js';
import { PrismaConfigRepository } from './infrastructure/repositories/PrismaConfigRepository.js';
import { PrismaFeatureFlagRepository } from './infrastructure/repositories/PrismaFeatureFlagRepository.js';

interface ConfigurationCradle {
  prismaProvider: {
    getClient(): PrismaClient;
  };
}

export function registerConfigModule(container: AwilixContainer): void {
  container.register({
    configRepository: asFunction(
      (cradle: ConfigurationCradle) => new PrismaConfigRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    featureFlagRepository: asFunction(
      (cradle: ConfigurationCradle) => new PrismaFeatureFlagRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    featureFlagProvider: asClass(FeatureFlagProvider).classic().singleton(),
  });
}
