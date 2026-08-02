import { AwilixContainer } from 'awilix';
export interface Cradle {
    prismaProvider: import('@carbroz/database').PrismaProvider;
    databaseProvider: import('@carbroz/common').IDatabaseProvider;
    transactionProvider: import('@carbroz/common').ITransactionProvider;
    repositoryFactory: import('@carbroz/database').RepositoryFactory;
    configRepository: import('@carbroz/common').IConfigRepository;
    featureFlagRepository: import('@carbroz/common').IFeatureFlagRepository;
    configProvider: import('@carbroz/common').IConfigProvider;
    featureFlagProvider: import('@carbroz/common').IFeatureFlagProvider;
}
export declare function getContainer(): AwilixContainer<Cradle>;
