import { IProvider } from './IProvider.js';

export interface ITransactionProvider extends IProvider {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}
