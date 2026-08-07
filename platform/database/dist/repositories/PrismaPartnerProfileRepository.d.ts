import { PartnerProfile, IPartnerProfileRepository } from '@carbroz/foundation-kernel';
import { PrismaProvider } from '../providers/PrismaProvider.js';
export declare class PrismaPartnerProfileRepository implements IPartnerProfileRepository {
    private readonly prismaProvider;
    constructor(prismaProvider: PrismaProvider);
    private get client();
    private mapToDomain;
    findById(id: number): Promise<PartnerProfile | null>;
    findByPartnerId(partnerId: number): Promise<PartnerProfile | null>;
    create(profile: Omit<PartnerProfile, 'id' | 'publicId' | 'createdAt' | 'updatedAt'>): Promise<PartnerProfile>;
    update(id: number, profile: Partial<PartnerProfile>): Promise<PartnerProfile>;
    delete(id: number): Promise<boolean>;
    findAll(): Promise<PartnerProfile[]>;
    save(entity: PartnerProfile): Promise<PartnerProfile>;
}
//# sourceMappingURL=PrismaPartnerProfileRepository.d.ts.map