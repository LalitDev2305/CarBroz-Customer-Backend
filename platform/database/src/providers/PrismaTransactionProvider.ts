import { ITransactionProvider } from '@carbroz/foundation-kernel';
import { PrismaProvider } from './PrismaProvider.js';

export class PrismaTransactionProvider implements ITransactionProvider {
  private prismaProvider: PrismaProvider;

  constructor(prismaProvider: PrismaProvider) {
    this.prismaProvider = prismaProvider;
  }

  public async runInTransaction<T>(operation: (transaction: unknown) => Promise<T>): Promise<T> {
    const client = this.prismaProvider.getClient();
    return client.$transaction(async (tx) => {
      return operation(tx);
    });
  }
}
