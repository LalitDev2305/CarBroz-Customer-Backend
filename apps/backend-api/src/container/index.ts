import { createContainer, InjectionMode, AwilixContainer, asClass } from 'awilix';
import { PrismaProvider, PrismaDatabaseProvider, PrismaTransactionProvider, RepositoryFactory } from '@carbroz/database';

// Interface defining the dependencies available in the container
export interface Cradle {
  prismaProvider: import('@carbroz/database').PrismaProvider;
  databaseProvider: import('@carbroz/common').IDatabaseProvider;
  transactionProvider: import('@carbroz/common').ITransactionProvider;
  repositoryFactory: import('@carbroz/database').RepositoryFactory;
}

let container: AwilixContainer<Cradle>;

export function getContainer(): AwilixContainer<Cradle> {
  if (!container) {
    container = createContainer<Cradle>({
      strict: true,
    });
    
    container.register({
      prismaProvider: asClass(PrismaProvider).singleton(),
      databaseProvider: asClass(PrismaDatabaseProvider).singleton(),
      transactionProvider: asClass(PrismaTransactionProvider).singleton(),
      repositoryFactory: asClass(RepositoryFactory).singleton()
    });
  }
  return container;
}
