import { ITransactionProvider } from '@carbroz/foundation-kernel';
import { PrismaProvider } from './PrismaProvider.js';
export declare class PrismaTransactionProvider implements ITransactionProvider {
    private prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    runInTransaction<T>(operation: (transaction: unknown) => Promise<T>): Promise<T>;
}
