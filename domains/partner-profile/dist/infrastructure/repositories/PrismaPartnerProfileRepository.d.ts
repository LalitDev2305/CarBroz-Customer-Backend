import { PrismaClient } from '@prisma/client';
import { PartnerProfile, IPartnerProfileRepository } from '@carbroz/common';
export declare class PrismaPartnerProfileRepository implements IPartnerProfileRepository {
    private readonly prismaClient;
    private unitOfWorkPrisma;
    constructor(prismaClient: PrismaClient);
    private get prisma();
    private mapToDomain;
    findByPartnerId(partnerId: number): Promise<PartnerProfile | null>;
    findByPublicId(publicId: string): Promise<PartnerProfile | null>;
    save(profile: PartnerProfile): Promise<PartnerProfile>;
    update(partnerId: number, data: Partial<PartnerProfile>): Promise<PartnerProfile>;
    delete(partnerId: number): Promise<boolean>;
    setUnitOfWork(uow: any): void;
}
//# sourceMappingURL=PrismaPartnerProfileRepository.d.ts.map