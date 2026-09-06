import type {
  ITransactionProvider,
  TransactionContext,
} from "@carbroz/foundation-kernel";
import { PrismaProvider } from "./PrismaProvider.js";

/** Prisma transaction infrastructure with a single opaque transaction-bound resource. */
export class PrismaTransactionProvider implements ITransactionProvider {
  constructor(private readonly prismaProvider: PrismaProvider) {}

  public async runInTransaction<T>(
    operation: (transaction: TransactionContext) => Promise<T>,
  ): Promise<T> {
    const client = this.prismaProvider.getClient();
    return client.$transaction(async (tx) => operation({ resource: tx }), {
      isolationLevel: "Serializable",
    });
  }
}
