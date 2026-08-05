import { PrismaClient } from '@prisma/client';
import { ICorporateCreditLedgerRepository, CorporateCreditLedger } from '@carbroz/common';
export declare class PrismaCorporateCreditLedgerRepository implements ICorporateCreditLedgerRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(entry: CorporateCreditLedger): Promise<CorporateCreditLedger>;
    findById(id: number): Promise<CorporateCreditLedger | null>;
    findByPublicId(publicId: string): Promise<CorporateCreditLedger | null>;
    listByAccountId(corporateAccountId: number, limit?: number, offset?: number): Promise<CorporateCreditLedger[]>;
    getLatestEntry(corporateAccountId: number): Promise<CorporateCreditLedger | null>;
}
//# sourceMappingURL=PrismaCorporateCreditLedgerRepository.d.ts.map