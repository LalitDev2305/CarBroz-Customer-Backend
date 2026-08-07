import { PrismaClient } from '@prisma/client';
import { ICorporateAccountRepository, CorporateAccount, CorporateAccountStatus } from '@carbroz/foundation-kernel';
export declare class PrismaCorporateAccountRepository implements ICorporateAccountRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(account: CorporateAccount): Promise<CorporateAccount>;
    update(account: CorporateAccount): Promise<CorporateAccount>;
    findById(id: number): Promise<CorporateAccount | null>;
    findByPublicId(publicId: string): Promise<CorporateAccount | null>;
    findByGstin(gstin: string): Promise<CorporateAccount | null>;
    listByStatus(status?: CorporateAccountStatus, limit?: number, offset?: number): Promise<CorporateAccount[]>;
    updateUtilisedCredit(id: number, deltaPaise: bigint): Promise<CorporateAccount>;
}
//# sourceMappingURL=PrismaCorporateAccountRepository.d.ts.map