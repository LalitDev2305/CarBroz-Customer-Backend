import { PartnerMember as PrismaPartnerMember, PrismaClient } from '@prisma/client';
import { PartnerMember, IPartnerMemberRepository } from '@carbroz/common';
export declare class PrismaPartnerMemberRepository implements IPartnerMemberRepository {
    private readonly prismaClient;
    private unitOfWorkPrisma;
    constructor(prismaClient: PrismaClient);
    private get prisma();
    setUnitOfWork(uow: any): void;
    protected mapToDomain(entity: PrismaPartnerMember): PartnerMember;
    findByPublicId(publicId: string): Promise<PartnerMember | null>;
    findByUserIdAndPartnerId(userId: number, partnerId: number): Promise<PartnerMember | null>;
    findByUserId(userId: number): Promise<PartnerMember[]>;
    findByPartnerId(partnerId: number): Promise<PartnerMember[]>;
    findById(id: number): Promise<PartnerMember | null>;
    findAll(): Promise<PartnerMember[]>;
    save(entity: PartnerMember): Promise<PartnerMember>;
    create(data: Partial<PartnerMember>): Promise<PartnerMember>;
    delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=PrismaPartnerMemberRepository.d.ts.map