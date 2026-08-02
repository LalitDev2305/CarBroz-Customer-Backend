import { createContainer, asClass } from 'awilix';
import { PrismaProvider, PrismaDatabaseProvider, PrismaTransactionProvider, RepositoryFactory } from '@carbroz/database';
let container;
export function getContainer() {
    if (!container) {
        container = createContainer({
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
//# sourceMappingURL=index.js.map