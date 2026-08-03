import { IProvider } from './IProvider.js';
export interface ITransactionProvider extends IProvider {
    runInTransaction<T>(work: (transaction?: any) => Promise<T>): Promise<T>;
}
