import { PrismaProvider } from '@carbroz/platform-database';
import { PartnerProfile } from '../../domain/PartnerProfile.js';
export declare class PrismaPartnerProfileRepository {
    private readonly prismaProvider;
    private unitOfWorkPrisma;
    constructor(prismaProvider: PrismaProvider);
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