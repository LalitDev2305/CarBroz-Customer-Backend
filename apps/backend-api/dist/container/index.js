import { asClass } from 'awilix';
import { diContainer } from '@fastify/awilix';
import { PrismaProvider, PrismaDatabaseProvider, PrismaTransactionProvider, RepositoryFactory, PrismaConfigRepository, PrismaFeatureFlagRepository } from '@carbroz/database';
import { ConfigProvider } from '@carbroz/config';
import { FeatureFlagProvider } from '@carbroz/feature-flags';
let isRegistered = false;
export function getContainer() {
    if (!isRegistered) {
        diContainer.register({
            prismaProvider: asClass(PrismaProvider).singleton(),
            databaseProvider: asClass(PrismaDatabaseProvider).singleton(),
            transactionProvider: asClass(PrismaTransactionProvider).singleton(),
            repositoryFactory: asClass(RepositoryFactory).singleton(),
            configRepository: asClass(PrismaConfigRepository).singleton(),
            featureFlagRepository: asClass(PrismaFeatureFlagRepository).singleton(),
            configProvider: asClass(ConfigProvider).singleton(),
            featureFlagProvider: asClass(FeatureFlagProvider).singleton()
        });
        isRegistered = true;
    }
    return diContainer;
}
//# sourceMappingURL=index.js.map