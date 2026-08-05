export class PrismaTransactionProvider {
    prismaProvider;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    async runInTransaction(operation) {
        const client = this.prismaProvider.getClient();
        return client.$transaction(async (tx) => {
            return operation(tx);
        });
    }
}
//# sourceMappingURL=PrismaTransactionProvider.js.map