import { PrismaProvider } from '@carbroz/platform-database';
import { PartnerMember } from '../../domain/PartnerMember.js';
export declare class PrismaPartnerMemberRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
    private get prisma();
    setUnitOfWork(uow: any): void;
    protected mapToDomain(entity: any): PartnerMember;
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