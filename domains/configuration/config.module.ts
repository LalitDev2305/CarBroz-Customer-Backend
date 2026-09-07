import { asClass, asFunction, type AwilixContainer } from 'awilix';
import type { PrismaClient } from '@prisma/client';
import type { IConfigRepository } from './domain/repositories/IConfigRepository.js';
import type { IFeatureFlagRepository } from './domain/repositories/IFeatureFlagRepository.js';
import { ConfigProvider } from './application/ConfigProvider.js';
import { FeatureFlagProvider } from './application/FeatureFlagProvider.js';
import { GetInitConfigUseCase } from './application/use-cases/GetInitConfigUseCase.js';
import { GetPartnerBootstrapUseCase } from './application/use-cases/GetPartnerBootstrapUseCase.js';
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
    // These use cases use named constructor parameters; keep their injection mode explicit even
    // though the shared container also hosts PROXY-style factory registrations above.
    getInitConfigUseCase: asClass(GetInitConfigUseCase).classic().singleton(),
    getPartnerBootstrapUseCase: asClass(GetPartnerBootstrapUseCase).classic().singleton(),
  });
}
