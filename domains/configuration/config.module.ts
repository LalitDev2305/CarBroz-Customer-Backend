import { asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import type { IFeatureFlagRepository } from '@carbroz/common';
import { FeatureFlagProvider } from './application/FeatureFlagProvider.js';
import { PrismaConfigRepository } from './infrastructure/repositories/PrismaConfigRepository.js';
import { PrismaFeatureFlagRepository } from './infrastructure/repositories/PrismaFeatureFlagRepository.js';

interface ConfigurationCradle {
  prismaProvider: {
    getClient(): PrismaClient;
  };
  featureFlagRepository: IFeatureFlagRepository;
}

export function registerConfigModule(container: AwilixContainer): void {
  container.register({
    configRepository: asFunction(
      (cradle: ConfigurationCradle) => new PrismaConfigRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    featureFlagRepository: asFunction(
      (cradle: ConfigurationCradle) => new PrismaFeatureFlagRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    featureFlagProvider: asFunction(
      (cradle: ConfigurationCradle) => new FeatureFlagProvider(cradle.featureFlagRepository),
    ).singleton(),
  });
}
