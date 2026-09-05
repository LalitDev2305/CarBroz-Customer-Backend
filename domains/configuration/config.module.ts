import { asClass, asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import type { IConfigRepository } from './domain/repositories/IConfigRepository.js';
import type { IFeatureFlagRepository } from './domain/repositories/IFeatureFlagRepository.js';
import { ConfigProvider } from './application/ConfigProvider.js';
import { FeatureFlagProvider } from './application/FeatureFlagProvider.js';
import { GetInitConfigUseCase } from './application/use-cases/GetInitConfigUseCase.js';
import { PrismaConfigRepository } from './infrastructure/repositories/PrismaConfigRepository.js';
import { PrismaFeatureFlagRepository } from './infrastructure/repositories/PrismaFeatureFlagRepository.js';

interface ConfigurationCradle {
  prismaProvider: {
    getClient(): PrismaClient;
  };
  configRepository: IConfigRepository;
  featureFlagRepository: IFeatureFlagRepository;
  configProvider: ConfigProvider;
  featureFlagProvider: FeatureFlagProvider;
}

/** Registers Configuration persistence, providers and application orchestration as one bounded context. */
export function registerConfigModule(container: AwilixContainer): void {
  container.register({
    configRepository: asFunction(
      (cradle: ConfigurationCradle) => new PrismaConfigRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    featureFlagRepository: asFunction(
      (cradle: ConfigurationCradle) => new PrismaFeatureFlagRepository(cradle.prismaProvider.getClient()),
    ).singleton(),
    configProvider: asFunction(
      (cradle: ConfigurationCradle) => new ConfigProvider(cradle.configRepository),
    ).singleton(),
    featureFlagProvider: asFunction(
      (cradle: ConfigurationCradle) => new FeatureFlagProvider(cradle.featureFlagRepository),
    ).singleton(),
    // Constructor parameter names intentionally match the stable provider registrations so this
    // remains compatible with the API composition root's CLASSIC Awilix injection mode.
    getInitConfigUseCase: asClass(GetInitConfigUseCase).singleton(),
  });
}
