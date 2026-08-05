import { PrismaClient } from '@prisma/client';
import { ICorporateMemberRepository, CorporateMember } from '@carbroz/common';
export declare class PrismaCorporateMemberRepository implements ICorporateMemberRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    private mapToDomain;
    create(member: CorporateMember): Promise<CorporateMember>;
    update(member: CorporateMember): Promise<CorporateMember>;
    findById(id: number): Promise<CorporateMember | null>;
    findByPublicId(publicId: string): Promise<CorporateMember | null>;
    findByAccountAndUser(corporateAccountId: number, userId: number): Promise<CorporateMember | null>;
    findByUserId(userId: number): Promise<CorporateMember | null>;
    listByAccountId(corporateAccountId: number): Promise<CorporateMember[]>;
    delete(id: number): Promise<void>;
}
//# sourceMappingURL=PrismaCorporateMemberRepository.d.ts.map