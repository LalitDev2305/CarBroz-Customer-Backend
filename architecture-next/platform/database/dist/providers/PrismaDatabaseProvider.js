export class PrismaDatabaseProvider {
    prismaProvider;
    constructor(prismaProvider) {
        this.prismaProvider = prismaProvider;
    }
    async connect() {
        await this.prismaProvider.connect();
    }
    async disconnect() {
        await this.prismaProvider.disconnect();
    }
    async health() {
        return this.prismaProvider.health();
    }
}
//# sourceMappingURL=PrismaDatabaseProvider.js.map