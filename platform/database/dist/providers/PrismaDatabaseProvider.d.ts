import { IDatabaseProvider } from '@carbroz/foundation-kernel';
import { PrismaProvider } from './PrismaProvider.js';
export declare class PrismaDatabaseProvider implements IDatabaseProvider {
    private prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    health(): Promise<boolean>;
}
//# sourceMappingURL=PrismaDatabaseProvider.d.ts.map