import { AwilixContainer } from 'awilix';
export interface Cradle {
    prismaProvider: import('@carbroz/database').PrismaProvider;
    databaseProvider: import('@carbroz/common').IDatabaseProvider;
    transactionProvider: import('@carbroz/common').ITransactionProvider;
    repositoryFactory: import('@carbroz/database').RepositoryFactory;
}
export declare function getContainer(): AwilixContainer<Cradle>;
